export class Game {
    gameid: string = ''
    name: string = ''
    status: string = ''
    host: string = ''
    allPlayersConnected : boolean = false

    constructor() {
      this.gameid = ''
      this.name = ''
      this.status = ''
      this.host = ''
      this.allPlayersConnected = false
    }
}
