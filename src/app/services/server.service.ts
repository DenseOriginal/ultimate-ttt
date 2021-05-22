import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
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

  constructor(
    private fire: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router
  ) {
    this.signin()
  }
  
  async signin() {
    await this.auth.signInAnonymously()
  }

  async createGame() {
    const docRef = await this.fire.collection('games').add({
      red: (Math.random() * 100000).toString(),
      blue: '',
      status: '-'.repeat(81),
      lastmove: ''
    });
  
    this.router.navigate(['game', docRef.id]);
  }
}
