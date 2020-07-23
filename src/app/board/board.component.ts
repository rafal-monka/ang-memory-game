import { Component, OnInit, Input  } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { MessagesService } from '../messages.service'
import { ApiService } from '../api.service';
import { Game } from '../models/game';
import { User } from '../models/user';

const CONST_SIZE = 8

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
/*###UNUSED*/
export class BoardComponent implements OnInit {

  @Input()
  user: User

  @Input()
  theme: string

  @Input()
  allPlayersConnected: boolean

  @Input()
  yourMove: boolean

  subscription: Subscription

  pictures: Array<any>
  game: Game
  board: Array<any>

  _setSIZE: Array<number> = [...Array(CONST_SIZE).keys()]

  constructor(
      private api: ApiService,
      private messanger: MessagesService,
      private gameStore: Store<{ game: Game, board: Array<any> }>) {
  }

  ngOnInit() {
      this.subscription = combineLatest(
        this.api.pictures$(this.theme),
        this.gameStore.select('game'),
        this.gameStore.pipe(select('board'))
    ).subscribe(([pictures, game, board]) => {
        this.game = game
        this.board = board
        this.pictures=pictures
    })
  }

  ngOnDestroy() {
      if (this.subscription) this.subscription.unsubscribe()
  }

  onCardClick(r,c,v) {
    if (this.yourMove && this.allPlayersConnected) {
        let card = {
            row: r,
            col: c
        }
        this.messanger.sendWssMessage('CLICKCARD', card)
    } else {
        alert(!this.yourMove?'Now is not your turn!':'' + !this.allPlayersConnected?'Not players are connected!':'')
    }
  }

}
