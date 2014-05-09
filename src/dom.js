(function() {
var elements = ['div', 'span', 'a', 'em', 'i', 'b', 'strong',
                'table', 'thead', 'tbody', 'tr', 'td', 'th',
                'input', 'label', 'select', 'option', 'form',
                'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'big',
                'small', 'sup', 'sub', 'content', 'aside'],
  selector_syntax_error = new Error(
    "Dive: expected selector-syntax string as first argument to Dive()"),
  extensions;

if (Dive) extensions = Dive;

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
    var cssParser = Dive.parseCssConfig(options.css),
      classes = cssParser.classList,
      ids = cssParser.idList;

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

// overrides dive.core/repeat
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

(function() {
  var nextIndex = function(str, start) {
    var res = _.min(_.map(['#', '.', ' '], function(sep) {
      var idx = str.indexOf(sep, start || 0);
      if (idx == -1) return str.length + 1;
      else return idx;
    }));
    return res;
  };

  var addToken = function(str, idList, classList) {
    var first = str[0];
    if (_.isEqual(first, '#'))
      idList.push(str.substr(1));
    else if (_.isEqual(first, '.'))
      classList.push(str.substr(1));
  };

  var nextToken = function(str, idList, classList) {
    var start = nextIndex(str),
        end = nextIndex(str, start + 1);

    if (end >= str.length) addToken(str, idList, classList);
    else  {
      addToken(str.substring(0, end), idList, classList);
      nextToken(str.substr(end), idList, classList);
    }
  };

  Dive.parseCssConfig = function(str, dontWarnInvalidInput) {
    var idList = [],
        classList = [];

    if (str) this._nextToken(str);
    this._idList = _.uniq(this._idList);
    this._classList = _.uniq(this._classList);

    if (!dontWarnInvalidInput && !idList.length &&
      !classList.length && str && console)
      console.warn('Css config parser: non-empty input has no valid'
                   + ' css tokens (input: "' + str + '")');

    return {
      idList: idList.join(' '),
      classList: classList.join(' ')
    };
  };
})();
  
})();
