var config = {};

config.welcome = {
  get version () {return app.storage.read("version")},
  set version (val) {app.storage.write("version", val)}
};

config.notifications = {
  set show (val) {app.storage.write("notifications", val)},
  get show () {return app.storage.read("notifications") !== undefined ? app.storage.read("notifications") : true}
};

config.get = function (name) {return name.split('.').reduce(function (p, c) {return p[c]}, config)};

config.set = function (name, value) {
  function set(name, value, scope) {
    name = name.split('.');
    if (name.length > 1) set.call((scope || this)[name.shift()], name.join('.'), value);
    else this[name[0]] = value;
  }
  /*  */
  set(name, value, config);
};
