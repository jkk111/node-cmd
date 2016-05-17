var express = require("express");
var app = express();
app.use(express.static("static/"));
var http = require("http").createServer(app).listen(80);
require("./index.js")(http);