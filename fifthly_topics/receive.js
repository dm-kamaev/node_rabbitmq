'use strict';

// node receive.js '#' & node receive.js 'cron.*' & node receive.js '*.err' & node receive.js 'cron.warn'

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');

const list_to_subscribe = process.argv.slice(2);

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }
  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }
    var ex = 'topic_logs';

    ch.assertExchange(ex, 'topic', { durable: false });

    ch.assertQueue('', {exclusive: true}, function(err, q) {
      if (err) {
        throw new Error('amqp:assert_queue '+err);
      }

      console.log(" [*] Waiting for messages(\""+list_to_subscribe.join('" || "')+"\") in %s. To exit press CTRL+C", q.queue);

      list_to_subscribe.forEach(function(type_log) {
        // binding with necessary log type
        // other words, it's listen only messages with type "err"
        ch.bindQueue(q.queue, ex, type_log);
      });

      ch.consume(q.queue, function(msg) {
        console.log(" [x] messages(\""+list_to_subscribe.join('" || "')+"\") "+msg.fields.routingKey+": %s", msg.content.toString());
      }, {
        noAck: true
      });
    });

  });
});