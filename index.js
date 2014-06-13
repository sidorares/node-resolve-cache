var fs = require('fs');
var Module = require('module');

module.exports = function(cacheName) {

  var natives = Object.keys(process.binding('natives'));
  var isNative = {};
  natives.forEach(function(name) { isNative[name] = true });

  var _oldResolve = Module._resolveFilename;

  var resolveCache = {};
  if (fs.existsSync(cacheName)) {
    resolveCache = JSON.parse(fs.readFileSync(cacheName, 'utf8'));
    // use cached data
    Module._resolveFilename = function(request, parent) {
      if (isNative[request])
        return request;

      var m = resolveCache[parent.filename];
      if (!m)
        return _oldResolve.call(this, request, parent);
      var r = m[request];
      if (!r)
        return _oldResolve.call(this, request, parent);
      return r;
    };
  } else {
    // record resolve data
    Module._resolveFilename = function(request, parent) {
      if (isNative[request])
        return request;
      var fn = _oldResolve.call(this, request, parent);
      var key;
      if (!resolveCache[parent.filename]) {
        key = {};
        key[request] = fn;
        resolveCache[parent.filename] = key
        return fn;
      }
      resolveCache[parent.filename][request] = fn;
      return fn;
    }
    process.once('exit', function() {
      fs.writeFileSync(cacheName, JSON.stringify(resolveCache, null, 4));
    });
  };
}

