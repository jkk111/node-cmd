var express = require("express");
var app = express();
app.use(express.static("static/"));
var http = require("http");
var httpServer = http.createServer(app).listen(80);
var io = require("socket.io")(httpServer);
var spawn = require("child_process").spawn;
io.on("connection", function(socket) {
  var prompt = spawnPrompt();
  socket.on("command", function(command) {
    if(!prompt)
      prompt = spawnPrompt();
    executeCommand(prompt, command);
  });
});

function executeCommand(prompt, command) {
  console.log("Executing", command)
  prompt.stdin.write(command + "\r\n");
}

function spawnPrompt() {
  return spawn("cmd");
}