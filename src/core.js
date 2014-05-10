(function() {
var plugins = [];
if (Dive && Dive.plugins) plugins = Dive.plugins;

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

  var arr = new Array(n);
  for (var i = 0; i < n; i++)
    arr[i] = val;
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

for (var p = 0; p < plugins.length; p++) {
  if (typeof plugins[p] === 'function') plugins[p]();
}

})();
