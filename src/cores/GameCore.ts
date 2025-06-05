export class GameCore {
  private readonly humanPlayer: string = "X";
  private readonly aiPlayer: string = "O";
  private readonly emptySpot: string = " ";
  private firstMove: boolean = true;

  // AI difficulty settings (0 = easy, 1 = hard)
  private aiDifficulty: number = 0.8;
  private readonly winningCombinations: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  private board: string[];
  private currentPlayer: string;

  constructor(difficulty: number = 0.8) {
    this.board = Array(9).fill(this.emptySpot);
    this.currentPlayer = this.humanPlayer;
    this.firstMove = true;
    this.setDifficulty(difficulty);
  }

  // Set AI difficulty (0 = easy, 1 = hard)
  public setDifficulty(difficulty: number): void {
    this.aiDifficulty = Math.max(0, Math.min(1, difficulty));
  }

  // Print the board to console
  public printBoard(): void {
    for (let i = 0; i < 3; i++) {
      console.log(this.board.slice(i * 3, i * 3 + 3).join(" | "));
      if (i < 2) console.log("--+---+--");
    }
  }

  // Check if a player has won
  public checkWinner(player: string): boolean {
    for (const combo of this.winningCombinations) {
      if (combo.every((index) => this.board[index] === player)) {
        return true;
      }
    }
    return false;
  }

  // Check if the game is a draw
  public checkDraw(): boolean {
    return this.board.every((cell) => cell !== this.emptySpot);
  }

  // Check if a move is valid
  public isMoveValid(move: number): boolean {
    return this.board[move] === this.emptySpot;
  }

  // Minimax algorithm for AI decision making
  private minimax(
    board: string[],
    depth: number,
    isMaximizing: boolean
  ): number {
    if (this.checkWinner(this.aiPlayer)) {
      return 10 - depth;
    } else if (this.checkWinner(this.humanPlayer)) {
      return depth - 10;
    } else if (this.checkDraw()) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === this.emptySpot) {
          board[i] = this.aiPlayer;
          const score = this.minimax(board, depth + 1, false);
          board[i] = this.emptySpot;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === this.emptySpot) {
          board[i] = this.humanPlayer;
          const score = this.minimax(board, depth + 1, true);
          board[i] = this.emptySpot;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  // AI finds the best move
  public findBestMove(): number {
    // Sometimes make a random move based on difficulty
    if (Math.random() > this.aiDifficulty) {
      const availableMoves = this.board
        .map((value, index) => (value === this.emptySpot ? index : -1))
        .filter((index) => index !== -1);
      if (availableMoves.length > 0) {
        return availableMoves[
          Math.floor(Math.random() * availableMoves.length)
        ];
      }
    }

    let bestScore = -Infinity;
    let bestMoves: number[] = []; // Store all equally good moves

    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] === this.emptySpot) {
        this.board[i] = this.aiPlayer;
        const score = this.minimax(this.board, 0, false);
        this.board[i] = this.emptySpot;

        if (score > bestScore) {
          bestScore = score;
          bestMoves = [i];
        } else if (score === bestScore) {
          bestMoves.push(i);
        }
      }
    }

    // If multiple equally good moves, choose randomly among them
    if (bestMoves.length > 0) {
      // For first move, sometimes choose a random corner (giving fairness)
      if (this.firstMove && Math.random() < 0.7) {
        // 70% chance to pick random corner first move (70% is enough?)
        this.firstMove = false;
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(
          (c) => this.board[c] === this.emptySpot
        );
        if (availableCorners.length > 0) {
          return availableCorners[
            Math.floor(Math.random() * availableCorners.length)
          ];
        }
      }

      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    // Fallback (shouldn't normally happen)
    const availableMoves = this.board
      .map((value, index) => (value === this.emptySpot ? index : -1))
      .filter((index) => index !== -1);
    return availableMoves.length > 0
      ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
      : -1;
  }

  // Make a human move
  public humanMove(move: number): boolean {
    if (
      move >= 0 &&
      move < 9 &&
      this.isMoveValid(move) &&
      this.currentPlayer === this.humanPlayer
    ) {
      this.board[move] = this.humanPlayer;
      this.currentPlayer = this.aiPlayer;
      return true;
    }
    return false;
  }

  // Make an AI move
  public aiMove(): void {
    if (this.currentPlayer === this.aiPlayer) {
      const move = this.findBestMove();
      if (move !== -1) {
        this.board[move] = this.aiPlayer;
      }
      this.currentPlayer = this.humanPlayer;
    }
  }

  // Get current game status
  public getGameStatus(): {
    winner: string | null;
    isDraw: boolean;
    gameOver: boolean;
  } {
    if (this.checkWinner(this.humanPlayer)) {
      return { winner: this.humanPlayer, isDraw: false, gameOver: true };
    } else if (this.checkWinner(this.aiPlayer)) {
      return { winner: this.aiPlayer, isDraw: false, gameOver: true };
    } else if (this.checkDraw()) {
      return { winner: null, isDraw: true, gameOver: true };
    }
    return { winner: null, isDraw: false, gameOver: false };
  }

  public getWinningCombo(): number[] | null {
    for (const combo of this.winningCombinations) {
      if (combo.every((index) => this.board[index] === this.humanPlayer)) {
        return combo;
      }
      if (combo.every((index) => this.board[index] === this.aiPlayer)) {
        return combo;
      }
    }
    return null;
  }

  // Reset the game
  public reset(): void {
    this.board = Array(9).fill(this.emptySpot);
    this.currentPlayer = this.humanPlayer;
    this.firstMove = true;
  }

  // Get current board state
  public getBoard(): string[] {
    return [...this.board];
  }

  // Get current player
  public getCurrentPlayer(): string {
    return this.currentPlayer;
  }
}
