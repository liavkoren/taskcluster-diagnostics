/*global suite, test */
/*jslint node: true */

"use strict";


suite("helloWorld", function() {
  var utils               = require("../utils");
  var slugid              = require("slugid");
  var debug               = require("debug")("diagnostics:queue:helloWorld");

  // Set an excessive timeout
  this.timeout(60 * 1000);

  test("Can create docker instance... ", function() {
    // Create a taskId (url-safe base64 encoded uuid without '=' padding)
    var taskId = slugid.v4();
    console.log("TaskId is: ");
    console.log(taskId);

    var success = function(msg) {
        // console.log(msg);
        // debugger;
        var utils               = require("../utils");
        var listener = utils.listener;
        var queueEvents = utils.queueEvents;
        listener.bind(queueEvents.taskCompleted({taskId: msg.status.taskId}));
        listener.on("message", function(message){
          // console.log(message);
          // Wait for a message
          var gotMessage = new Promise(function(accept, reject) {
            listener.on("message", accept);
            listener.on("error", reject);
          });
          return {
            ready:      listener.resume(),
            message:    gotMessage
          };
        });
        return listener;
      };

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
    }).then(success, function(err) {
      // Print the error
      debug("queue.createTask error: %j", err);
      // Retrow the error
      throw err;
    });
  });
});



