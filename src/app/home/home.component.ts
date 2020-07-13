import { Component, OnInit } from '@angular/core';
import { PlayerAdd } from '../player.actions';

const CONST_OPEN = -111
const CONST_TAKEN = -999
const CONST_PAUSE_TIME = 100
const CONST_EMP = 200
const CONST_SIZE = 8

@Component({
  selector: 'app-test',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ContextUserID: string = '1' //###temp
  gamePlayed : boolean = false;

  currentStep: number
  currentPlayerInx: number
  openCards: Array<any> = []
  waiting: boolean = false
  cardsLeft: number

  _setSIZE: Array<number> = [...Array(CONST_SIZE).keys()]
  _setCARDS: Array<number> = [...Array(CONST_SIZE*CONST_SIZE/2).keys()]
  board: Array<any> = [...Array(CONST_SIZE)].map(e => Array(CONST_SIZE).fill(0))
  boardCopy: Array<any>

  //computer memory
  memory: Array<any> = [...Array(CONST_SIZE)].map(e => Array(CONST_SIZE).fill(null))
  knownCards: Array<any>
  unknownCards: Array<any>

  players: Array<any> = [
      //{userid: '1', name: 'Aaa', role: 'HUMAN', score: 0, missed: 0},
      {userid: '0', name: 'Atari', role: 'COMPUTER', score: 0, missed: 0, level: 0 },
      {userid: '1', name: 'Spectrum', role: 'COMPUTER', score: 0, missed: 0, level: 10 },
      {userid: '2', name: 'Amiga', role: 'COMPUTER', score: 0, missed: 0, level: 20 },
      {userid: '3', name: 'Win', role: 'COMPUTER', score: 0, missed: 0, level: 30},
      {userid: '4', name: 'Linux', role: 'COMPUTER', score: 0, missed: 0, level: 40 },
      {userid: '5', name: 'Android', role: 'COMPUTER', score: 0, missed: 0, level: 50 },
      {userid: '6', name: 'Power', role: 'COMPUTER', score: 0, missed: 0, level: 60 },
      {userid: '7', name: 'Craig', role: 'COMPUTER', score: 0, missed: 0, level: 70 },
      {userid: '8', name: 'DeepBlue', role: 'COMPUTER', score: 0, missed: 0, level: 80 },
      {userid: '9', name: 'Hall', role: 'COMPUTER', score: 0, missed: 0, level: 90 },
      {userid: '10', name: 'Master', role: 'COMPUTER', score: 0, missed: 0, level: 100 },
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
          return this.openCards[this.currentStep].value
      } else {
          return null
      }
  }

  private takeCards(callback) {
      this.players[this.currentPlayerInx].score += 2
      this.cardsLeft -= 2
      let endOfGame = this.cardsLeft === 0
      this.currentStep = 0
      setTimeout(()=>{
          this.board[this.openCards[0].row][this.openCards[0].col].value = CONST_TAKEN
          this.board[this.openCards[1].row][this.openCards[1].col].value = CONST_TAKEN
          this.openCards = []
          this.waiting = false
          if (endOfGame) {
              console.log('GAME OVER')
          }
          if (!endOfGame) callback()
      }, CONST_PAUSE_TIME)
  }

  private putBackCards() {
    this.players[this.currentPlayerInx].missed += 2;
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

  private takePair() {
//console.log('takePair()')
      //look for pairs
      let pairIndex = this.knownCards.findIndex(cards => cards.length === 2)
      let v1, v2
      if (pairIndex !== -1) {
          this.currentStep = 0
          v1 = this.openCard(this.knownCards[pairIndex][0].row,this.knownCards[pairIndex][0].col)
          this.currentStep = 1
          v2 = this.openCard(this.knownCards[pairIndex][1].row,this.knownCards[pairIndex][1].col)
      }
      return pairIndex !== -1
  }

  private computerMove(userid) {
  //console.log('computerMove()', userid)
      this.memory = [...Array(CONST_SIZE)].map(e => Array(CONST_SIZE).fill(null))
      let level = this.players[this.currentPlayerInx].level

      //1. build memory
      //refresh memory state based on level and counts
      this._setSIZE.forEach(row => {
          this._setSIZE.forEach(col => {
              let card = this.board[row][col]
              if ([CONST_TAKEN/*, CONST_OPEN*/].indexOf(card.value)===-1) {
                  if (card.count > 0) {
                      let probabilityLevel = card.count ===0 ? level: Math.min(100,level+Math.pow(2, card.count)*level/CONST_EMP)   // -> level_simulation.xlsx
                      let rnd = this.randomInteger(0, 100)
                      this.memory[row][col] = rnd <= probabilityLevel ? card.value : null
                  }
                } else {
                    switch (card.value) {
                        case CONST_TAKEN:
                            this.memory[row][col] = CONST_TAKEN
                            break
                        /*case CONST_OPEN:
                            this.memory[row][col] = card.value
                            break*/
                    }
                }
          })
      })

      //build temporary arrays
      //known cards: 0 => [{r,c}, {r,c}]
      //uknown cards: [ {r,c}, {r,c}, {r,c}, ...]
      let knownCardsTemp = [...Array(CONST_SIZE*CONST_SIZE/2)].map(e => Array())
      this.unknownCards = []
      this.memory.map( (rowArr, row) => {
          rowArr.map( (value, col) => {
            if (value !== CONST_TAKEN) {
                if (value !== null ) {
                    knownCardsTemp[value].push({row, col})
                } else {
                    this.unknownCards.push({row, col})
                }
            }
          })
      })
      this.knownCards = knownCardsTemp.filter(cards => cards.length > 0)

      //2. procedure
      //look for pairs in memory
      let v1, v2
      if (!this.takePair()) {
          //console.log('No pairs...')

          //if (this.unknownCards.length > 0) {

          //random card in unknown cards
          let rnd1UnknownIndex = Math.floor(Math.random()*this.unknownCards.length)
          //console.log('rnd1UnknownIndex (index, [])', rnd1UnknownIndex, this.unknownCards[rnd1UnknownIndex])
          let card1 = {row: this.unknownCards[rnd1UnknownIndex].row, col: this.unknownCards[rnd1UnknownIndex].col}
          v1 = this.board[card1.row][card1.col].value

          //add card to known array
          knownCardsTemp[v1].push( card1 )
          //remove card from unknown array
          this.unknownCards.splice(rnd1UnknownIndex, 1)
          this.knownCards = knownCardsTemp.filter(cards => cards.length > 0)

          //look for pairs in memory again
          if (!this.takePair()) {
              this.currentStep = 0
              /*v1 = */this.openCard(card1.row, card1.col)

              this.currentStep = 1
              //if (this.unknownCards.length > 0) {
              let rnd2UnknownIndex = Math.floor(Math.random()*this.unknownCards.length)
              //console.log('rnd2UnknownIndex (index, [])', rnd2UnknownIndex, this.unknownCards[rnd2UnknownIndex])
              /*v2 = */this.openCard(this.unknownCards[rnd2UnknownIndex].row, this.unknownCards[rnd2UnknownIndex].col)
              //} else {
              //    console.log('???ERROR [2]. The should be a card in unknown cards array.')
              //}
          }

          //} else {
          //    console.log('???ERROR [1]. The should be a card in unknown cards array.')
          //}
      }

      //check results
      if (this.openCards[0].value === this.openCards[1].value ) {
          // console.log('YES! Two pictures')
          this.takeCards( () => {
              this.computerMove(userid)
          })
      } else {
          this.putBackCards()
      }
  }

  onCardClick(r,c) {
      if (this.players[this.currentPlayerInx].userid === this.ContextUserID) {

              if (this.openCard(r,c) !== null) {
                  if (this.currentStep === 0) {
                      this.currentStep++
                  } else {
                      this.waiting = true
                      if (this.openCards[0].value === this.openCards[1].value ) {
                          console.log('YES! Two pictures')
                          this.takeCards( ()=>{ console.log('onCardClick.takeCards.callback') })
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
  }

  prepareGame() {
      let cards: Array<any> = [...this._setCARDS, ...this._setCARDS]
      this.cardsLeft = cards.length
      this._setSIZE.forEach(row => {
          this._setSIZE.forEach(col => {
              let inx = this.randomInteger(0, cards.length-1)
              let val = cards.splice(inx, 1)[0]
              this.board[row][col] = {value: val, count: 0}
          })
      })
      this.boardCopy = JSON.parse(JSON.stringify(this.board))
      console.log(cards)
  }

  playGame() {
      this.gamePlayed = true
      this.prepareGame()
      this.resumeGame()
  }

  resumeGame() {
      this.currentStep = 0
      this.currentPlayerInx = 0
      if (this.players[this.currentPlayerInx].role==='COMPUTER') {
          this.computerMove(this.players[this.currentPlayerInx].userid)
      }
  }

}
