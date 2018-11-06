'use strict';

// node rpc_server.js

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }
  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }
    var q = 'rpc_queue';

    ch.assertQueue(q, { durable: false });

    ch.prefetch(1);
    console.log(' [x] Awaiting RPC requests');

    ch.consume(q, function reply(msg) {
      const num = parseInt(msg.content.toString(), 10);
      console.log(" [.] fib(%d)", num);
      var result = fibonacci(num);

      ch.sendToQueue(msg.properties.replyTo, Buffer.from(result.toString()), { correlationId: msg.properties.correlationId });
      ch.ack(msg);
      console.log(`[x] ${Date.now()} Calc for ${num} result ${result}`);
    });

  });
});


function fibonacci(n) {
  if (n == 0 || n == 1) {
    return n;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}