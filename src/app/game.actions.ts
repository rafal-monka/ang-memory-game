import {Action} from '@ngrx/store';

export enum GameActionTypes {
  Clear = '[Game Component] Clear',
  Init = '[Game Component] Init',
  Start = '[Game Component] Start',
  GameGeneral = '[Game Component] GameGeneral'
}

export class ActionEx implements Action {
  readonly type;
  payload: any;
  event: any
}

export class GameGeneral implements ActionEx {
  readonly type = GameActionTypes.GameGeneral
  constructor(public event, public payload: any) {
  }
}

export class GameClear implements ActionEx {
  readonly type = GameActionTypes.Clear
  readonly event = null
  constructor(public payload: any) {
  }
}

export class GameInit implements ActionEx {
  readonly type = GameActionTypes.Init
  readonly event = null
  constructor(public payload: any) {
  }
}

export class GameStart implements ActionEx {
  readonly type = GameActionTypes.Start
  readonly event = null
  constructor(public payload: any) {
  }
}

export type Actions = GameGeneral | GameClear | GameInit | GameStart
