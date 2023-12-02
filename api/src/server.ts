
import express from "express";
import bodyParser from "body-parser"
import cors from "cors";
import path from "path"
import * as fs from "fs";

const app = express();
app.use(cors());


//
// The following bit is not related to the API.
// It exists so that express can serve *.ts files for debugging.
// Note that when the game project uses LiveServer for debugging, there is no need for that bit of configuration.
// LiverServer still needs to be configured, but by using the .vscode/settings.json file.
//
app.use(express.static("../../game/public"));
app.use("/src", express.static("../../game/src"));


// Middleware to parse the request body
// I don't know how not to require this step (if possible)
app.use(bodyParser.json());


// Save the game file to the game/public folder
// This is only used locally when uploading the game from the editor
app.post("/save-game-script/:pathToFile(*)", async (req, res) => {
    const pathToFile = (req.params as any)["pathToFile"]
    const json = JSON.stringify(req.body);

    try {
        // Change the file path to be relative to the game project, not the api
        const gamescript = path.resolve(pathToFile).replace("/api/", "/game/public/")

        await fs.promises.writeFile(gamescript, json)
        res.json({ message: "Game file saved" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
})



// Start listening to the port
const port = process.env.port || 5501;
app.listen(port);

