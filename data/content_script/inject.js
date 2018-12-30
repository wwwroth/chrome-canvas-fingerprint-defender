var background = (function () {
  var _tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in _tmp) {
      if (_tmp[id] && (typeof _tmp[id] === "function")) {
        if (request.path === 'background-to-page') {
          if (request.method === id) _tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {_tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": 'page-to-background', "method": id, "data": data})}
  }
})();

var inject = function () {
  var overwrite = function (name) {
    const OLD = HTMLCanvasElement.prototype[name];
    Object.defineProperty(HTMLCanvasElement.prototype, name, {
      "value": function () {
        var shift = {
          'r': Math.floor(Math.random() * 10) - 5,
          'g': Math.floor(Math.random() * 10) - 5,
          'b': Math.floor(Math.random() * 10) - 5,
          'a': Math.floor(Math.random() * 10) - 5
        };
        var width = this.width, height = this.height, context = this.getContext("2d");
        var imageData = context.getImageData(0, 0, width, height);
        for (var i = 0; i < height; i++) {
          for (var j = 0; j < width; j++) {
            var n = ((i * (width * 4)) + (j * 4));
            imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
            imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
            imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
            imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
          }
        }
        window.top.postMessage("canvas-fingerprint-defender-alert", '*');
        context.putImageData(imageData, 0, 0);
        return OLD.apply(this, arguments);
      }
    });
  };
  overwrite('toBlob');
  overwrite('toDataURL');
  document.documentElement.dataset.cbscriptallow = true;
};

var script_1 = document.createElement('script');
script_1.textContent = "(" + inject + ")()";
document.documentElement.appendChild(script_1);

if (document.documentElement.dataset.cbscriptallow !== "true") {
  var script_2 = document.createElement('script');
  script_2.textContent = `{
    const iframes = window.top.document.querySelectorAll("iframe[sandbox]");
    for (var i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow) {
        if (iframes[i].contentWindow.HTMLCanvasElement) {
          let tb = iframes[i].contentWindow.HTMLCanvasElement.prototype.toBlob;
          if (tb !== HTMLCanvasElement.prototype.toBlob) {
            iframes[i].contentWindow.HTMLCanvasElement.prototype.toBlob = HTMLCanvasElement.prototype.toBlob;
            iframes[i].contentWindow.HTMLCanvasElement.prototype.toDataURL = HTMLCanvasElement.prototype.toDataURL;
          }
        }
      }
    }
  }`;
  window.top.document.documentElement.appendChild(script_2);
}

window.addEventListener("message", function (e) {
  if (e.data && e.data === "canvas-fingerprint-defender-alert") {
    background.send("fingerprint", {"host": document.location.host});
  }
}, false);
