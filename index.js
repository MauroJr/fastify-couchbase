'use strict';

const fp = require('fastify-plugin');
const couchbase = require('couchbase');

function fastifyCouchbase(fastify, options, next) {
  const cluster = new couchbase.Cluster(options.url);
  const args = [options.bucketName];

  if (options.bucketPassword) {
    args.push(options.bucketPassword);
  }

  args.push(onConnect);

  const bucket = cluster.openBucket(...args);

  function onConnect(err) {
    if (err) {
      return next(err);
    }

    const cb = {
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
