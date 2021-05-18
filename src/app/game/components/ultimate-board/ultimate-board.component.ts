import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { map } from "rxjs/operators";

@Component({
  selector: 'app-ultimate-board',
  templateUrl: './ultimate-board.component.html',
  styleUrls: ['./ultimate-board.component.scss']
})
export class UltimateBoardComponent implements OnInit {
  gameStateSegments = this.gameService.state.pipe(
    map(state => state.match(/.{1,9}/g))
  );

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

}
