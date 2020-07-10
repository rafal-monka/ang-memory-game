import { Component, OnInit } from '@angular/core';
import { PlayerAdd } from '../player.actions';

const CONST_OPEN = -111
const CONST_TAKEN = -999
const CONST_PAUSE_TIME = 2000
const CONST_EMP = 200

@Component({
  selector: 'app-test',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ContextUserID: string = '1'

  currentStep: number = 0
  currentPlayerInx: number = 0
  openCards: Array<any> = []
  waiting: boolean = false

  _set8: Array<number> = [...Array(8).keys()]
  _set32: Array<number> = [...Array(32).keys()]
  cards: Array<any> = [...this._set32, ...this._set32]
  board: Array<any> = [...Array(8)].map(e => Array(8).fill(0))
  memory: Array<any> = [...Array(8)].map(e => Array(8).fill(0))

  players: Array<any> = [
      {userid: '1', name: 'Aaa', role: 'HUMAN', score: 0},
      //{userid: '2', name: 'Bbb', role: 'HUMAN', score: 0},
      {userid: '3', name: 'Win', role: 'COMPUTER', score: 0, level: 90},
      //{userid: '4', name: 'Linux', role: 'COMPUTER', score: 0, level: 50 },
  ]

  constructor() { }

  private randomInteger(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private openCard(r,c) {
      if (!this.waiting && this.board[r][c].value >= 0) {
          this.openCards[this.currentStep] = {
              row: r,
              col: c,
              value: this.board[r][c].value
          }
          this.board[r][c].count++
          this.board[r][c].value = CONST_OPEN
          return true
      } else {
          return false
      }
  }

  private takeCards(playerInx) {
      this.players[playerInx].score += 2;
      this.currentStep = 0
      setTimeout(()=>{
          this.board[this.openCards[0].row][this.openCards[0].col].value = CONST_TAKEN
          this.board[this.openCards[1].row][this.openCards[1].col].value = CONST_TAKEN
          this.openCards = []
          this.waiting = false
          //...end of game?
          //@@@
      }, CONST_PAUSE_TIME)
  }

  private putBackCards() {
      this.currentStep = 0

      setTimeout(()=>{
          this.board[this.openCards[0].row][this.openCards[0].col].value = this.openCards[0].value
          this.board[this.openCards[1].row][this.openCards[1].col].value = this.openCards[1].value
          this.openCards = []
          this.waiting = false
          //next player
          if (this.currentPlayerInx < this.players.length-1) {
            this.currentPlayerInx++
          } else {
              this.currentPlayerInx = 0
          }
          if (this.players[this.currentPlayerInx].role==='COMPUTER') {
              this.computerMove(this.players[this.currentPlayerInx].userid)
          }
      }, CONST_PAUSE_TIME)
  }

  private computerMove(userid) {
      console.log('computerMove', userid)
      this.memory = [...Array(8)].map(e => Array(8).fill(0))
      let level = this.players[this.currentPlayerInx].level
      this._set8.forEach(row => {
          this._set8.forEach(col => {
            let count = this.board[row][col].count
              this.memory[row][col] = count ===0 ? level: Math.min(100,level+Math.pow(2, count)*level/CONST_EMP)   // -> level_simulation.xlsx
          })
      })
      //@@@
      let r = 7
      let c = 3
      this.openCard(r,c)
      this.currentStep++
      r = 2
      c = 5
      this.openCard(r,c)

      if (this.openCards[0].value === this.openCards[1].value ) {
          console.log('Two pictures')
          this.takeCards(this.currentPlayerInx)
      } else {
          this.putBackCards()
      }
  }

  onCardClick(r,c) {
      //console.log(r,c,this.board[r][c])
      // console.log('ContextUserID=', this.ContextUserID, this.players[this.currentPlayerInx].userid, (this.players[this.currentPlayerInx].userid === this.ContextUserID) )
      if (this.players[this.currentPlayerInx].userid === this.ContextUserID) {

              if (this.openCard(r,c)) {
                  if (this.currentStep === 0) {
                      this.currentStep++
                  } else {
                      this.waiting = true
                      if (this.openCards[0].value === this.openCards[1].value ) {
                          console.log('Two pictures')
                          this.takeCards(this.currentPlayerInx)
                          //...end of game?
                          //@@@
                      } else {
                          this.putBackCards()
                      }
                  }
              } else {
                console.log('###onCardClick unsuccessfull')
              }

      } else {
          console.log('###user context')
      }
  }

  ngOnInit() {
    // this.cards.splice(7,1)
    // return
    this._set8.forEach(row => {
        //this.board.push([])
        this._set8.forEach(col => {
            let inx = this.randomInteger(0, this.cards.length-1)
            let val = this.cards.splice(inx, 1)[0]
            //this.board[row].push(  )
            this.board[row][col] = {value: val, count: 0}
        })
    })
    console.log(this.cards)
  }

  resumeGame() {
      this.currentStep = 0
      this.currentPlayerInx = 0
  }

}
