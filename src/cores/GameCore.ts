import { globalEvents } from "./GlobalEventHandler";

type GameStatus = "waiting" | "playing" | "finished";
type GameTile = {
  id: number;
  attribute: {
    row: number;
    col: number;
    num: number;
    empty: boolean;
    style?: React.CSSProperties;
    backgroundPosition?: string;
  };
};

export class GameCore {
  public status: GameStatus = "waiting";
  public tileNumber: number = 3;
  public board: GameTile[] = [];
  private moves: number = 0;
  private startTime = new Date();

  constructor(tileNumber: number = 3) {
    this.setTileNumber(tileNumber);
  }

  public setTileNumber(tileNumber: number) {
    this.tileNumber = tileNumber;
  }

 public setupBoard() {
  this.status = "waiting";
  this.board = [];

  for (let col = 0; col < this.tileNumber; col++) {
    for (let row = 0; row < this.tileNumber; row++) {
      const backgroundPosition = `${(col / (this.tileNumber - 1)) * 100}% ${(row / (this.tileNumber - 1)) * 100}%`;
      
      this.board.push({
        id: row * this.tileNumber + col,
        attribute: {
          row,
          col,
          num: row * this.tileNumber + col + 1,
          empty: false,
          style: { 
            backgroundColor: "red", 
            color: "white",
            backgroundPosition: backgroundPosition,
            backgroundSize: `${this.tileNumber * 100}%`
          },
          backgroundPosition: backgroundPosition
        },
      });
    }
  }

  let emptyTile = this.board[this.tileNumber * this.tileNumber - 1];
  emptyTile.attribute.empty = true;
  emptyTile.attribute.style = { 
    backgroundColor: "#16a800", 
    color: "black",
    backgroundImage: 'none'
  };
  this.startTime = new Date()
  this.status = "playing";
}

  public getTiles() {
    return this.board;
  }

  public getStatus() {
    return this.status;
  }

  public getStartTime() {
    return this.startTime;
  }

  public selectTile(tile: GameTile) {
    if (this.status !== "playing") return this.board;

    let emptyTile = this.board.find((tile) => tile.attribute.empty)!;
    if (this.getMovableTiles().includes(tile)) {
      const tempNum = tile.attribute.num;
      tile.attribute.num = emptyTile.attribute.num;
      emptyTile.attribute.num = tempNum;

      tile.attribute.empty = !tile.attribute.empty;
      emptyTile.attribute.empty = !emptyTile.attribute.empty;

      const tempStyle = tile.attribute.style;
      tile.attribute.style = emptyTile.attribute.style;
      emptyTile.attribute.style = tempStyle;

      this.moves += 1;

      if (this.isBoardWin()) {
        this.status = "finished";
      }

      globalEvents.emit("tileMoved", { game: this, board: this.board });
      return this.board;
    }
    globalEvents.emit("tileMoved", { game: this, board: this.board });

    return this.board;
  }

  public getMovableTiles() {
    let emptyTile: GameTile = this.board.find((tile) => tile.attribute.empty)!;

    if (emptyTile) {
      let upTile = this.board.find(
        (tile) =>
          tile.attribute.row === emptyTile.attribute.row &&
          tile.attribute.col === emptyTile.attribute.col - 1
      );
      let downTile = this.board.find(
        (tile) =>
          tile.attribute.row === emptyTile.attribute.row &&
          tile.attribute.col === emptyTile.attribute.col + 1
      );
      let leftTile = this.board.find(
        (tile) =>
          tile.attribute.row === emptyTile.attribute.row - 1 &&
          tile.attribute.col === emptyTile.attribute.col
      );
      let rightTile = this.board.find(
        (tile) =>
          tile.attribute.row === emptyTile.attribute.row + 1 &&
          tile.attribute.col === emptyTile.attribute.col
      );

      return [upTile, downTile, leftTile, rightTile].filter(
        (tile) => tile !== undefined
      );
    }
    return emptyTile;
  }

  public shuffleBoard() {
    const shuffleMoves = this.tileNumber * 100;

    for (let i = 0; i < shuffleMoves; i++) {
      const emptyTile = this.board.find((tile) => tile.attribute.empty)!;
      const movableTiles = this.getMovableTiles();

      if (movableTiles.length > 0) {
        const randomIndex = Math.floor(Math.random() * movableTiles.length);
        const randomTile = movableTiles[randomIndex];

        const tempNum = randomTile.attribute.num;
        const tempStyle = randomTile.attribute.style;

        randomTile.attribute.num = emptyTile.attribute.num;
        randomTile.attribute.style = emptyTile.attribute.style;
        randomTile.attribute.empty = true;

        emptyTile.attribute.num = tempNum;
        emptyTile.attribute.style = tempStyle;
        emptyTile.attribute.empty = false;
      }
    }
    globalEvents.emit("tileMoved", { game: this, board: this.board });
  }

  public getMoves() {
    return this.moves;
  }

  public resetGame() {
    this.moves = 0;
    this.setupBoard();
    this.shuffleBoard();
    globalEvents.emit("tileMoved", { game: this, board: this.board });
  }

  public displayBoard() {
    console.log(
      this.board
        .map((tile, i) => {
          return i % this.tileNumber === 0
            ? `\n${JSON.stringify({
                r: tile.attribute.row,
                c: tile.attribute.col,
                e: tile.attribute.empty,
              })}`
            : JSON.stringify({
                r: tile.attribute.row,
                c: tile.attribute.col,
                e: tile.attribute.empty,
              });
        })
        .join(",")
    );
  }

  public getWinningBoard(): GameTile[] {
    const winningBoard: GameTile[] = [];
    for (let col = 0; col < this.tileNumber; col++) {
      for (let row = 0; row < this.tileNumber; row++) {
        winningBoard.push({
          id: row * this.tileNumber + col,
          attribute: {
            row,
            col,
            num: row * this.tileNumber + col + 1,
            empty: row === this.tileNumber - 1 && col === this.tileNumber - 1,
            style: row === this.tileNumber - 1 && col === this.tileNumber - 1 
              ? { backgroundColor: "#16a800", color: "black" }
              : { backgroundColor: "red", color: "white" }
          },
        });
      }
    }
    return winningBoard;
  }

  public isBoardWin(): boolean {
    const winningBoard = this.getWinningBoard();
    if (this.board.length !== winningBoard.length) return false;

    for (let i = 0; i < this.board.length; i++) {
      const currentTile = this.board[i];
      const winningTile = winningBoard[i];

      if (
        currentTile.attribute.num !== winningTile.attribute.num ||
        currentTile.attribute.empty !== winningTile.attribute.empty
      ) {
        return false;
      }
    }

    return true;
  }
}