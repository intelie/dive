(function() {
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

})();
