import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { Utils } from '../utils';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api.service';

import { Player } from '../models/player';
import { Game } from '../models/game';
import { User } from '../models/user';

import {PlayerInit, PlayerFill, PlayerConnectInit, PlayerConnectNew, PlayerDisconnect, PlayerRemove, PlayerAdd} from '../player.actions';
import {GameInit, GameStart} from '../game.actions';
import {UserInit} from '../user.actions';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  gameid : string //###Observable or normal property???
  allPlayersConnected: boolean = true
  wssClientID: string
  game$: Observable<Game>;
  user$: Observable<User>
  user: User
  socket: WebSocket
  wssIsActive: boolean = false
  token: string
  messages: Array<any> = []

  constructor(
    private router: Router,
    private utils: Utils,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private userStore: Store<{ user: User }>,
    private playerStore: Store<{ players: Player[] }>,
    private gameStore: Store<{ game: Game }> ) {
      this.game$ = gameStore.pipe(select('game'));
      this.user$ = userStore.pipe(select('user'));
  }

  ngOnInit() {
      //Auth0 token
      this.auth.getTokenSilently$().subscribe(res => {
          this.token = res
      })

      //Auth0 user profile
      this.auth.getUser$().subscribe(user => {
          this.userStore.dispatch(new UserInit(user))

          //router - new or existing game
          this.activatedRoute.params.subscribe(params => {
            if (params.gameid) {
                this.retrieveGame(params.gameid)
            } else {
                this.gameStore.dispatch(new GameInit({})) //empty
            }
          });
      })

      this.game$.subscribe(value => {
        console.log('this.game$.subscribe', value)
        this.gameid = value.gameid //###???
        //###this.allPlayersConnected
      })

      this.user$.subscribe(value => {
        this.user = value
      })
  }

  private retrieveGame(gameid) {
    this.api.game$(gameid).subscribe(
      res => {
          let game : Game = null
          let players : Array<Player> = []
          if (res) {
            game = new Game()
            game.gameid = gameid
            game.name = res.name
            game.status = res.status
            game.host = res.host
            players = res.players.map(p => { return {...p, gameid: gameid, connected: (p.level > 0)} } )
          }
          this.gameStore.dispatch(new GameInit(game))
          this.playerStore.dispatch(new PlayerFill(players))

          //autoconnect
          this.connectWss()
      },
      error => {
        //###error instanceof HttpErrorResponse
        alert(`Error. Can not retrieve game ${gameid}\n`+JSON.stringify(error.status)+":"+JSON.stringify(error.error))
        this.router.navigate(['/']);
      }
    )
  }

  newGame() {
    this.api.newGame$(this.user).subscribe(
      res => {
        this.disconnectWss()
        this.router.navigate(['/wss/', res.gameid]);
        // this.gameStore.dispatch(new GameInit(res))

        // const player = new Player()
        // player.gameid = res.gameid
        // player.name = res.players[0].name
        // player.email = res.players[0].email
        // player.userid = res.players[0].userid
        // this.playerStore.dispatch(new PlayerInit(player))
      }
    );
  }

  startGame() {
    this.api.resumeGame$(this.gameid, {}).subscribe(
      res => {
        this.gameStore.dispatch(new GameStart(null))
      })
  }

  connectWss() {
      if (!this.gameid) {
          alert('ERROR. No game ID selected. You\'re redirected to home page')
          this.router.navigate(['/']);
          return
      }

      //###temp
      if (this.wssIsActive) {
          alert('ERROR. Already connected')
          return
      }

      this.socket = new WebSocket(this.utils.httpToWs()+"?gameid="+this.gameid+"&userid="+this.user.sub+"&token="+this.token);
      this.webSocketCallbacks(
          () => {
              this.messages.push('[CLIENT] callbackOnOpen')
              this.wssIsActive = true
          },
          (msg) => {
              this.messages.push('[CLIENT] callbackOnMessage')
              this.messages.push(msg)
              let obj = JSON.parse(msg)
              switch (obj.event) {
                  case 'ERROR':
                      this.disconnectWss()
                      alert(obj.payload)
                      //###SERVER or CLIENT closethis.disconnectWss()
                      this.router.navigate(['/']);
                      break;

                  case 'CONNECTION':
                      this.wssClientID = obj.payload.wssClientID
                      this.playerStore.dispatch(new PlayerConnectInit( obj.payload.playersInGame ))
                      break;

                  case 'NEW_PLAYER_CONNECTED':
                    this.playerStore.dispatch(new PlayerConnectNew( obj.payload.playerConnected ))
                    break;

                  case 'DISCONNECTION':
                      this.playerStore.dispatch(new PlayerDisconnect( obj.payload.wssClientID ))
                      break;

                  case 'PLAYER_REMOVED_FROM_GAME':
                    this.playerStore.dispatch(new PlayerRemove( obj.payload.email ))
                    break;

                  case 'PLAYER_ADDED_TO_GAME':
                    this.playerStore.dispatch(new PlayerAdd( obj.payload.player ))
                    break;
              }
          },
          () => {
              this.messages.push('[CLIENT] callbackOnClose')
              this.wssIsActive = false
          }
      )
  }

  disconnectWss() {
      if (this.socket) {
          this.socket.close(1000, 'Web Socket connection closed manually')
          this.playerStore.dispatch(new PlayerDisconnect( {userid: this.user.sub} ))
      }
  }

  private webSocketCallbacks(callbackOnOpen, callbackOnMessage, callbackOnClose) {

    this.socket.onopen = function(e) {
        callbackOnOpen()
    };

    this.socket.onmessage = function (event) {
        callbackOnMessage(event.data)
    }

    this.socket.onclose = function(event) {
        callbackOnClose()
        let msg
        if (event.wasClean) {
            msg = `[client]  Connection closed cleanly, code=${event.code} reason=${event.reason}`
            alert(msg)
            console.log(msg);
            //###redirect home this.router.navigate(['/']);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            msg = '[close] Connection died'
            alert(msg)
            console.log(msg);
            //###redirect home this.router.navigate(['/']);
        }
    };

    this.socket.onerror = function(error) {
        console.log('[error]', JSON.stringify(error));
    };
  }

  //###temp
  clearMessages() {
      this.messages.length = 0
  }

}
