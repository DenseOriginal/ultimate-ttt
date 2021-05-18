import { Component, Input, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  @Input() active!: boolean;
  @Input() state!: string;
  @Input() id!: number;

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

}
