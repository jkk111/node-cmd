var LINE_ENDING = process.platform === "win32" ? "\r\n" : "\n";
var spawn = require("child_process").spawn;
var config;
try {
  config = JSON.parse(fs.readFileSync("config.json"));
} catch(e) {

}

function executeCommand(prompt, command) {
  console.log("Executing", command)
  prompt.stdin.write(command + LINE_ENDING);
}

function spawnPrompt() {
  if(process.platform === "win32")
    return spawn("cmd");
  else
    return spawn("bash");
}

module.exports = function(http) {
  var io = require("socket.io")(http);
  initSocketListener(io);
}

function initSocketListener(io) {
  io.on("connection", function(socket) {
    var prompt = spawnPrompt();
    // Start of requesting credentials from server.
    //
    // if(!config) {
    //   socket.emit("request-credentials");
    // }
    //
    // socket.on("credentials", function(data) {
    //   fs.writeFileSync("config.json", JSON.stringify(data, null, "  "), "utf8");
    //   config = data;
    // });

    prompt.stdout.on("data", function(data) {
      console.log("response:", data.toString().trim());
      socket.emit("command-result", data);
    })

    prompt.stderr.on("data", function(data) {
      console.log("error:", data.toString().trim());
      socket.emit("command-error", data);
    })

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