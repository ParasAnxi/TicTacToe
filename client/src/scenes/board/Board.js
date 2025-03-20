import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Board.css";
import Square from "scenes/square/Square";

//** BOARD */
const board = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const Board = () => {
  const [gameState, setGameState] = useState(board);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishetState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  //** MODAL STATE */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState("");

  const checkWinner = () => {
    //** ROWS */
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    //** COLUMNS */
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    //** DIAGONALS */
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    //** CHECK DRAW */
    const isDrawMatch = gameState
      .flat()
      .every((e) => e === "circle" || e === "cross");
    if (isDrawMatch) return "draw";
    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishetState(winner);
    }
  }, [gameState]);

  //** OPEN MODAL TO ENTER NAME */
  const takePlayerName = () => {
    setIsModalOpen(true);
  };

  //** HANDLE NAME SUBMISSION */
  const handleNameSubmit = () => {
    if (!tempPlayerName.trim()) return;
    setPlayerName(tempPlayerName.trim());
    setIsModalOpen(false);
    playOnlineGame(tempPlayerName.trim());
  };

  const playOnlineGame = (username) => {
    const newSocket = io("http://localhost:3001", {
      autoConnect: true,
    });

    newSocket.emit("request_to_play", { playerName: username });
    setSocket(newSocket);
    setPlayOnline(true);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("opponentLeftMatch", () => {
      setFinishetState("opponentLeftMatch");
    });

    socket.on("playerMoveFromServer", (data) => {
      const id = data.state.id;
      setGameState((prevState) => {
        let newState = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newState[rowIndex][colIndex] = data.state.sign;
        return newState;
      });
      setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
    });

    socket.on("connect", () => {
      setPlayOnline(true);
    });

    socket.on("OpponentNotFound", () => {
      setOpponentName(false);
    });

    socket.on("OpponentFound", (data) => {
      setPlayingAs(data.playingAs);
      setOpponentName(data.opponentName);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <div className="main-div">
      {/* MODAL FOR PLAYER NAME INPUT */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Enter Your Name</h3>
            <input
              type="text"
              placeholder="Your name"
              value={tempPlayerName}
              onChange={(e) => setTempPlayerName(e.target.value)}
            />
            <button onClick={handleNameSubmit}>Submit</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* SHOW PLAY ONLINE BUTTON IF NOT PLAYING */}
      {!playOnline && (
        <button onClick={takePlayerName} className="playOnline">
          Play Online
        </button>
      )}

      {/* WAITING FOR OPPONENT */}
      {playOnline && !opponentName && (
        <div className="waiting">
          <p>Waiting for opponent...</p>
        </div>
      )}

      {/* GAME BOARD */}
      {playOnline && opponentName && (
        <>
          <div className="move-detection">
            <div
              className={`left ${
                currentPlayer === playingAs
                  ? "current-move-" + currentPlayer
                  : ""
              }`}
            >
              {playerName}
            </div>
            <div
              className={`right ${
                currentPlayer !== playingAs
                  ? "current-move-" + currentPlayer
                  : ""
              }`}
            >
              {opponentName}
            </div>
          </div>
          <h1 className="game-heading water-background">Tic Tac Toe</h1>
          <div className="square-wrapper">
            {gameState.map((arr, rowIndex) =>
              arr.map((e, colIndex) => (
                <Square
                  key={rowIndex * 3 + colIndex}
                  socket={socket}
                  playingAs={playingAs}
                  gameState={gameState}
                  finishedArrayState={finishedArrayState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState}
                  id={rowIndex * 3 + colIndex}
                  currentElement={e}
                />
              ))
            )}
          </div>
          {finishedState && finishedState !== "draw" && (
            <h3 className="finished-state">
              {finishedState === playingAs ? "You" : finishedState} won the game
            </h3>
          )}
          {finishedState === "draw" && (
            <h3 className="finished-state">It's a Draw</h3>
          )}
        </>
      )}
    </div>
  );
};

export default Board;
