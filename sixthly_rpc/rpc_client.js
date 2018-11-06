'use strict';

// node rpc_client.js 10000

const amqp = require('amqplib/callback_api');
const CONF = require('../config/config.js');
const [ NUM ] = process.argv.slice(2);

amqp.connect(CONF.auth_rabbit_mq_url, function(err, conn) {
  if (err) {
    throw new Error('amqp:connect '+err);
  }

  conn.createChannel(function(err, ch) {
    if (err) {
      throw new Error('amqp:create_channel '+err);
    }

    ch.assertQueue('', { exclusive: true }, function (err, q) {
      if (err) {
        throw new Error('amqp:assert_queue '+err);
      }

      var correlation_id = generate_uuid();
      var num = parseInt(NUM, 10);

      console.log(' [x] Requesting fib(%d)', num);

      ch.consume(q.queue, function (msg) {
        if (msg.properties.correlationId !== correlation_id) {
          return;
        }
        console.log(' [.] Got %s', msg.content.toString());
        setTimeout(function() { conn.close(); process.exit(0) }, 500);
      }, { noAck: true });

      ch.sendToQueue('rpc_queue', Buffer.from(num.toString()), { correlationId: correlation_id, replyTo: q.queue });
    });

  });

});


function generate_uuid() {
  return (
    Date.now() +
    Math.random().toString() +
    Math.random().toString()
  );
}