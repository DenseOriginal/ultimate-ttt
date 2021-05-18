import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Player = "red" | "blue";
@Injectable({
  providedIn: 'root'
})
export class GameService {

  private _state = new BehaviorSubject('-'.repeat(81));
  public state = this._state.asObservable();

  constructor() { }

  place(board: number, field: number, player: Player): void {
    let newState = this._state.value.split('');
    newState[board * 9 + field] = player == 'red' ? 'R' : 'B';
    this._state.next(newState.join(''));
  }
}
