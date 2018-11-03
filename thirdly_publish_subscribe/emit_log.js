'use strict';

// node emit_log.js

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }

  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }

    var msg = process.argv.slice(2).join(' ') || "Hello World!";
    var exchange = 'logs';

    // fanout –– send  messages in all receives
    ch.assertExchange(exchange, 'fanout', { durable: false });
    ch.publish(exchange, '', new Buffer(msg));

    console.log(" [x] Sent '%s'", msg);
  });
  setTimeout(function() {
    conn.close();
    process.exit(0)
  }, 500);
});