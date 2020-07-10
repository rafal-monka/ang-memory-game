
import {Action} from '@ngrx/store';

export enum UserActionTypes {
  Init = '[User Component] Init'
}

export class ActionEx implements Action {
  readonly type;
  payload: any;
}

export class UserInit implements ActionEx {
  readonly type = UserActionTypes.Init;
  constructor(public payload: any) { }
}

