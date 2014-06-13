node-resolve-cache
==================

Cache and reuse results of node module file name resolution algorithm

In node.js, when you require 'name' a lot of things happens under the hood.
If you have lots of modules, file name resolution itlelf adds quite a lot of time.

requiring module: (name starts with '/' or '.'):
  - try to open name. Try to open name + all registered extensions (js, .node, json, .coffee etc).
    try to open name + '/index.js' ( and all registered extensions)

requiring package:
  - try to read and parse `node_modules/package.json` (sometimes large, due to included README)
  - try to locate main script. Repeat all steps as in 'require module'
  - if not found, repeat in all parent folders up to root.
  - if not found, search in all NODE_PATH paths

Which all often adds up as thousands of syscalls, exceptions and startup time milliseconds. (Exceptions part also not very nice because it makes harder to use `breakOnException` debugger commmand - you need to skip all requires as most of them thow exceptions internally)

This module allows you to save all results of this lookup process and re-use it for later restarts.

### Usage

Install:

```
npm install --save resolve-cache
```

At the beginning of your script insert

```js
   require('resolve-cache')(__dirname + '/resolve-cache.json');
```

Uou can use any name instead of `resolve-cache.json`. If this file exist, it's data is used for name resolution. If it does not exist, all resolved names are dubped to it  on process exit. To refresh cache just delete this file and it'll be regenerated.

### Caveats

There is no easy way to efficiently check at runtime if cached data is still relevant. If you move your files AND use them under same name you should refresh cache. Example:

```js
   var a = require('./foo');

   // ./foo.js:
   module.exports = 1
```

- if you decide to refactor 'foo.js' into 'foo' folder + 'foo/index.js' you need to clean resolve cache.

### See also:
  - [time-require](https://github.com/jaguard/time-require) - profile require time
