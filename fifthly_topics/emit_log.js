'use strict';

// node emit_log.js 'something' 'All queues'
// node emit_log.js 'cron.log' 'All cron messages'
// node emit_log.js 'cron.err' 'All errors'
// node emit_log.js 'cron.warn' 'Only cron warnings'

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');
const [ to_send, msg ] = process.argv.slice(2);

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }

  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }

    var exchange = 'topic_logs';

    // topic –– send  messages by (*, #, *.name.# and etc) to consumer.
    // Topic exchange is powerful and can behave like other exchanges.
    // When a queue is bound with "#" (hash) binding key - it will receive all the messages, regardless of the routing key - like in fanout exchange.
    // When special characters "*" (star) and "#" (hash) aren't used in bindings, the topic exchange will behave just like a direct one.
    ch.assertExchange(exchange, 'topic', { durable: false });

    ch.publish(exchange, to_send, Buffer.from(msg));
    console.log(" [x] Sent '"+to_send+"': '"+msg+"'");
  });
  setTimeout(function() {
    conn.close();
    process.exit(0)
  }, 500);
});