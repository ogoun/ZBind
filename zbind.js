class Observe {
    source() {
        return this.__state;
    }
    get isObserved() {
        return true;
    }
    static Wrap(val, props) {
        return new Observe(val, props)
    };

    constructor(val, props) {
        this.__state = val;
        this.__props = props;
        this.__propertyChangeTriggers = {};
        this.__propertyEqualsTriggers = {};
        this.__stateChangedTriggers = [];

        let observer = this;

        this.__observer = function (target, property, value) {
            if (target[property] === value) return;
            target[property] = value;
            if (property in observer.__propertyChangeTriggers) {
                observer.__propertyChangeTriggers[property].forEach(function (item) {
                    if (typeof item === 'function') {
                        try {
                            item(observer.__state, property, value, observer.__props);
                        } catch (e) {
                            console.error('[zbind.__observer.__propertyChangeTriggers] fault callback with PropertyCahnged trigger when property "' + property + '" = "' + value + '". Message: ' + e.toString());
                        }
                    } else {
                        console.error('[zbind.__observer.__propertyChangeTriggers] ' + JSON.stringify(item) + ': is not a function');
                    }
                });
            }
            if (property in observer.__propertyEqualsTriggers) {
                observer.__propertyEqualsTriggers[property].forEach(function (item) {
                    if (item.eq === value) {
                        if (typeof item.handler === 'function') {
                            try {
                                item.handler(observer.__state, property, value, observer.__props);
                            } catch (e) {
                                console.error('[zbind.__observer.__propertyEqualsTriggers] fault callback with PropertyEqual trigger when property "' + property + '" = "' + value + '". Message: ' + e.toString());
                            }
                        } else {
                            console.error('[zbind.__observer.__propertyEqualsTriggers] ' + JSON.stringify(item.handler) + ': is not a function');
                        }
                    }
                });
            }
            if (observer.__stateChangedTriggers && observer.__stateChangedTriggers.length > 0) {
                observer.__stateChangedTriggers.forEach(function (item, i, arr) {
                    if (typeof item === 'function') {
                        try {
                            item(observer.__state, observer.__props);
                        } catch (e) {
                            console.error('[zbind.__observer.__stateChangedTriggers] fault callback with SateChanged trigger when property "' + property + '" = "' + value + '". Message: ' + e.toString());
                        }
                    } else {
                        console.error('[zbind.__observer.__stateChangedTriggers] ' + JSON.stringify(item) + ': is not a function');
                    }
                });
            }
        };
        for (const p in val) {
            Object.defineProperty(this, p, {
                get: () => observer.__state[p],
                set: (v) => observer.__observer(observer.__state, p, v)
            });
        }
    }
    bind(other, otherProperty, selfProperty) {
        if (!selfProperty && !otherProperty &&
            other && other.isObserved === true) {
            for (const pn in this.__state) {
                other.bindReverse(this, pn, pn);
            }
        } else {
            if (!selfProperty) {
                selfProperty = otherProperty;
            }
            if (other.isObserved === true && selfProperty in this.__state) {
                other.propertyChanged(otherProperty, (s, p, v, pr) => this.__state[selfProperty] = v);
            }
        }
    }
    bindReverse(other, otherProperty, selfProperty) {
        if (!selfProperty) {
            selfProperty = otherProperty;
        }
        if (selfProperty in this.__state) {
            this.propertyChanged(selfProperty, (s, p, v, pr) => other.source()[otherProperty] = v);
        }
    }
    bindTwoWay(other, otherProperty, selfProperty) {
        if (!otherProperty && !selfProperty) {
            if (other && other.isObserved === true) {
                for (const pn in this.__state) {
                    other.bindReverse(this, pn, pn);
                }
                other.bind(this);
            }
        } else {
            if (!selfProperty) {
                selfProperty = otherProperty;
            }
            if (other.isObserved === true && selfProperty in this.__state) {
                other.propertyChanged(otherProperty, (s, p, v, pr) => this[selfProperty] = v);
                this.propertyChanged(selfProperty, (s, p, v, pr) => other.source()[otherProperty] = v);
            }
        }
    }
    stateChanged(callback) {
        if (typeof callback === 'function') {
            this.__stateChangedTriggers.push(callback);
        } else {
            console.error('[zbind.__observer.stateChanged] ' + JSON.stringify(callback) + ': is not a function');
        }
    }
    propertyChanged(property, callback) {
        if (typeof callback === 'function') {
            if (!(property in this.__propertyChangeTriggers)) {
                this.__propertyChangeTriggers[property] = [];
            }
            this.__propertyChangeTriggers[property].push(callback);
        } else {
            console.error('[zbind.__observer.propertyChanged] ' + JSON.stringify(callback) + ': is not a function');
        }
    }
    propertyEqual(property, value, callback) {
        if (typeof callback === 'function') {
            if (!(property in this.__propertyEqualsTriggers)) {
                this.__propertyEqualsTriggers[property] = [];
            }
            this.__propertyEqualsTriggers[property].push({
                eq: value,
                handler: callback
            });
        } else {
            console.error('[zbind.__observer.propertyEqual] ' + JSON.stringify(callback) + ': is not a function');
        }
    }
}

