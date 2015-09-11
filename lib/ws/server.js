var WebSocket = require('ws');

function Server(options) {
  this.options = options;
  this.server = null;
}

Server.prototype.listen = function () {
  if (this.options && this.options.path) {
    if (this.options.path.substr(0, 1) !== '/') {
      this.options.path = '/' + this.options.path;
    }
  }
  this.server = new WebSocket.Server(this.options);
};

Server.prototype.close = function () {
  if (this.server) {
    this.server.close();
  }
};

Server.prototype.broadcast = function (msg) {
  if (this.server) {
    this.server.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }
};

module.exports = Server;
