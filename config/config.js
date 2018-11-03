'use strict';

module.exports = (function () {
  const CONF = {};
  // CONF.auth_rabbit_mq_url = 'amqp://test3:daddy12@localhost:5672';
  // CONF.auth_rabbit_mq_url = 'amqp://test3:daddy12@127.0.0.1:5672';
  CONF.auth_rabbit_mq_url = 'amqp://worker:test@127.0.0.1:5672';
  return CONF;
}());