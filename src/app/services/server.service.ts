import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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
  color: 'R' | 'B'
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
  private uid$ = this.auth$.pipe(map(user => user?.uid));
  public uid: string = "";
  public currentGameRef?: AngularFirestoreDocument<GameDoc>;
  public currentGameId?: string;
  public currentGameData?: GameDoc;
  public get meColor(): 'R' | 'B' | 'Spectator' {
    return this.currentGameData?.blue == this.uid ? 'B' :
           this.currentGameData?.red == this.uid ? 'R' : 'Spectator'
  };

  public playersReady = this.game$.pipe(
    map(game => game.blue && game.red));

  constructor(
    private fire: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router
  ) {
    this.signin();
    this.uid$.subscribe(uid => this.uid = uid || "");
    this.game$.subscribe(game => this.currentGameData = game);
  }
  
  async signin() {
    await this.auth.signInAnonymously()
  }

  async createGame() {
    const docRef = await this.fire.collection('games').add({
      red: this.uid,
      blue: '',
      state: '-'.repeat(81),
      lastplayer: ''
    });
  
    this.router.navigate(['game', docRef.id]);
  }

  async joinGame(gameID: string) {
    const uid = this.uid;
    const gameRef = this.fire.collection('games').doc<GameDoc>(gameID);
    this.currentGameRef = gameRef;
    this.currentGameId = gameID;

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
          .map(doc => ({
            ...doc,
            color: this.currentGameData?.blue == doc.player ? 'B' :
                   this.currentGameData?.red == doc.player ? 'R' : '' as 'R' | 'B'
          }))
          .forEach(doc => this._history$.next(doc));
      })
  }

  place(newState: string, board: number, field: number) {
    try {
      if(this.meColor == "Spectator") return;

      this.currentGameRef?.collection('history').add({
        board,
        field,
        player: this.uid,
        timestamp: new Date()
      } as HistoryDoc);
  
      this.currentGameRef?.update({
        state: newState,
        lastplayer: this.uid
      });
    } catch (error) {
      console.log(error);
    }
  }
}
