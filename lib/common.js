window.setTimeout(function () {
  var version = config.welcome.version;
  if (!version) {
    app.tab.open(app.homepage() + "?v=" + app.version() + "&type=install");
    config.welcome.version = app.version();
  }
}, 3000);

app.options.receive("get-storage", function (pref) {
  app.options.send("set-storage", {"pref": pref, "value": config.get(pref)});
});

app.options.receive("change-storage", function (o) {
  config.set(o.pref, o.value);
  app.options.send("set-storage", {"pref": o.pref, "value": config.get(o.pref)});
});

app.content_script.receive("fingerprint", function (e) {
  if (config.notifications.show) {
    var a = "Possible canvas fingerprinting is detected!";
    var b = "Your browser is reporting a fake value.";
    app.notifications.create(e.host + "\n" + a + "\n" + b);
  }
});
