
var express = require("express");
var cors = require("cors");
var port = process.env.port || 1337;

var app = express();
app.use(cors());


//
// The following setup is not directly related to the API.
// It exists to serve the game files, including the *.ts sources for debugging, 
// if those files are going to be served as part of the API.
//
// Note that the game project uses LiveServer for that purpose (see .vscode/settings.json).
//
app.use(express.static("../../game/public"));
app.use("/src", express.static("../../game/src"));


// Start listening to the port
app.listen(port);


console.log("Listening on port " + port);
