import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { GameService, ServerStatus } from 'src/app/services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  output$ = this.gameService.serverStatus.pipe(
    map(status => {
      switch (status) {
        case ServerStatus.PeerError: return "Couldn't connect to the server";
        case ServerStatus.ConnectionError: return "Something happened to the connection";
        case ServerStatus.WaitingForOpponent: return "Waiting for opponent";
        case ServerStatus.Connecting: return "Connection to opponent";
        case ServerStatus.Connected: return "Connected";
        case ServerStatus.Disconnected: return "Disconnected";
        case ServerStatus.Closed: return "Connection to the server closed";
        case ServerStatus.NotStarted: return "Server is not ready";
        case ServerStatus.Starting: return "Server is starting";
        default: return "";
      }
    })
  )

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

}
