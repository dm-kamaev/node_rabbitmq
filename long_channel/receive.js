'use strict';

// node receive.js > receive.log 2>&1 &
// SEND ACKNOWLEDGMENT

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
    var q = 'long_queue';
    ch.assertQueue(q, { durable: true });

    console.log(" [*] Waiting for messages in %s worker_name: "+worker_name+". To exit press CTRL+C", q);

    ch.consume(q, function(buffer_msg) {
      var msg = buffer_msg.content.toString();
      var secs = (msg.split('.').length - 1);
      setTimeout(function() {
        ch.ack(buffer_msg); // --> SEND ACKNOWLEDGMENT, required set original buffer
        console.log(" [x] Done");
      }, secs * 1000);
      console.log(" [x] worker_name: "+worker_name+" received %s", msg);
    }, {
      noAck: false, // required channell.ack()
    });
  });
});