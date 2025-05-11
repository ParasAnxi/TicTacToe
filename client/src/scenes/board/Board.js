import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Board.css";
import Square from "scenes/square/Square";
import { useSelector, useDispatch } from "react-redux";
import {
  setGameState,
  setCurrentPlayer,
  setFinishedState,
  setFinishedArrayState,
  setPlayOnline,
  setSocket,
  setPlayerName,
  setOpponentName,
  setPlayingAs,
} from "features/game/gameSlice";

//** BOARD */
const board = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const Board = () => {
  const {
    gameState,
    currentPlayer,
    finishedState,
    finishedArrayState,
    playOnline,
    socket,
    playerName,
    opponentName,
    playingAs,
  } = useSelector((state) => state.game);
  const dispatch = useDispatch();

  useEffect(() => {
    const result = checkWinner();
    if (result) {
      dispatch(setFinishedState(result.winner));
      dispatch(setFinishedArrayState(result.combination));
    }
  }, [gameState, dispatch]);

  //** MODAL STATE */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState("");

  const checkWinner = () => {
    let winningCombination = null;
    //** ROWS */
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        winningCombination = [row * 3 + 0, row * 3 + 1, row * 3 + 2];
        return { winner: gameState[row][0], combination: winningCombination };
      }
    }

    //** COLUMNS */
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        winningCombination = [0 * 3 + col, 1 * 3 + col, 2 * 3 + col];
        return { winner: gameState[0][col], combination: winningCombination };
      }
    }

    //** DIAGONALS */
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      winningCombination = [0, 4, 8];
      return { winner: gameState[0][0], combination: winningCombination };
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      winningCombination = [2, 4, 6];
      return { winner: gameState[0][2], combination: winningCombination };
    }

    //** CHECK DRAW */
    const isDrawMatch = gameState
      .flat()
      .every((e) => e === "circle" || e === "cross");
    if (isDrawMatch) return { winner: "draw", combination: [] };
    return null;
  };

  //** OPEN MODAL TO ENTER NAME */
  const takePlayerName = () => {
    setIsModalOpen(true);
  };

  //** HANDLE NAME SUBMISSION */
  const handleNameSubmit = () => {
    if (!tempPlayerName.trim() || playerName === tempPlayerName.trim()) return;
    const trimmedName = tempPlayerName.trim();
    dispatch(setPlayerName(trimmedName));
    setIsModalOpen(false);

    // ✅ Call `playOnlineGame` only after setting the name
    playOnlineGame(trimmedName);

  };
  // const username = useSelector((state) => state.game.playerName);
  // console.log(username);

  const playOnlineGame = (username) => {
    const newSocket = io("http://localhost:3001", {
      autoConnect: true,
    });

    newSocket.emit("request_to_play", { playerName: username });
    dispatch(setSocket(newSocket));
    dispatch(setPlayOnline(true));
  };

  useEffect(() => {
    if (!socket) return;

    const handleOpponentLeft = () => {
      dispatch(setFinishedState("opponentLeftMatch"));
    };

    const handlePlayerMove = (data) => {
      const id = data.state.id;
      dispatch(
        setGameState((prevState) => {
          const newState = prevState.map((row) => [...row]); // Clone the board
          const rowIndex = Math.floor(id / 3);
          const colIndex = id % 3;
          newState[rowIndex][colIndex] = data.state.sign;
          return newState;
        })
      );
      dispatch(
        setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle")
      );
    };

    socket.on("opponentLeftMatch", handleOpponentLeft);
    socket.on("playerMoveFromServer", handlePlayerMove);
    socket.on("OpponentNotFound", () => dispatch(setOpponentName(false)));
    socket.on("OpponentFound", (data) => {
      dispatch(setPlayingAs(data.playingAs));
      dispatch(setOpponentName(data.opponentName));
    });

    return () => {
      socket.off("opponentLeftMatch", handleOpponentLeft);
      socket.off("playerMoveFromServer", handlePlayerMove);
    };
  }, [socket, dispatch]);

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
