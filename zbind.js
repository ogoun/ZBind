class Observe {
    source() { return this.__state; }
    get isObserved() { return true; }
    static Wrap(val, props) { return new Observe(val, props)};

    constructor(val, props) {
        this.__state = val;
        this.__props = props;
        this.__propertyChangeTriggers = {};
        this.__propertyEqualsTriggers = {};
        this.__stateChangedTriggers = [];
        this.__observer = function (target, property, value) {
            if (target[property] === value) return;
            target[property] = value;
            if (property in this.__propertyChangeTriggers) {
                this.__propertyChangeTriggers[property].forEach(function (item) {
                    if (typeof item === 'function') {
                        try {
                            item(this.__state, property, value, this.__props);
                        }
                        catch (e) {
                            console.error('[zbind.__observer.__propertyChangeTriggers] fault callback with PropertyCahnged trigger when property "' + property + '" = "' + value + '". Message: ' + e.toString());
                        }
                    }
                    else {
                        console.error('[zbind.__observer.__propertyChangeTriggers] ' + JSON.stringify(item) + ': is not a function');
                    }
                });
            }
            if (property in this.__propertyEqualsTriggers) {
                this.__propertyEqualsTriggers[property].forEach(function (item) {
                    if (item.eq === value) {
                        if (typeof item.handler === 'function') {
                            try {
                                item.handler(this.__state, property, value, this.__props);
                            }
                            catch (e) {
                                console.error('[zbind.__observer.__propertyEqualsTriggers] fault callback with PropertyEqual trigger when property "' + property + '" = "' + value + '". Message: ' + e.toString());
                            }
                        }
                        else {
                            console.error('[zbind.__observer.__propertyEqualsTriggers] ' + JSON.stringify(item.handler) + ': is not a function');
                        }
                    }
                });
            }
            if (this.__stateChangedTriggers && this.__stateChangedTriggers.length > 0) {
                this.__stateChangedTriggers.forEach(function (item, i, arr) {
                    if (typeof item === 'function') {
                        try {
                            item(this.__state, this.__props);
                        }
                        catch (e) {
                            console.error('[zbind.__observer.__stateChangedTriggers] fault callback with SateChanged trigger when property "' + property + '" = "' + value + '". Message: ' + e.toString());
                        }
                    }
                    else {
                        console.error('[zbind.__observer.__stateChangedTriggers] ' + JSON.stringify(item) + ': is not a function');
                    }
                });
            }
        };
        for (const p in val) {
            Object.defineProperty(this, p, {
                get: () => this.__state[p],
                set: (v) => this.__observer(this.__state, p, v)
            });
        }
    }
    bind(other, otherProperty, selfProperty) {
        if (!selfProperty && !otherProperty
            && other && other.isObserved === true) {
            for (const pn in this.__state) {
                other.bindReverse(this, pn, pn);
            }
        }
        else {
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
        }
        else {
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
        if(typeof callback === 'function')
        {
            this.__stateChangedTriggers.push(callback);
        }
        else{
            console.error('[zbind.__observer.stateChanged] ' + JSON.stringify(callback) + ': is not a function');
        }
    }
    propertyChanged(property, callback) {
        if(typeof callback === 'function')
        {
            if (!(property in this.__propertyChangeTriggers)) {
                this.__propertyChangeTriggers[property] = [];
            }
            this.__propertyChangeTriggers[property].push(callback);
        }
        else{
            console.error('[zbind.__observer.propertyChanged] ' + JSON.stringify(callback) + ': is not a function');
        }
    }
    propertyEqual(property, value, callback) {
        if(typeof callback === 'function')
        {
            if (!(property in this.__propertyEqualsTriggers)) {
                this.__propertyEqualsTriggers[property] = [];
            }
            this.__propertyEqualsTriggers[property].push({ eq: value, handler: callback });
        }
        else{
            console.error('[zbind.__observer.propertyEqual] ' + JSON.stringify(callback) + ': is not a function');
        }
    }
}