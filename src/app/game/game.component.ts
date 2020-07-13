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
import {GameInit, GameStart, GameGeneral} from '../game.actions';
import {UserInit} from '../user.actions';
import {BoardInit, BoardOpenCard, BoardTakeCards, BoardPutBackCards} from '../board.actions';

const CONST_SIZE = 8

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  gameid : string //###Observable or normal property???
  currentPlayerInx: number //###
  players: Array<any>

  allPlayersConnected: boolean = true
  wssClientID: string

  user: User
  socket: WebSocket
  wssIsActive: boolean = false
  token: string
  messages: Array<any> = []

  _setSIZE: Array<number> = [...Array(CONST_SIZE).keys()]
  game$: Observable<Game>
  user$: Observable<User>
  players$: Observable<Player[]>
  board$: Observable<Array<any>>

  constructor(
    private router: Router,
    private utils: Utils,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private userStore: Store<{ user: User }>,
    private playerStore: Store<{ players: Player[] }>,
    private gameStore: Store<{ game: Game }>,
    private boardStore: Store<{ board: Array<any> }>
    ) {
      this.game$ = gameStore.pipe(select('game'))
      this.players$ = playerStore.pipe(select('players'))
      this.user$ = userStore.pipe(select('user'))
      this.board$ = boardStore.pipe(select('board')) //???init board
  }

  private go(user) {
    console.log('go', user)
    this.userStore.dispatch(new UserInit(user))
    //router - new or existing game
    this.activatedRoute.params.subscribe(params => {
      console.log('params.gameid', params.gameid)
      if (params.gameid) {
          this.retrieveGame(params.gameid)
      } else {
          this.gameStore.dispatch(new GameInit({})) //empty
      }
    });
  }

  ngOnInit() {
      console.log('game.component.ngOnInit()')
      //@@@AUTH0
      if (false) this.go({
        sub: 'google-oauth2|103332170467986196787',
        email: 'monka.rafal@gmail.com',
        name: 'Test user RM',
        email_verified: true
      })

      //Auth0 token
      if (true) this.auth.getTokenSilently$().subscribe(res => {
          this.token = res
      })

      //Auth0 user profile
      if (true) this.auth.getUser$().subscribe(user => {
          this.go(user)
      })

      // this.game$.subscribe(value => {
      //   console.log('this.game$.subscribe', value)
      //   this.gameid = value.gameid //###???
      //   //###this.allPlayersConnected
      // })

      this.user$.subscribe(value => {
        this.user = value
      })

      this.board$.subscribe(value => {
        //console.log('board$.subscribe', value)
      })

      this.game$.subscribe(value => {
        console.log('game-component.game$.subscribe', value.currentPlayerInx)
        this.currentPlayerInx = value.currentPlayerInx
      })

      this.players$.subscribe(value => {
        console.log('game-component.players$.subscribe', value)
        this.players = value
      })
  }

  private retrieveGame(gameid) {
    console.log('retrieveGame', gameid)
    this.api.game$(gameid).subscribe(
      res => {
          console.log('retrieveGame.subscribe', res)
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
          this.gameid = gameid
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

  startGameAPIXXXX() {
    this.api.resumeGame$(this.gameid, {status: 'STARTED'}).subscribe(
      res => {
        this.gameStore.dispatch(new GameStart(res))
      })
  }

  private sendWssMessage(action, value) {
      const message = {
          sender: this.wssClientID,
          action: action,
          value: value,
      };
      this.wsSend(message)
  }

  startGame() {
      this.sendWssMessage('START', this.gameid)
  }

  onCardClick(r,c,v) {
      console.log('onCardClick', r,c,v)
      console.log('users', this.user.sub, this.players[this.currentPlayerInx].userid)
      //###@@@api.put (count++).then(

      if (this.user.sub === this.players[this.currentPlayerInx].userid) {
          let card = {
              row: r,
              col: c,
              open: true,
              value: v,
              count: 1 /*###from DB*/
          }
          this.sendWssMessage('CLICKCARD', card)

      } else {
          alert('Not your turn! Now is the move of player #'+this.players[this.currentPlayerInx].userid)
      }

  }

  wsSend(message) {
      console.log('wsSend', this.socket)
      if (this.socket.readyState === 1) { //https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
          this.socket.send( JSON.stringify(message) )
      } else {
          alert(' WebSocket is already in CONNECTING, CLOSING or CLOSED state.')
      }

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
              //this.messages.push('[CLIENT] callbackOnMessage')
              this.messages.push(msg)
              let obj = JSON.parse(msg)
              switch (obj.event) {

                  case 'TEST':
                      alert(JSON.stringify(obj.payload))
                      break

                  case 'ERROR':
                      this.disconnectWss()
                      alert(obj.payload)
                      //###SERVER or CLIENT closethis.disconnectWss()
                      this.router.navigate(['/']);
                      break;

                  //events - preparing game
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

                  //events - playing game
                  case 'INITGAME': //###not used
                      //this.boardStore.dispatch(new BoardInit( obj.payload ))
                      break;

                  case 'RESUME':
                      //@@@players, etc. - dispatch game state
                      this.playerStore.dispatch(new PlayerConnectInit( obj.payload.players ))
                      this.boardStore.dispatch(new BoardInit( obj.payload.board ))
                      break;

                  case 'OPENCARD':
                    //this.gameStore.dispatch(new GameGeneral(obj.event, obj.payload) )
                    this.boardStore.dispatch(new BoardOpenCard( obj.payload ))
                    break;

                  case 'TAKECARDS':
                    this.boardStore.dispatch(new BoardTakeCards( obj.payload ))
                    break;

                  case 'PUTBACKCARDS':
                    this.boardStore.dispatch(new BoardPutBackCards( obj.payload ))
                    break;

                  case 'NEXTPLAYER':
                    this.gameStore.dispatch(new GameGeneral(obj.event, obj.payload) )
                    break;

                  case 'GAMEOVER':
                    break;

                  default:
                    alert('ERROR. Unknown event '+obj.event)
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
