
import {Action} from '@ngrx/store';

export enum BoardActionTypes {
  Init = '[Board Component] Init',
  OpenCard = '[Board Component] OpenCard',
  TakeCards = '[Board Component] TakeCards',
  PutBackCards = '[Board Component] PutBackCards'
}

export class ActionEx implements Action {
  readonly type;
  payload: any;
}

export class BoardInit implements ActionEx {
  readonly type = BoardActionTypes.Init;
  constructor(public payload: any) { }
}

export class BoardOpenCard implements ActionEx {
  readonly type = BoardActionTypes.OpenCard;
  constructor(public payload: any) { }
}

export class BoardTakeCards implements ActionEx {
  readonly type = BoardActionTypes.TakeCards;
  constructor(public payload: any) { }
}

export class BoardPutBackCards implements ActionEx {
  readonly type = BoardActionTypes.PutBackCards;
  constructor(public payload: any) { }
}


