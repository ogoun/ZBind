function correct(predicate, message) {
    if (!message) message = '';
    if (typeof predicate === 'function') {
        if (predicate()) console.log("[Success] " + message);
        else console.error("[Fault] " + message);
    }
    else {
        if (predicate) console.log("[Success] " + message);
        else console.error("[Fault] " + message);
    }
}

console.log('Event tests');
console.log('Property change');
console.log('----------------------------');
var x = Observe.Wrap({ line: 'line', number: 0 });
x.propertyChanged('line', (s, p, v, pr) => { console.log("Property [" + p + "] = '" + v + "'"); })
x.propertyChanged('number', (s, p, v, pr) => console.log("Property [" + p + "] = '" + v + "'"))
x.line = 'New line';
x.number = 11;
console.log('----------------------------');
console.log('Property equals');
console.log('----------------------------');
var y = Observe.Wrap({ line: 'line', number: 0 });
y.propertyEqual('line', 'hello', (s, p, v, pr) => console.log("Property [" + p + "] EQ '" + v + "'"))
y.propertyEqual('number', 13, (s, p, v, pr) => console.log("Property [" + p + "] EQ '" + v + "'"))
y.line = 'New line';
y.number = 11;
y.line = 'hello';
y.number = 13;
console.log('----------------------------');
console.log('State changing');
console.log('----------------------------');
var z = Observe.Wrap({ line: 'line', number: 0 });
z.stateChanged(() => console.log("State changed"))
z.line = 'New line';
z.number = 11;
console.log('----------------------------');
console.log('----------------------------');
console.log('Binding tests');
console.log('All properties one way');
console.log('----------------------------');
var x1 = Observe.Wrap({ title: "One", data: 1 });
var x2 = Observe.Wrap({ title: "Two", data: 2 });
x1.bind(x2);
x1.title = 'test';
correct(x2.title === 'Two', 'No binded');
x2.title = 'world';
correct(x1.title === 'world', "Binded");
x1 = null;
x2 = null;
console.log('----------------------------');
console.log('Two way binding');
console.log('----------------------------');
x1 = Observe.Wrap({ title: "One", data: 1 });
x2 = Observe.Wrap({ title: "Two", data: 2 });
x1.bindTwoWay(x2);
x1.data = 10;
correct(x2.data == 10);
x2.data = 20;
correct(x1.data == 20);
x1.title = 't1';
correct(x2.title == 't1');
x1 = null;
x2 = null;
console.log('----------------------------');
console.log('Property binding');
console.log('----------------------------');
x1 = Observe.Wrap({ title: "One", data: 1 });
x2 = Observe.Wrap({ title: "Two", data: 2 });
x1.bind(x2, "title");
x1.bindTwoWay(x2, "data");
x2.title = "test";
correct(x1.title == 'test');
x1.title = 't';
correct(x2.title == 'test');
x1.data = 100;
correct(x2.data == 100);
x2.data = 200;
correct(x1.data == 200);