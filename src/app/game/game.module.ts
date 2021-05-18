import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './page/game.component';
import { UltimateBoardComponent } from './components/ultimate-board/ultimate-board.component';
import { BoardComponent } from './components/board/board.component';


@NgModule({
  declarations: [
    GameComponent,
    UltimateBoardComponent,
    BoardComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule
  ]
})
export class GameModule { }
