import {ActionEx, GameActionTypes} from './game.actions';
import { Game } from './models/game';

export const initialState : Game =new Game();

export function GameReducer(state = initialState, action: ActionEx) {
  let game : Game
  switch (action.type) {

    case GameActionTypes.Clear:
      return null;

    case GameActionTypes.Init:
      return action.payload;

    case GameActionTypes.Start:
      console.log('GameActionTypes.Start, state', state)
      game = Object.assign({}, state)
      game.status = 'STARTED'
      console.log('GameActionTypes.Start, game', game)
      return game

    case GameActionTypes.PlayersConnection:
      game = Object.assign({}, state)
      game.allPlayersConnected = action.payload
      return action.payload;


    default:
      return state;
  }
}
