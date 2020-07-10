import {Component} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';

import { Game } from '../models/game';
import { Player } from '../models/player';
import { PlayerAdd } from '../player.actions';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-add',
  templateUrl: './player-add.component.html',
  styleUrls: ['./player-add.component.css']
})
export class PlayerAddComponent {

  game: Observable<Game>;
  players: Observable<Player[]>;
  gameid : string

  constructor(
    private api: ApiService,
    private gameStore: Store<{ game: Game }>,
    private playersStore: Store<{ players: Player[] }>) {
    this.players = playersStore.pipe(select('players'));
    this.game = gameStore.pipe(select('game'));
  }

  ngOnInit() {
    this.game.subscribe(value => {
      console.log('PlayerAddComponent.ngOnInit() / this.game.subscribe, value=', value)
      this.gameid = value.gameid
    })
  }

  AddPlayer(text: string) {
    let playerText = text.trim()
    if (playerText === '') return
    console.log('PlayerAddComponent.AddPlayer()')
    console.log('AddPlayer, this.game=', this.game)
    //###check if email already exists
    let hashkey = Date.now().toString(32).toUpperCase() //for Computer user unique(id) value
    let ifEmail = playerText.indexOf('@') > -1
    let userid = ifEmail ? '#USERID_NOT_KNOWN_YET#' : hashkey
    let email = ifEmail ? playerText : hashkey
    let name = ifEmail ? '#NAME_NOT_KNOWN_YET#' : playerText.substring(0, playerText.indexOf(':'))
    let level = ifEmail ? null : playerText.substring(playerText.indexOf(':')+1) || 100

    this.api.addPlayer$(this.gameid, userid, email, name, level).subscribe(
      res => {
        console.log('PlayerAddComponent.AddPlayer() / this.api.addPlayer$().subscribe - res', res)
        const player : Player = res
        player.gameid = this.gameid
        player.connected = (player.level > 0)
        this.playersStore.dispatch(new PlayerAdd(player))
      },
      error => {
         alert('Cannot add new player\n'+JSON.stringify(error.error))
      }
    );
  }

}
