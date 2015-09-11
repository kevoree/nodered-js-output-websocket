var AbstractComponent = require('kevoree-entities').AbstractComponent;
var Client = require('./ws/client');
var Server = require('./ws/server');

/**
 * Kevoree component
 * @type {WebSocketOut}
 */
var WebSocketOut = AbstractComponent.extend({
  toString: 'WebSocketOut',

  // if true, then the component will connect to a remote WS server, otherwise
  // attributes port and path must be set to start a server and listen on
  dic_connectTo: {
    optional: false,
    defaultValue: true
  },
  // if true, then the received messages will not be scrapped, otherwise it
  // will only get msg.payload
  dic_entireMsg: {
    optional: false,
    defaultValue: true
  },
  // when connectTo is true, then the url attribute will be used to connect the
  // WS client to the server
  dic_url: {
    datatype: 'string'
  },
  // when connectTo is false, then port & path must be defined to start
  // a server locally and start listening on
  dic_port: {
    datatype: 'number'
  },
  dic_path: {
    datatype: 'string'
  },

  construct: function () {
    this.client = null;
    this.server = null;
  },

  /**
   * this method will be called by the Kevoree platform when your component has to start
   * @param {Function} done
   */
  start: function (done) {
    if (this.dictionary.getBoolean('connectTo', WebSocketOut.prototype.dic_connectTo.defaultValue)) {
      this.client = new Client(this.dictionary.getString('url'));
      this.client.connect();
      this.log.info(this.toString(), '"' + this.getName() + '" connected to WebSocket endpoint ' + this.client.url);
    } else {
      this.server = new Server({
        port: this.dictionary.getNumber('port'),
        path: this.dictionary.getString('path')
      });
      this.server.listen();
      this.log.info(this.toString(), '"' + this.getName() + '" WebSocket server listening at 0.0.0.0:' + this.server.options.port + this.server.options.path);
    }
    done();
  },

  /**
   * this method will be called by the Kevoree platform when your component has to stop
   * @param {Function} done
   */
  stop: function (done) {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    if (this.server) {
      this.server.close();
      this.client = null;
    }
    done();
  },

  update: function (done) {
    this.stop(function () {
      this.start(done);
    }.bind(this));
  },

  in_in: function (data) {
    var msg;
    if (this.dictionary.getBoolean('entireMsg', WebSocketOut.prototype.dic_entireMsg.defaultValue)) {
      msg = data;
    } else {
      try {
        var obj = JSON.parse(data);
        msg = obj.payload;
      } catch (err) {
        msg = data;
      }
    }

    if (this.client) {
      this.client.send(msg);
    }

    if (this.server) {
      this.server.broadcast(msg);
    }
  }
});

module.exports = WebSocketOut;
