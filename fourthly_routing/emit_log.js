'use strict';

// node emit_log.js

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');
const enum_types_log = require('./enum_types_log.js');

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }

  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }

    var exchange = 'direct_logs';

    // direct –– send  messages to special receives consumer.
    ch.assertExchange(exchange, 'direct', { durable: false });

    // enum_types_log.log –– it's type for consumer
    ch.publish(exchange, enum_types_log.log, Buffer.from('it\'s log'));
    ch.publish(exchange, enum_types_log.warn, Buffer.from('it\'s warning'));

    ch.publish(exchange, enum_types_log.err, Buffer.from('it\'s error'));

    console.log(" [x] Sent 1 log, 1 warn, 1 err");
  });
  setTimeout(function() {
    conn.close();
    process.exit(0)
  }, 500);
});