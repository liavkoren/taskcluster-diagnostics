suite("helloWorld", function() {
  var assert              = require('assert');
  var utils               = require('../utils');
  var slugid              = require('slugid');
  var taskcluster         = require('taskcluster-client');
  var debug               = require('debug')('diagnostics:queue:createTask');

  // Set an excessive timeout
  this.timeout(60 * 1000);

  test("Can create docker instance and retrieve result", function() {
    // Create a taskId (url-safe base64 encoded uuid without '=' padding)
    var taskId = slugid.v4();

    return utils.queue.createTask(taskId, {
      provisionerId:    "aws-provisioner",
      workerType:       "v2",
      created:          new Date().toJSON(),
      deadline:         new Date(new Date().getTime() + 60 * 60 * 1000).toJSON(),
      payload:          {
        image:          "ubuntu:14.04",
        command:        ["/bin/bash", "-c", "echo 'Hello World'"],
      },
      metadata: {
        name:           "Docker Hello World test",
        description:    "Task that tests Docker image creation and creating a simple artifact.",
        owner:          "nobody@localhost.local",
        source:         "https://github.com/taskcluster/taskcluster-diagnostics"
      }
    }).then(undefined, function(err) {
      // Print the error
      debug("queue.createTask error: %j", err);
      // Retrow the error
      throw err;
    });
    // TODO: Listen for task-defined and task-pending messages, they should be
    //       published immediately...
  });
});

