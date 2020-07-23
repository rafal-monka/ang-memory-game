
import {Action} from '@ngrx/store';

export enum PlayerActionTypes {
  Add = '[Player Component] Add',
  Remove = '[Player Component] Remove',
  ConnectInit = '[Player Component] ConnectInit',
  ConnectNew = '[Player Component] ConnectNew',
  Disconnect = '[Player Component] Disconnect',
  Score = '[Player Component] Score',
  Missed = '[Player Component] Missed'
}

export class ActionEx implements Action {
  readonly type;
  payload: any;
}

export class PlayerAdd implements ActionEx {
  readonly type = PlayerActionTypes.Add;
  constructor(public payload: any) {
  }
}

export class PlayerRemove implements ActionEx {
  readonly type = PlayerActionTypes.Remove;
  constructor(public payload: any) {
  }
}

export class PlayerConnectInit implements ActionEx {
  readonly type = PlayerActionTypes.ConnectInit;
  constructor(public payload: any) {
  }
}

export class PlayerConnectNew implements ActionEx {
  readonly type = PlayerActionTypes.ConnectNew;
  constructor(public payload: any) {
  }
}

export class PlayerDisconnect implements ActionEx {
  readonly type = PlayerActionTypes.Disconnect;
  constructor(public payload: any) {
  }
}

export class PlayerScore implements ActionEx {
  readonly type = PlayerActionTypes.Score;
  constructor(public payload: any) {
  }
}

export class PlayerMissed implements ActionEx {
  readonly type = PlayerActionTypes.Missed;
  constructor(public payload: any) {
  }
}

export type PlayerActions = PlayerConnectInit | PlayerConnectNew | PlayerDisconnect | PlayerRemove | PlayerAdd | PlayerScore | PlayerMissed
