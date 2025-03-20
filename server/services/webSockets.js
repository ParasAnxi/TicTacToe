//** IMPORTS */
import { Server } from "socket.io";

//** USER AND ROOMS */
const allUsers = {};
const allRooms = [];

//** SOCKETS */
export const webSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  //** CONNECTION */
  io.on("connection", (socket) => {
    // console.log("user connceted")
    allUsers[socket.id] = {
      socket: socket,
      online: true,
      playing: false,
    };
    socket.on("request_to_play", (data) => {
      const currentUser = allUsers[socket.id];
      currentUser.playerName = data.playerName;

      let opponentPlayer = null;

      for (const key in allUsers) {
        const user = allUsers[key];
        if (user.online && !user.playing && socket.id !== key){
          opponentPlayer = user;
          break;
        }
      }

      if(opponentPlayer){
        allRooms.push({
          player1: opponentPlayer,
          player2: currentUser,
        });

        currentUser.socket.emit("OpponentFound", {
          opponentName: opponentPlayer.playerName,
          playingAs: "circle",
        });

        opponentPlayer.socket.emit("OpponentFound", {
          opponentName: currentUser.playerName,
          playingAs: "cross",
        });

        currentUser.socket.on("playerMoveFromClient", (data) => {
          opponentPlayer.socket.emit("playerMoveFromServer",data);
        });

        opponentPlayer.socket.on("playerMoveFromClient", (data) => {
          currentUser.socket.emit("playerMoveFromServer", data);
        });
      } else {
        currentUser.socket.emit("OpponentNotFound");
      }
    });

    socket.on("disconnect", function () {
      const currentUser = allUsers[socket.id];
      currentUser.online = false;
      currentUser.playing = false;

      for (let index = 0; index < allRooms.length; index++) {
        const { player1, player2 } = allRooms[index];

        if (player1.socket.id === socket.id) {
          player2.socket.emit("opponentLeftMatch");
          break;
        }

        if (player2.socket.id === socket.id) {
          player1.socket.emit("opponentLeftMatch");
          break;
        }
      }
    });
    //** DISCONNECT */
   socket.on("disconnect", () => {
     const currentUser = allUsers[socket.id];

     if (currentUser) {
       currentUser.online = false;
       currentUser.playing = false;

       allRooms.forEach((room, index) => {
         if (room.player1.socket.id === socket.id) {
           room.player2.socket.emit("opponentLeftMatch");
           allRooms.splice(index, 1);
         } else if (room.player2.socket.id === socket.id) {
           room.player1.socket.emit("opponentLeftMatch");
           allRooms.splice(index, 1);
         }
       });

       delete allUsers[socket.id];
     }
   });
  });
};
