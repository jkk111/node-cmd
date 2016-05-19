var LINE_ENDING = process.platform === "win32" ? "\r\n" : "\n";
var spawn = require("child_process").spawn;

// Executes a specified command in a prompt.
function executeCommand(prompt, command) {
  console.log("Executing", command)
  prompt.stdin.write(command + LINE_ENDING);
}

// Returns an instance of the correct prompt.
function spawnPrompt() {
  if(process.platform === "win32")
    return spawn("cmd");
  else
    return spawn("bash");
}

// Starts socket listener.
function initSocketListener(io) {
  io.on("connection", function(socket) {
    var prompt = spawnPrompt();
    prompt.stdout.on("data", function(data) {
      console.log("response:", data.toString().trim());
      socket.emit("command-result", data);
    });

    prompt.stderr.on("data", function(data) {
      console.log("error:", data.toString().trim());
      socket.emit("command-error", data);
    });

    socket.on("command", function(command) {
      if(!prompt)
        prompt = spawnPrompt();
      executeCommand(prompt, command);
    });

    socket.on("disconnect", function() {
      prompt.kill();
    });
  });
}

module.exports = function(http) {
  initSocketListener(require("socket.io")(http));
}