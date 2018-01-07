'use strict';

const fp = require('fastify-plugin');
const couchbase = require('couchbase');

function fastifyCouchbase(fastify, options, next) {
  const cluster = new couchbase.Cluster(options.url);

  cluster.authenticate(options.username, options.password);

  const bucket = cluster.openBucket(options.bucketName, onConnect);

  function onConnect(err) {
    if (err) {
      return next(err);
    }

    const cb = {
      cluster,
      bucket
    };

    fastify
      .decorate('cb', cb)
      .addHook('onClose', close);

    next();
  }
}

function close(fastify, done) {
  fastify.cb.bucket.disconnect(done);
}

module.exports = fp(fastifyCouchbase, '>=0.25.3');
