import { ActionEx, GameActionTypes } from './game.actions';
import { Game } from './models/game';

export const initialState : Game = new Game({})

export function GameReducer(state = initialState, action: ActionEx) {
  let game : Game
  switch (action.type) {

    case GameActionTypes.Clear:
      return null;

    case GameActionTypes.Init:
      return action.payload;

    case GameActionTypes.Start:
      game = Object.assign({}, state)
      game.status = action.payload.status
      return game

    case GameActionTypes.GameGeneral:
      game = Object.assign({}, state)
      switch (action.event) {
        case 'NEXTPLAYER':
          game.currentPlayerInx = action.payload.currentPlayerInx
          break

        case 'TAKECARDS':
          game.cardsLeft = action.payload.cardsLeft
          break

        case 'GAMEOVER':
          game.status = action.payload.status
          break
      }
      return game

    default:
      return state
  }
}
