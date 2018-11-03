'use strict';

// node receive_prefetch.js worker1 & node receive_prefetch.js worker2
// SEND ACKNOWLEDGMENT

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');

const [ worker_name ] = process.argv.slice(2);
const is_worker_1 = worker_name === 'worker1';

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }
  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }
    var q = 'task_queue';
    ch.assertQueue(q, { durable: true });

    console.log(" [*] Waiting for messages in %s worker_name: "+worker_name+". To exit press CTRL+C", q);

    // This tells RabbitMQ not to give more than one message to a worker at a time
    // don't send new task until do previous task
    if (is_worker_1) {
      ch.prefetch(1);
    }

    ch.consume(q, function(buffer_msg) {
      var msg = buffer_msg.content.toString();
      var secs = (msg.split('.').length - 1);
      // secs = secs * 1000;
      secs = secs * 10000;
      setTimeout(function() {
        ch.ack(buffer_msg); // --> SEND ACKNOWLEDGMENT, required set original buffer
        console.log(" [x] Done worker_name: "+worker_name);
      }, secs);
      console.log(" [x] worker_name: "+worker_name+" received %s", msg);
    }, {
      noAck: false, // required channell.ack()
    });
  });
});