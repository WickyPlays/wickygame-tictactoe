//@ts-nocheck

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GameBG from "./GameBG";
import "./PageGame.scss";
import { GameCore } from "../../cores/GameCore";
import ReactConfetti from "react-confetti";
import { TiArrowBackOutline } from "react-icons/ti";
import { GrRefresh } from "react-icons/gr";
import logo from "../../assets/logo.png";
import DigitClockDisplay from "../../components/DigitClockDisplay/DigitClockDisplay";

export default function PageGame() {
  const [game] = useState(new GameCore());
  const [board, setBoard] = useState<string[]>(game.getBoard());
  const [currentPlayer, setCurrentPlayer] = useState<string>(
    game.getCurrentPlayer()
  );
  const [gameStatus, setGameStatus] = useState<{
    winner: string | null;
    isDraw: boolean;
    gameOver: boolean;
  }>(game.getGameStatus());
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null);
  const [message, setMessage] = useState<string>("Your turn (X)");
  const [showConfetti, setShowConfetti] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());

  useEffect(() => {
    if (gameStatus.gameOver && gameStatus.winner === game.humanPlayer) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  const handleCellClick = (index: number) => {
    if (gameStatus.gameOver || currentPlayer !== game.humanPlayer) return;

    if (game.humanMove(index)) {
      setMoves((prev) => prev + 1);
      updateGameState();

      setTimeout(() => {
        if (!game.getGameStatus().gameOver) {
          game.aiMove();
          setMoves((prev) => prev + 1);
          updateGameState();
        }
      }, 500);
    }
  };

  const updateGameState = () => {
    const newBoard = game.getBoard();
    const newPlayer = game.getCurrentPlayer();
    const status = game.getGameStatus();
    const combo = game.getWinningCombo();

    setBoard([...newBoard]);
    setCurrentPlayer(newPlayer);
    setGameStatus(status);
    setWinningCombo(combo);

    if (status.gameOver) {
      if (status.winner) {
        setMessage(
          status.winner === game.humanPlayer ? "You win! 🎉" : "AI wins! 🤖"
        );
      } else {
        setMessage("It's a draw!");
      }
    } else {
      setMessage(
        newPlayer === game.humanPlayer ? "Your turn (X)" : "AI is thinking..."
      );
    }
  };

  const resetGame = () => {
    game.reset();
    setWinningCombo(null);
    setMoves(0);
    updateGameState();
    setStartTime(new Date());
    setMessage("Your turn (X)");
  };

  const renderCell = (value: string, index: number) => {
    let cellClass = "grid-item";
    if (value !== game.emptySpot) {
      cellClass += ` ${value === game.humanPlayer ? "x-mark" : "o-mark"}`;
    }

    const isWinningCell = winningCombo?.includes(index);
    if (isWinningCell) {
      cellClass += " winning-cell";
      if (value === game.humanPlayer) {
        cellClass += " winning-x";
      } else if (value === game.aiPlayer) {
        cellClass += " winning-o";
      }
    }

    return (
      <div
        key={index}
        className={cellClass}
        onClick={() => handleCellClick(index)}
      >
        {value !== game.emptySpot ? value : ""}
      </div>
    );
  };

  return (
    <div className="page-game">
      {showConfetti && <ReactConfetti recycle={false} />}
      <GameBG />
      <Link to="/">
        <button className="btn-back">
          <TiArrowBackOutline />
        </button>
      </Link>

      <div className="page-grid">
        <div className="left-panel">
          <div className="title-container">
            <img src={logo} alt="logo" className="logo" />
            <p className="title">Tic-Tac-Toe</p>
            <p className="subtitle">A creation by Wicky</p>
          </div>
          <div>
            <div className="stat-time-container">
              <p className="label">Time</p>
              <DigitClockDisplay
                startTime={startTime}
                paused={winningCombo !== null || gameStatus.gameOver}
                sx={{ border: "3px solid #fff" }}
              />
            </div>
            <div className="stat-status-container">
              <p className="label">Status</p>
              <div className={`status-message ${gameStatus.winner ? (gameStatus.winner === 'X' ? 'win' : 'lose') : '' }`}>{message}</div>
            </div>
          </div>
        </div>
        <div className="board-container">
          <div className="board">
            <div className="grid-container">
              {board.map((cell, index) => renderCell(cell, index))}
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div>
            <button className="btn-reset" onClick={resetGame}>
              <GrRefresh />
            </button>
          </div>
          <div className="game-instructions">
            <h3>How to Play</h3>
            <p>Click on any empty square to place your X.</p>
            <p>
              Try to get 3 in a row horizontally, vertically, or diagonally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
