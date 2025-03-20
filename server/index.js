//** IMPORTS */
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import "dotenv/config";
import { createServer } from "http";
import { webSockets } from "./services/webSockets.js";

//** CONFIG */
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

//** SERVER AND SOCKETS*/
const server = createServer(app);
webSockets(server);

const PORT = process.env.PORT;
const hostServer = async () => {
  server.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
  });
};
hostServer();
