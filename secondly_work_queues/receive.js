'use strict';

// node receive.js worker1 & node receive.js worker2

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
    var q = 'task_queue';
    ch.assertQueue(q, { durable: false });

    console.log(" [*] Waiting for messages in %s worker_name: "+worker_name+". To exit press CTRL+C", q);

    ch.consume(q, function(msg) {
      msg = msg.content.toString();
      var secs = (msg.split('.').length - 1);
      console.log(secs);
      setTimeout(function() {
        console.log(" [x] Done");
      }, secs * 1000);
      console.log(" [x] worker_name: "+worker_name+" received %s", msg);
    }, {
      noAck: true
    });
  });
});