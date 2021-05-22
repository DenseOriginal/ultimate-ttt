import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ServerService } from './server.service';

type Player = "red" | "blue";

export enum ServerStatus {
  PeerError,
  ConnectionError,
  NotStarted,
  Starting,
  PeerOpen,
  WaitingForOpponent,
  Connecting,
  Connected,
  Closed,
  Disconnected
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private _state = new BehaviorSubject('-'.repeat(81));
  public state = this._state.asObservable();

  public activeBoard = -1;

  public currentPlayer: Player = 'red';
  public ready = true;

  public get canPlace(): boolean { return this.server.currentGameData?.lastplayer != this.server.uid }

  constructor(
    private server: ServerService
  ) {
    server.history$.subscribe(doc => {
      console.time('Place call');
      const { board, field, color } = doc;

      let newState = this._state.value.split('');
      newState[board * 9 + field] = color;
      this._state.next(newState.join(''));

      // If the board is won, then set activeBoard to -1
      // Else set the activeBoard to the next board
      if (this.checkWinner(field)) { this.activeBoard = -1 }
      else { this.activeBoard = field }

      // this.currentPlayer = this.currentPlayer == 'red' ? 'blue' : 'red';

      // if (!fromOpponent) this.conn?.send(`${board}${field}`);
      console.timeEnd('Place call');
    });
  }

  place(board: number, field: number): void {
    // If it isn't our turn, we can't place;
    // if (this.currentPlayer != this.thisPlayer && !fromOpponent) return;

    // Don't place if the board isn't active
    // if (this.activeBoard != -1 && this.activeBoard != board) return;
    let newState = this._state.value.split('');
    newState[board * 9 + field] = this.server.meColor;
    this.server.place(newState.join(''), board, field);
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