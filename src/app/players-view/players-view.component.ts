import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription} from 'rxjs';
import { Store} from '@ngrx/store';

import { User } from '../models/user';
import { Player } from '../models/player';
import { Game } from '../models/game';
import { PlayerRemove } from '../player.actions';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-players-view',
  templateUrl: './players-view.component.html',
  styleUrls: ['./players-view.component.css']
})
export class PlayersViewComponent implements OnInit {
  subscription: Subscription
  game: Game
  players: Array<any>
  user: User

  constructor(
      private api: ApiService,
      private gameStore: Store<{ user: User, game: Game, players: Player[] }>) {
  }

  ngOnInit() {
      this.subscription = combineLatest(
          this.gameStore.select('user'),
          this.gameStore.select('game'),
          this.gameStore.select('players')
      ).subscribe(([user, game, players]) => {
          this.user = user
          this.game = game
          this.players = players
      })
  }

  ngOnDestroy() {
      if (this.subscription) this.subscription.unsubscribe()
  }

  removePlayer(email) {
      this.api.removePlayer$(this.game.gameid, email).subscribe(
          res => {
              this.gameStore.dispatch(new PlayerRemove(email));
          }
      )
  }
}
