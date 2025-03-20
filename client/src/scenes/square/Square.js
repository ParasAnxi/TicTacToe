//** IMPORTS */
import React, { useState, useEffect } from "react";
// import "./App.css";
import "./Square.css"
import { crossSvg } from "components/svgs/crossSvg";
import { circleSvg } from "components/svgs/circleSvg";

const Square = ({
  gameState,
  setGameState,
  socket = null,
  playingAs,
  currentElement,
  finishedArrayState = [],
  setFinishedState,
  finishedState,
  id,
  currentPlayer,
  setCurrentPlayer
}) => {
  const [icon, setIcon] = useState(null);

  const clickOnSquare = () => {
    if (playingAs !== currentPlayer) {
      return;
    }

    if (finishedState) {
      return;
    }

    if (!icon) {
      if (currentPlayer === "circle") {
        setIcon(circleSvg);
      } else {
        setIcon(crossSvg);
      }

      const myCurrentPlayer = currentPlayer;
      socket.emit("playerMoveFromClient", {
        state: {
          id,
          sign: myCurrentPlayer,
        },
      });

      setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");

      setGameState((prevState) => {
        let newState = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newState[rowIndex][colIndex] = myCurrentPlayer;
        return newState;
      });
    }
  };
  return (
    <div
      onClick={clickOnSquare}
      className={`square ${finishedState ? "not-allowed" : ""}
      ${currentPlayer !== playingAs ? "not-allowed" : ""}
       ${
         Array.isArray(finishedArrayState) && finishedArrayState.includes(id)
           ? finishedState + "-won"
           : ""
       }
       ${finishedState && finishedState !== playingAs ? "grey-background" : ""}
       `}
    >
      {currentElement === "circle"
        ? circleSvg
        : currentElement === "cross"
        ? crossSvg
        : icon}
    </div>
  );
};

export default Square