'use strict';

// node send.js Hello world... & node send.js Vasya.. & node send.js Petya..

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }

  conn.createChannel(function(err, ch) {
    var msg = process.argv.slice(2).join(' ') || "Hello World!";
    var q = 'task_queue';
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }
    // if ch.assertQueue(q, { durable: true }) and ch.sendToQueue(q, Buffer.from(msg), { persistent: true });
    // and you require make do ch.assertQueue(q, { durable: true }) in receive.js
    // You get saving messages if will even restart RabbitMQ
    ch.assertQueue(q, { durable: true });
    ch.sendToQueue(q, Buffer.from(msg), { persistent: true });
    console.log(" [x] Sent '%s'", msg);
  });
  setTimeout(function() {
    conn.close();
    process.exit(0)
  }, 500);
});