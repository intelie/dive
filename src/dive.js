(function() {
window.Dive || (window.Dive = {});
var elements = ['div', 'span', 'a', 'em', 'i', 'b', 'strong',
                'table', 'tr', 'td', 'th'];
    
Dive.identity = function(i) { return i; };

var appendContent = function(parent, content) {
    if (!content) return;
    else if (content.nodeName) parent.appendChild(content);
    else if (content instanceof Array)
        for (var i = 0; i < content.length; i++)
            appendContent(parent, content[i]);
    else parent.innerHTML += content;
};

var createElement = function(type, args) {
    var el = document.createElement(type),
        first = args[0];
    switch (args.length) {
        case 0: break;
        case 1: appendContent(el, first);
                break;
        default:
        var start = 0;
        if (typeof first == 'object' && !first.nodeName && !(first instanceof Array)) {
            if (first.hasOwnProperty('when') && !first.when) return null;
            if (first.css) {
                var cssParser = new Holmes.CssConfigParser(first.css);
                el.className = cssParser.classList();
                el.setAttribute('id', cssParser.idList());
            }

            start = 1;
        }

        for (var i = start; i < args.length; i++) {
            appendContent(el, args[i]);
        }
    }
    return el;
};
            
for (var i = 0; i < elements.length; i++)
    (function(type) {
        Dive[type] = function() { return createElement(type, arguments); };
    })(elements[i]);

Dive.map = function(f, coll) {
    if (coll == undefined)
        return function(coll2) { return Dive.map(f, coll2); };

    var results = [];
    for (var i = 0; i < coll.length; i++) {
        var mapped = f(coll[i]);
        if (mapped) results.push(mapped);
    }
    return results;
};
    
Dive.filter = function(f, coll) {
    if (coll == undefined)
        return function(coll2) { return Dive.filter(f, coll2); };

    var results = [];
    for (var i = 0; i < coll.length; i++)
        if (f(coll[i])) results.push(coll[i]);
    return results;
};
    
Dive.mapSome = function(f, coll) {
    if (coll == undefined)
        return function(coll2) { return Dive.mapSome(f, coll2); };

    return Dive.map(f, Dive.filter(function(c) {
        return c != null && c != undefined;
    }, coll));
};
    
Dive.take = function(n, coll) {
    if (coll == undefined)
        return function(coll2) { return Dive.take(n, coll2); };
    return coll.slice(0, n - 1);
};

Dive.takeWhile = function(f, coll) {
    if (coll == undefined)
        return function(coll2) { return Dive.takeWhile(f, coll2); };
    var n = 0;
    while (f(coll[i])) n++;
    return coll.slice(0, n);
};
    
Dive.thread = function(val) {
    if (arguments.length <= 1) return val;
    var result = val;
    for (var i = 1; i < arguments.length; i++) {
        var fn = arguments[i];
        if (typeof fn != "function")
            throw new Error("Dive: thread argument " + i + "is not a function");
        else result = fn(result);
    }
    return result;
};

})();
