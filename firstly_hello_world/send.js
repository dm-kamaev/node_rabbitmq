'use strict';

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }

  conn.createChannel(function(err, ch) {
    var q = 'hello';
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }
    ch.assertQueue(q, { durable: false });
    ch.sendToQueue(q, Buffer.from('Hello World!'));
    console.log(" [x] Sent 'Hello World!'");
  });
  setTimeout(function() {
    conn.close();
    process.exit(0)
  }, 500);
});