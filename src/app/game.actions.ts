
import {Action} from '@ngrx/store';

export enum GameActionTypes {
  Clear = '[Game Component] Clear',
  Init = '[Game Component] Init',
  Start = '[Game Component] Start',
  PlayersConnection = '[Game Component] PlayersConnection'
}

export class ActionEx implements Action {
  readonly type;
  payload: any;
}

export class GameClear implements ActionEx {
  readonly type = GameActionTypes.Clear;
  constructor(public payload: any) {
      console.log('GameClear.constructor(), payload=', payload)
  }
}

export class GameInit implements ActionEx {
  readonly type = GameActionTypes.Init;
  constructor(public payload: any) {
      console.log('GameInit.constructor(), payload=', payload)
  }
}

export class GameStart implements ActionEx {
  readonly type = GameActionTypes.Start;
  constructor(public payload: any) {
      console.log('GameStart.constructor(), payload=', payload)
  }
}

export class GamePlayersConnected implements ActionEx {
  readonly type = GameActionTypes.PlayersConnection;
  constructor(public payload: any) {
      console.log('GamePlayersConnected.constructor(), payload=', payload)
  }
}

