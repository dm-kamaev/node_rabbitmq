'use strict';

// node receive_log_and_warn.js

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');
const enum_types_log = require('./enum_types_log.js');

const TYPES_LOG = [ enum_types_log.log, enum_types_log.warn ];

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }
  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }
    var ex = 'direct_logs';

    ch.assertExchange(ex, 'direct', { durable: false });

    ch.assertQueue('', {exclusive: true}, function(err, q) {
      if (err) {
        throw new Error('amqp:assert_queue '+err);
      }
      console.log(" [*] Waiting for messages(\""+TYPES_LOG.join('" || "')+"\") in %s. To exit press CTRL+C", q.queue);

      TYPES_LOG.forEach(function(type_log) {
        // binding with necessary log type
        // other words, it's listen only messages with type "log" || "warn"
        ch.bindQueue(q.queue, ex, type_log);
      });

      ch.consume(q.queue, function(msg) {
        console.log(" [x] messages(\""+TYPES_LOG.join('" || "')+"\") "+msg.fields.routingKey+": %s", msg.content.toString());
      }, {
        noAck: true
      });
    });

  });
});