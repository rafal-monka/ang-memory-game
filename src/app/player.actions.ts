
import {Action} from '@ngrx/store';

export enum PlayerActionTypes {
  Fill = '[Player Component] Fill',
  Init = '[Player Component] Init',
  Add = '[Player Component] Add',
  Remove = '[Player Component] Remove',
  ConnectInit = '[Player Component] ConnectInit',
  ConnectNew = '[Player Component] ConnectNew',
  Disconnect = '[Player Component] Disconnect'
}

export class ActionEx implements Action {
  readonly type;
  payload: any;
}

export class PlayerInit implements ActionEx {
  readonly type = PlayerActionTypes.Init;
  constructor(public payload: any) {
  }
}

export class PlayerFill implements ActionEx {
  readonly type = PlayerActionTypes.Fill;
  constructor(public payload: any) {
  }
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