class UIBinder {
    static BindInputTextToOjbect(item, obj, field) {
        const typeHandler = function (e) {
            obj[field] = e.target.value;
        }
        item.addEventListener('input', typeHandler) // register for oninput
        item.addEventListener('propertychange', typeHandler) // for IE8
    };

    static BindInputTextToOjbect(item, obj, field, converter) {
        const typeHandler = function (e) {
            obj[field] = converter(e.target.value);
        }
        item.addEventListener('input', typeHandler) // register for oninput
        item.addEventListener('propertychange', typeHandler) // for IE8
    };

    static BindObjectToElement(element, obj, field) {
        if (!obj) return;
        var source = obj;
        if (obj.isObserved !== true) {
            source = Observe.Wrap(obj);
        }
        source.propertyChanged(field, (s, p, v, props) => {
            element.textContent = v;
        });
    }

    static Click(element, handler) {
        elem.onclick = handler;
    }
}

class Ajax {
    static sendRequest(url, callback, fallback, data) {
        var req = GetXHR();
        if (!req) return;
        var method = (data) ? "POST" : "GET";
        if (data && typeof (data) === 'object') {
            var y = '',
                e = encodeURIComponent;
            for (x in data) {
                y += '&' + e(x) + '=' + e(data[x]);
            }
            data = y.slice(1) + (!cache ? '&_t=' + new Date : '');
        }
        req.open(method, url, true);
        if (data)
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        req.onreadystatechange = function () {
            if (req.readyState != 4) return;
            if (req.status != 200 && req.status != 304) {
                log.error('HTTP error ' + req.status);
                fallback(req.status);
                return;
            }
            callback(req.responseText);
        }
        if (req.readyState == 4) return;
        req.send(data);
    };
    
    static get(url, callback) {
        var req = GetXHR();
        if (!req) return;
        req.open("GET", url, true);
        req.onreadystatechange = function () {
            if (req.readyState != 4) return;
            if (req.status != 200 && req.status != 304) {
                log.error('HTTP error ' + req.status);
                fallback(req.status);
                return;
            }
            callback(req.responseText);
        }
        if (req.readyState == 4) return;
        req.send(null);
    };

    static _xhr;

    static GetXHR() {
        if (!_xhr) {
            try {
                _xhr = new XMLHttpRequest();
            } catch (e) {}
        }
        if (!_xhr) {
            try {
                _xhr = new ActiveXObject("Msxml3.XMLHTTP");
            } catch (e) {}
        }
        if (!_xhr) {
            try {
                _xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (e) {}
        }
        if (!_xhr) {
            try {
                _xhr = new ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (e) {}
        }
        if (!_xhr) {
            try {
                _xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {}
        }
        if (!_xhr) {
            try {
                _xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
        return _xhr;
    };
}
