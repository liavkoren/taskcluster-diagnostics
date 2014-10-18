'use strict';

var taskcluster         = require('taskcluster-client');

/** Initialize utilities with all the configuration we have */
var initialize = function(options) {
  // Store options globally, so we can access them from tests
  exports.options = options;

  // Create a queue instance that the tests can use
  exports.queue = new taskcluster.Queue({
    credentials:      options.taskcluster.credentials
  });

  exports.listener = new taskcluster.Listener({
    connectionString:    'amqp://ilknxuuf:quYfD8HMJ1d-99aO1Bxzuh_TSwSIuc0h@purple-weasel.rmq.cloudamqp.com/ilknxuuf'
  });

  exports.queueEvents = new taskcluster.QueueEvents();
};

// Export the initialize function
exports.initialize = initialize;

