import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';

import { User } from '../models/user';
import {Player} from '../models/player';
import { Game } from '../models/game';
import { PlayerInit, PlayerRemove } from '../player.actions';
import { GamePlayersConnected } from '../game.actions';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-players-view',
  templateUrl: './players-view.component.html',
  styleUrls: ['./players-view.component.css']
})
export class PlayersViewComponent implements OnInit {
  players$: Observable<Player[]>;
  gameid : string
  game$: Observable<Game>;
  game: Game
  user$: Observable<User>;
  user: User

  constructor(
    private api: ApiService,
    private userStore: Store<{ user: User }>,
    private gameStore: Store<{ game: Game }>,
    private playersStore: Store<{ players: Player[] }>) {
      this.user$ = userStore.pipe(select('user'))
      this.game$ = gameStore.pipe(select('game'))
      this.players$ = playersStore.pipe(select('players'))
  }

  ngOnInit() {
    this.game$.subscribe(value => {
      this.game = value
    })

    this.user$.subscribe(value => {
      this.user = value
    })

    this.players$.subscribe(value => {
      console.log('players$.subscribe', value)
      let allPlayersConnected = value.reduce((out, item) => out = out && item.connected, true)
      this.gameStore.dispatch(new GamePlayersConnected(allPlayersConnected));
    })

  }

  removePlayer(email) {
    this.api.removePlayer$(this.game.gameid, email).subscribe(
      res => {
        this.playersStore.dispatch(new PlayerRemove(email));
      }
    )
  }
}
