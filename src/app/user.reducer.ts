import {ActionEx, UserActionTypes} from './user.actions';

export const initialState = '';

export function UserReducer(state = initialState, action: ActionEx) {
  switch (action.type) {

    case UserActionTypes.Init:
      return action.payload;

    default:
      return state;
  }
}
