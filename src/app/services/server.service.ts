import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

interface GameDoc {
  red: string;
  blue: string;
  state: string;
  lastplayer: string;
}

interface HistoryDoc {
  board: number;
  field: number;
  player: string;
  timestamp: Date;
}
@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private _history$ = new Subject<HistoryDoc>();
  public history$ = this._history$.asObservable();
  private _game$ = new Subject<GameDoc>();
  public game$ = this._game$.asObservable();
  public auth$ = this.auth.user;

  constructor(
    private fire: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router
  ) {
    this.signin();
  }
  
  async signin() {
    await this.auth.signInAnonymously()
  }

  async createGame() {
    const docRef = await this.fire.collection('games').add({
      red: (await this.auth.currentUser)?.uid,
      blue: '',
      status: '-'.repeat(81),
      lastplayer: ''
    });
  
    this.router.navigate(['game', docRef.id]);
  }

  async joinGame(gameID: string) {
    const uid = (await this.auth.currentUser)?.uid;
    const gameRef = this.fire.collection('games').doc<GameDoc>(gameID);
    const data = (await gameRef.get().toPromise()).data();
    if(data?.red != uid && data?.blue == "") {
      await gameRef.update({
        blue: uid
      });
    }

    gameRef.valueChanges().subscribe(g => (g && this._game$.next(g)));
    gameRef.collection<HistoryDoc>('history', ref => ref.orderBy('timestamp'))
      .stateChanges()
      .subscribe(docs => {
        docs.filter(doc => doc.type == "added")
          .map(doc => doc.payload.doc.data())
          .forEach(doc => this._history$.next(doc));
      })
  }
}
