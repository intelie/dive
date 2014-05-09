(function() {
var elements = ['div', 'span', 'a', 'em', 'i', 'b', 'strong',
                'table', 'thead', 'tbody', 'tr', 'td', 'th',
                'input', 'label', 'select', 'option', 'form',
                'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'big',
                'small', 'sup', 'sub', 'content', 'aside'],
    selector_syntax_error = new Error(
        "Dive: expected selector-syntax string as first argument to Dive()"),
    extensions,
    plugins = [];

if (Dive) {
    extensions = Dive;
    if (Dive.plugins) plugins = Dive.plugins;
}

window.Dive = function() {
    var first = arguments[0];
    if (typeof first !== 'string') throw selector_syntax_error;

    var i, type, opts = {},
        args = [], nestArgs = [],
        nest = first.indexOf(' > ');

    if (nest != -1) {
        for (i = 1; i < arguments.length; i++) nestArgs.push(arguments[i]);
        opts.appendContent = Dive.apply(
            undefined, [first.substr(nest + 3)].concat(nestArgs));
        first = first.substr(0, nest);
    } else for (i = 1; i < arguments.length; i++) args.push(arguments[i]);

    var idx = first.search(/[\.#]/);
    if (idx == -1) type = first;
    else if (idx == 0) type = 'div';
    else {
        type = first.substr(0, idx);
        first = first.substr(idx);
    }

    opts.css = first;
    if (elements.indexOf(type) != -1) {
        return createElement(type, args , opts);
    }
    else throw selector_syntax_error;
};

Dive.identity = function(i) { return i; };
Dive.into = function(dest_, orig_, mergeStrategy) {
    var opt,
        dest = dest_ || {},
        orig = orig_ || {};

    switch (mergeStrategy) {
    case 'add':
        for (opt in orig)
            if (orig.hasOwnProperty(opt)) {
                if (dest.hasOwnProperty(opt))
                    dest[opt] += orig[opt];
                else dest[opt] = orig[opt];
            }
        break;
    default:
        for (opt in orig)
            if (orig.hasOwnProperty(opt))
                dest[opt] = orig[opt];
        break;
    }
    return dest;
};

Dive.into(Dive, extensions);

var appendContent = function(parent, content) {
    if (content == undefined || content == null || typeof content === "boolean")
        return;
    else if (content.nodeName) parent.appendChild(content);
    else if (content instanceof Array)
        for (var i = 0; i < content.length; i++)
            appendContent(parent, content[i]);
    else parent.innerHTML += content;
};

var gotOptions = function(arg) {
    return arg && typeof arg === 'object'
        && !arg.nodeName && !(Array.isArray(arg));
};

var processOptionsHooks = [];
Dive.processOptionsHook = function(hook) {
    if (typeof hook !== 'function') throw new Error(
        'Dive.processOptionsHook expects a hook function as argument');
    processOptionsHooks.push(hook);
};

var processOptions = function(el, options, content) {
    var i;
    for (i = 0; i < processOptionsHooks.length; i++)
        processOptionsHooks[i](el, options, content);

    if (options.hasOwnProperty('when') && !options.when) return null;
    if (options.prependContent) content.unshift(options.prependContent);
    if (options.appendContent) content.push(options.appendContent);
    for (i = 0; i < content.length; i++)
        appendContent(el, content[i]);

    if (options.attr)
        for (var attr in options.attr)
            if (options.attr.hasOwnProperty(attr))
                el.setAttribute(attr, options.attr[attr]);

    if (options.data)
        for (var datum in options.data)
            if (options.data.hasOwnProperty(datum))
                el.setAttribute('data-' + datum, options.data[datum]);

    var styleString = '';
    if (options.style)
        for (var style in options.style)
            if (options.style.hasOwnProperty(style))
                styleString += style + ': ' + options.style[style] + '; ';
    if (styleString) el.setAttribute('style', styleString);

    var attrs = ['href', 'value', 'type'];
    for (i = 0; i < attrs.length; i++)
        if (options[attrs[i]]) el.setAttribute(attrs[i], options[attrs[i]]);

    if (options.css) {
        var cssParser = new Holmes.CssConfigParser(options.css),
            classes = cssParser.classList(),
            ids = cssParser.idList();

        if (classes) el.className = classes;
        if (ids) el.setAttribute('id', ids);
    }
    return el;
};

var createElement = function(type, args, extraOptions) {
    var el = document.createElement(type);
    if (args.length || extraOptions) {
        var first = args[0],
            start = 0,
            options;

        if (gotOptions(first)) {
            options = first;
            start = 1;
        }

        if (extraOptions) options = Dive.into(options, extraOptions, 'add');
        if (options) {
            var rest = [];
            for (var i = start; i < args.length; i++) rest.push(args[i]);
            el = processOptions(el, options, rest);
            if (!el) return null;
        } else {
            for (var j = 0; j < args.length; j++) appendContent(el, args[j]);
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
        f.$index = i;
        results.push(f.call(f, coll[i]));
    }
    delete f.$index;
    return results;
};

Dive.filter = function(f, coll) {
    if (coll == undefined)
        return function(coll2) { return Dive.filter(f, coll2); };

    var results = [];
    for (var i = 0; i < coll.length; i++) {
        f.$index = i;
        if (f(coll[i])) results.push(coll[i]);
    }
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
        if (n == undefined || n == null) return Dive.identity;
        else return function(coll2) { return Dive.take(n, coll2); };

    if (n == undefined || n == null) return coll;
    else return coll.slice(0, n);
};

Dive.takeWhile = function(f, coll) {
    if (coll == undefined)
        return function(coll2) { return Dive.takeWhile(f, coll2); };
    var n = 0;
    while (f(coll[i])) n++;
    return coll.slice(0, n);
};

Dive.repeat = function(n, val) {
    if (val == undefined)
        return function(val2) { return Dive.repeat(n, val2); };

    var getVal;
    // if val is an html node, we need to clone it each time,
    // otherwise it will be just one object on the DOM.
    if (val.nodeName) getVal = function() { return val.cloneNode(true); };
    else getVal = function() { return val; };

    var arr = new Array(n);
    for (var i = 0; i < n; i++)
        arr[i] = getVal();
    return arr;
};

Dive.pipe = function(val) {
    if (arguments.length <= 1) return val;
    var result = val;
    for (var i = 1; i < arguments.length; i++) {
        var fn = arguments[i];
        if (typeof fn !== "function")
            throw new Error("Dive: pipe argument " + i + "is not a function");
        else result = fn(result);
    }
    return result;
};

Dive.bindOptions = function() {
    var options, divefn, mergeStrategy;
    switch (arguments.length) {
        case 2:
        options = arguments[0];
        mergeStrategy = 'replace';
        divefn = arguments[1];
        break;
        case 3:
        options = arguments[0];
        mergeStrategy = arguments[1];
        divefn = arguments[2];
        break;
    }

    return function() {
        var finalOptions = options,
            args = [];

        if (arguments.length) {
            var first = arguments[0],
                start = 0;

            if (gotOptions(first)) {
                start = 1;
                Dive.into(finalOptions, first, mergeStrategy);
            }

            for (var i = start; i < arguments.length; i++)
                args.push(arguments[i]);
        }

        return divefn.apply(undefined, [finalOptions].concat(args));
    };
};

var register_dep = function(ctx, dependants) {
    if (ctx) {
        var alreadyRegistered = false;
        for (var k = 0; k < dependants.length; k++)
            if (ctx.id === dependants[k].id) {
                alreadyRegistered = true;
                break;
            }
        if (!alreadyRegistered) {
            //ctx.deps.push(fn);
            dependants.push(ctx);
        }
    }
};

var dirty_dependants = function(dependants, triggererContext) {
    for (var i = 0; i < dependants.length; i++) {
        var ctx = dependants[i];
        // dirtying the triggerer context (if any) would set us up for
        // a vicious cycle.
        if (triggererContext && ctx.id === triggererContext.id)
            continue;

        ctx.dirty = true;
        if (ctx)
            switch (ctx.type) {
            case 'lazy':
                break;
            case 'batch':
                if (ctx.timeout) clearTimeout(ctx.timeout);
                ctx.timeout = setTimeout(function() {
                    console.info('hey');
                    ctx.update(); });
                break;
            case 'defer':
                setTimeout(ctx.update, 0);
                break;
            default:
                ctx.update();
                break;
            }
    }
};

Dive.cell = function(initialValue) {
    var cell = initialValue,
        dependants = [],
        fn = function(setValue) {
            if (setValue == undefined) {
                register_dep(arguments.callee.caller.$dive_ctx, dependants);
                return cell;
            } else {
                if (cell != setValue) {
                    cell = setValue;
                    dirty_dependants(dependants,
                                     arguments.callee.caller.$dive_ctx);
                }
                return setValue;
            }
        };
    return fn;
};

var idInc = 0,
    lastStamp,
    genId = function() {
        var stamp = new Date().getTime().toString();
        if (stamp === lastStamp) idInc++;
        else idInc = 0;
        lastStamp = stamp;

        var inc = idInc.toString(),
            n = stamp.length - inc.length;

        if (inc < 0) throw new Error("You've overflown Dive's id generation.");
        return stamp + Dive.repeat(n, '0').join('') + inc;
    };

var generateContext = function(type) {
    return {
        id: genId(),
        //dps: [],
        type: type,
        dirty: false
    };
};

Dive.cellf = function() {
    var context, type;
    if (arguments.length == 1) {
        type = 'eager',
        context = arguments[0];
    } else if (arguments.length > 1) {
        type = arguments[0];
        context = arguments[1];
    } else throw new Error("Dive.cellf can't take no arguments.");
    if (typeof context !== 'function') throw new Error(
        'Dive.cellf expected a function as sole argument');


    context.$dive_ctx = generateContext(type);
    var computed, dependants = [];

    if (type == 'defer')
        setTimeout(function() {
            computed = context.call(context);
        });
    else computed = context.call(context);

    var update = function() {
        register_dep(arguments.callee.caller.$dive_ctx, dependants);

        if (context.$dive_ctx.dirty) {
            context.$dive_ctx.dirty = false;
            computed = context.call(context);
            dirty_dependants(dependants);
        }
        return computed;
    };

    context.$dive_ctx.update = update;
    return update;
};

Dive.autorun = function(context) { return Dive.cellf('eager', context); };

for (var p = 0; p < plugins.length; p++) {
    if (typeof plugins[p] === 'function') plugins[p]();
}

})();
