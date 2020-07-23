import { User } from "./user"
import { Player } from "./player"

export class Game {
    //user: User
    //
    gameid: string
    name: string
    status: string
    host: string
    currentStep: number
    currentPlayerInx: number
    cardsLeft: number
    theme: string
    backgroundImage: number
    //boards: Array<any[]>
	  //players: Array<Player>
    //
    allPlayersConnected : boolean
    openCards: Array<any>
    waiting: boolean

    constructor(data: any) {
      Object.assign(this, data);
    }

    // constructorOLD() {
    //   this.gameid = ''
    //   this.name = ''
    //   this.status = ''
    //   this.host = ''
    //   this.allPlayersConnected = false
    //   this.currentStep = 0
    //   this.currentPlayerInx = 0
    //   this.openCards = []
    //   this.waiting = false
    //   this.cardsLeft = null
    // }
}
