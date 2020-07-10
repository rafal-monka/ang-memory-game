/*

model.Game
  - currentStep: {1,2}
  - currentPlayer: userid
  -
*/


  startResumeGame = (gameid) => {
      //retrieveGameFromDB(res => )
      this.api.game$(gameid).subscribe(res => {
          if (res.currentStep === undefined) {
              this.api.resumeGame$(gameid, {
                  currentStep: 0,
                  currentPlayer: 0,
                  status: 'STARTED'
              }).subscribe(res => {
                this.gameStore.dispatch(new GamePlay(res))
              })
          } else {
              this.gameStore.dispatch(new GamePlay(res))
          }
      })
  }

