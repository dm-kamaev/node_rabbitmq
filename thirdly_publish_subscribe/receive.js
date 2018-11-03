'use strict';

// node receive.js logger1 & node receive.js logger2

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');

const [ worker_name ] = process.argv.slice(2);

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }
  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }
    var ex = 'logs';

    ch.assertExchange(ex, 'fanout', { durable: false });

    ch.assertQueue('', {exclusive: true}, function(err, q) {
      if (err) {
        throw new Error('amqp:assert_queue '+err);
      }
      console.log(" [*] Waiting for messages in %s worker_name: "+worker_name+". To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, '');
      ch.consume(q.queue, function(msg) {
        console.log(" [x] worker_name: '"+worker_name+"' %s", msg.content.toString());
      }, {
        noAck: true
      });
    });

  });
});