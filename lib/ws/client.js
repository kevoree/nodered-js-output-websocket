var WebSocket = require('ws');

function Client(url) {
  this.url = url;
  this.client = null;
  this.timeout = null;
}

Client.prototype.connect = function (onmessage) {
  var that = this;

  this.client = new WebSocket(this.url);

  function reconnect() {
    clearTimeout(that.timeout);
    if (!that.closing) {
      that.timeout = setTimeout(function () {
        that.connect(onmessage);
      }, 3000);
    }
  }

  this.client.addEventListener('close', reconnect);
  this.client.addEventListener('error', reconnect);
};

Client.prototype.close = function () {
  if (this.client) {
    this.client.close();
    this.closing = true;
  }
};

Client.prototype.send = function (msg) {
  if (this.client && (this.client.readyState === WebSocket.OPEN)) {
    this.client.send(msg);
  }
};

module.exports = Client;
