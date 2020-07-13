export class Game {
    gameid: string
    name: string
    status: string
    host: string
    allPlayersConnected : boolean
    currentStep: number
    currentPlayerInx: number
    openCards: Array<any>
    waiting: Boolean
    cardsLeft: number

    constructor() {
      this.gameid = ''
      this.name = ''
      this.status = ''
      this.host = ''
      this.allPlayersConnected = false
      this.currentStep = 0
      this.currentPlayerInx = 0
      this.openCards = []
      this.waiting = false
      this.cardsLeft = null
    }
}
