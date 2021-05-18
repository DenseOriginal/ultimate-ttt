import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Player = "red" | "blue";
@Injectable({
  providedIn: 'root'
})
export class GameService {

  private _state = new BehaviorSubject('-'.repeat(81));
  public state = this._state.asObservable();

  public activeBoard = -1;

  constructor() { }

  place(board: number, field: number, player: Player): void {
    // Don't place if the board isn't active
    if (this.activeBoard != -1 && this.activeBoard != board) return;

    let newState = this._state.value.split('');
    newState[board * 9 + field] = player == 'red' ? 'R' : 'B';
    this._state.next(newState.join(''));

    // If the board is won, then set activeBoard to -1
    // Else set the activeBoard to the next board
    if (this.checkWinner(field)) { this.activeBoard = -1 }
    else { this.activeBoard = field }

  }

  checkWinner(board: number): Player | undefined {
    const boardState = this._state.value.substr(board * 9, 9);
    const redPattern = parseInt(
      boardState.split('').map((cur) => (cur == "R" ? "1" : "0")).join(""),
      2
    );

    const bluePattern = parseInt(
      boardState.split('').map((cur) => (cur == "B" ? "1" : "0")).join(""),
      2
    );

    // Red win
    if (winPatterns.some((pattern) => (redPattern & pattern) == pattern)) {
      return 'red'
    }

    // Blue win
    if (winPatterns.some((pattern) => (bluePattern & pattern) == pattern)) {
      return 'blue'
    }

    return undefined;
  }
}

// binary reprensations af win patters
// Example (Diagonal win)
// 100
// 010
// 001
// Or 100010001
// Or 273
const winPatterns = [448, 56, 7, 292, 146, 73, 273, 84];