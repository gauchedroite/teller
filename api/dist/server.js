var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
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
app.post("/save-game-script/:pathToFile(*)", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pathToFile = req.params["pathToFile"];
    const json = JSON.stringify(req.body);
    try {
        // Change the file path to be relative to the game project, not the api
        const gamescript = path.resolve(pathToFile).replace("/api/", "/game/public/");
        yield fs.promises.writeFile(gamescript, json);
        res.json({ message: "Game file saved" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Start listening to the port
const port = process.env.port || 5501;
app.listen(port);
