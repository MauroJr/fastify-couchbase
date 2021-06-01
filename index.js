"use strict";

const fp = require("fastify-plugin");
const couchbase = require("couchbase");

function fastifyCouchbase(fastify, options, next) {
  const cluster = couchbase.connect(
    options.url,
    {
      username: options.username,
      password: options.password,
    },
    function (err, cluster) {
      if (err) {
        return next(err);
      }
      const bucket = cluster.bucket(options.bucketName);
      const cb = {
        cluster,
        bucket,
      };

      fastify.decorate("cb", cb).addHook("onClose", close);

      next();
    }
  )
}

function close(fastify, done) {
  fastify.cb.bucket.disconnect(done);
}

module.exports = fp(fastifyCouchbase, ">=0.25.3");
