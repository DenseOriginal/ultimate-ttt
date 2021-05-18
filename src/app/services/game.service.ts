import { Injectable, NgZone } from '@angular/core';
import Peer from 'peerjs';
import { BehaviorSubject } from 'rxjs';

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

  // Server stuff
  private host = !location.hash;
  private peer = new Peer(Math.floor(Math.random() * 1000000000).toString());
  private conn?: Peer.DataConnection;
  private _serverStatus = new BehaviorSubject<ServerStatus>(ServerStatus.NotStarted);
  public serverStatus = this._serverStatus.asObservable();

  public thisPlayer: Player = this.host ? 'red' : 'blue';
  public get canPlace(): boolean { return this.thisPlayer == this.currentPlayer }

  constructor(private zone: NgZone) {
    this._serverStatus.next(ServerStatus.Starting);
    this.peer.on('close', () => console.log('Peer closed'));
    this.peer.on('disconnected', () => console.log('Peer disconnected'));
    this.peer.on('error', (err) => {
      this._serverStatus.next(ServerStatus.PeerError);
      console.log('Peer error: ', err);
    });
    this.peer.on('open', (id) => {
      console.log('Peer open, id: ' + id);
      this._serverStatus.next(ServerStatus.PeerOpen);

      if (this.host) {
        this._serverStatus.next(ServerStatus.WaitingForOpponent)
        this.peer.on('connection', conn => {
          console.log('Peer received connection');
          this.setupPeerConnection(conn);
        });
      } else {
        const idToConnect = prompt('Id to connect') || '';
        const conn = this.peer.connect(idToConnect);
        console.log('Connection to ', idToConnect);
        this.setupPeerConnection(conn);
      }
    })
  }

  place(board: number, field: number, fromOpponent = false): void {
    // If it isn't our turn, we can't place;
    if (this.currentPlayer != this.thisPlayer && !fromOpponent) return;

    // Don't place if the board isn't active
    if (this.activeBoard != -1 && this.activeBoard != board) return;
    console.time('Place call');

    let newState = this._state.value.split('');
    newState[board * 9 + field] = this.currentPlayer == 'red' ? 'R' : 'B';
    this._state.next(newState.join(''));

    // If the board is won, then set activeBoard to -1
    // Else set the activeBoard to the next board
    if (this.checkWinner(field)) { this.activeBoard = -1 }
    else { this.activeBoard = field }

    this.currentPlayer = this.currentPlayer == 'red' ? 'blue' : 'red';

    if (!fromOpponent) this.conn?.send(`${board}${field}`);
    console.timeEnd('Place call');
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

  setupPeerConnection(conn: Peer.DataConnection): void {
    this._serverStatus.next(ServerStatus.Connecting)
    this.conn = conn;
    console.log('Setting up connection, ', conn.peer);

    conn.on('open', () => {
      console.log('Connection open');
      this._serverStatus.next(ServerStatus.Connected);

      conn.on('data', data => {
        console.log('Data received: ', data);
        this.zone.run(() => {
          this.place(+data[0], +data[1], true);
        })
      });
    });

    conn.on('error', (err) => {
      this._serverStatus.next(ServerStatus.ConnectionError);
      console.log('Connection error: ', err);
    });
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