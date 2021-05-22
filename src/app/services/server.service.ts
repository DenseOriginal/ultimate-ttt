import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

interface GameDoc {
  red: string;
  blue: string;
  state: string;
  lastmove: string;
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

  constructor(private fire: AngularFirestore, private router: Router) { }

  async createGame() {
    const docRef = await this.fire.collection('games').add({
      red: (Math.random() * 100000).toString(),
      blue: undefined,
      status: '-'.repeat(81),
      lastmove: undefined
    });
  
    this.router.navigate(['game', docRef.id]);
  }
}
