/*global suite, test */
/*jslint node: true */

"use strict";


// Global reference to listener
var listener = null;

// clean up after tests that creates a listener
var teardown = function() {
  if (listener) {
    listener.close();
    listener = null;
  }
};


suite("helloWorld", function() {
  var assert              = require('assert');
  var base                = require('taskcluster-base');
  var utils               = require("../utils");
  var slugid              = require("slugid");
  var debug               = require("debug")("diagnostics:queue:helloWorld");
  var taskcluster         = require("taskcluster-client");
  var Promise             = require("promise");

  // Set an excessive timeout
  this.timeout(10 * 60 * 1000);

  test("Can create docker instance... ", function() {
    var cfg = base.config({filename: 'taskcluster-diagnostics'});

    // Create a taskId (url-safe base64 encoded uuid without '=' padding)
    var taskId = slugid.v4();
    console.log("TaskId is: ");
    console.log(taskId);
    listener = new taskcluster.PulseListener(cfg.get('pulseListener'));
    listener.bind(utils.queueEvents.taskCompleted({taskId: taskId}));

    var gotMessage = new Promise(function(accept, reject) {
      listener.on("message", function() {
        console.log("accept");
        accept();
      });
      listener.on("error", function(){
        console.log("reject");
        reject();
      });
    });

    // Wait for taskCompletedHandler to be ready, ie. for listenFor
    // to have started the PulseListener
    return listener.resume().then(function() {
      console.log("listener.resume.then");
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
      });
    }).then(function() {
      console.log("debug?");
      debug("Created a task, now waiting for message about completion");
      return gotMessage.then(function(message) {
        assert(message.status.taskId === taskId, "Got wrong taskId");
      });
    });
  });
});
