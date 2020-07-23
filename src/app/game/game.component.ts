import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators'
import { select, Store } from '@ngrx/store';

import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api.service';
import { MessagesService } from '../messages.service'

import { Player } from '../models/player';
import { Game } from '../models/game';
import { User } from '../models/user';

import {/* PlayerInit,*/ PlayerConnectInit, PlayerConnectNew, PlayerDisconnect, PlayerRemove, PlayerAdd, PlayerScore, PlayerMissed } from '../player.actions';
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

  _setSIZE: Array<number> = [...Array(CONST_SIZE).keys()]
  wssClientID: string
  wssIsActive: boolean = false
  token: string
  messages: Array<any> = [] //###temp

  user: User
  pictures: Array<any>
  game: Game
  players: Array<Player>
  board: Array<any>

  yourMove: boolean
  allPlayersConnected: boolean = false

  subscription1: Subscription
  subscription2: Subscription

  constructor(
    private router: Router,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private messanger: MessagesService,
    private gameStore: Store<{ user: User, game: Game, board: Array<any>, players: Player[] }>,
   ) {

      //???hot:
      // gameStore.pipe(
      //   select('game'),
      //   switchMap(this.getUser$()), //eliminate race condition
      //   shareReplay(1), //1=???
      //   share()
      //)
  }

  ngOnInit() {
      //subscription 1 - Auth0 user and token, and activatedRoute
      this.subscription1 = combineLatest(
          this.auth.getUser$(),
          this.auth.getTokenSilently$(),
          this.activatedRoute.params,
          this.activatedRoute.queryParams
      ).subscribe(([user, token, params, queryParams]) => {
          this.user = user
          this.token = token
console.log('queryParams.theme=',queryParams.theme)
// return
          //disptach user data
          this.gameStore.dispatch(new UserInit(user))

          if (params.gameid) {
              this.retrieveGame(params.gameid)
          } else {
              if (queryParams.theme) this.newGame(queryParams.theme)
              //this.gameStore.dispatch(new GameInit({})) //empty
          }

          //###@@@AUTH0
          if (false) this.user = {
            sub: 'google-oauth2|103332170467986196787',
            email: 'monka.rafal@gmail.com',
            name: 'Test user RM',
            email_verified: true
          }
      })

      //subscription 2 - store changes
      this.subscription2 = combineLatest(
          this.gameStore.select('game'),
          this.gameStore.select('players'),
          this.gameStore.pipe(select('board'))
      ).subscribe(([game, players, board]) => {
          this.game = game
          this.players = players
          this.board = board

          //yourMove
          if (game && players && players.length > 0 && this.user) { //###???inaczej warunki game.?
              this.yourMove = (game.status === 'STARTED' && this.user.email === players[game.currentPlayerInx].email)
          }

          //allPlayersConnected
          this.allPlayersConnected = players.reduce((accumulator, currentValue) => {
            return accumulator && currentValue.connected
          } , true )
      })
  }

  ngOnDestroy() {
      if (this.subscription1) this.subscription1.unsubscribe()
      if (this.subscription2) this.subscription2.unsubscribe()
  }

  private retrieveGame(gameid) {
      this.api.game$(gameid).subscribe(
          res => {
              this.api.pictures$(res.theme).subscribe(res => {
                  this.pictures=res
              })
              this.gameStore.dispatch(new GameInit(res))
              this.gameStore.dispatch(new BoardInit(res.board))

              //connect to web socket
              this.connectWss(gameid)
          },
          error => {
              //###error instanceof HttpErrorResponse
              alert(`Error. Can not retrieve game ${gameid}\n`+JSON.stringify(error.status)+":"+JSON.stringify(error.error))
              this.router.navigate(['/'])
          }
      )
  }

  newGame(theme) {
      console.log('newGame() theme=', theme)
      this.api.newGame$(this.user, theme).subscribe(
        res => {
            //---###this.disconnectWss()
            this.router.navigate(['/game/', res.gameid]);
          }
      )
  }

  startGame() {
      this.messanger.sendWssMessage('START', this.game.gameid)
  }

  // onCardClick(r,c,v) {
  //     if (this.yourMove && this.allPlayersConnected) {
  //         let card = {
  //             row: r,
  //             col: c
  //         }
  //         this.messanger.sendWssMessage('CLICKCARD', card)
  //     } else {
  //         alert(!this.yourMove?'Now is not your turn!':'' + !this.allPlayersConnected?'Not players are connected!':'')
  //     }
  // }

  connectWss(gameid) {
      if (!gameid) {
          alert('ERROR. No game ID selected. You\'re redirected to home page ['+gameid+']')
          this.router.navigate(['/']);
          return
      }

      //###temp
      if (this.wssIsActive) {
          alert('ERROR. Already connected')
          return
      }

      this.messanger.connectWss(gameid, this.user.sub, this.token,
          () => {
              this.wssIsActive = true
          },
          (obj) => {
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

                  case 'CONNECTION':
                      this.wssClientID = obj.payload.wssClientID
                      this.gameStore.dispatch(new PlayerConnectInit(obj.payload.playersInGame))
                      this.gameStore.dispatch(new GameInit(obj.payload.game))
                      this.gameStore.dispatch(new BoardInit(obj.payload.game.board))
                      break;

                  case 'NEW_PLAYER_CONNECTED':
                      this.gameStore.dispatch(new PlayerConnectNew(obj.payload.playerConnected))
                      break;

                  case 'DISCONNECTION':
                      this.gameStore.dispatch(new PlayerDisconnect( {wssClientID: obj.payload.wssClientID, email: obj.payload.email} ))
                      break;

                  case 'PLAYER_REMOVED_FROM_GAME':
                      this.gameStore.dispatch(new PlayerRemove(obj.payload.email))
                      break;

                  case 'PLAYER_ADDED_TO_GAME':
                      this.gameStore.dispatch(new PlayerAdd(obj.payload.player))
                      break;

                  case 'RESUME':
                      this.gameStore.dispatch(new GameInit(obj.payload.game))
                      this.gameStore.dispatch(new PlayerConnectInit(obj.payload.playersInGame))
                      this.gameStore.dispatch(new BoardInit(obj.payload.game.board))
                      break;

                  case 'OPENCARD':
                      this.gameStore.dispatch(new BoardOpenCard(obj.payload))
                      break;

                  case 'TAKECARDS':
                      this.gameStore.dispatch(new GameGeneral(obj.event, obj.payload))
                      this.gameStore.dispatch(new BoardTakeCards(obj.payload))
                      this.gameStore.dispatch(new PlayerScore(obj.payload))
                      break;

                  case 'PUTBACKCARDS':
                      this.gameStore.dispatch(new BoardPutBackCards(obj.payload))
                      this.gameStore.dispatch(new PlayerMissed(obj.payload))
                      break;

                  case 'NEXTPLAYER':
                      this.gameStore.dispatch(new GameGeneral(obj.event, obj.payload))
                      break;

                  case 'GAMEOVER':
                      this.gameStore.dispatch(new GameGeneral(obj.event, obj.payload))
                      break;

                  default:
                      alert('ERROR. Unknown event '+obj.event)
              }
          },
          () => {
              this.wssIsActive = false
              this.allPlayersConnected = false
          }
      )
  }

  disconnectWss() {
      this.gameStore.dispatch(new PlayerDisconnect( {wssClientID: this.wssClientID, email: this.user.email} ))
      this.messanger.disconnectWss()
  }

  //###temp
  clearMessages() {
      this.messages.length = 0
  }

}
