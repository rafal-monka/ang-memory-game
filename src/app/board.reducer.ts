import {ActionEx, BoardActionTypes} from './board.actions';

export const initialState : Array<any> = [...Array(8)].map(e => Array(8).fill(0));

const CARD_TAKEN = -999

export function BoardReducer(state = initialState, action: ActionEx) {
  let arr
  let openCards
  switch (action.type) {

    case BoardActionTypes.Init:
      return (action.payload?action.payload:initialState);

    case BoardActionTypes.OpenCard:
      let openCard = action.payload.openCard
      arr = JSON.parse(JSON.stringify(state))
      arr[openCard.row][openCard.col].open = true
      arr[openCard.row][openCard.col].value = openCard.value
      arr[openCard.row][openCard.col].count = openCard.count
      return arr;

    case BoardActionTypes.TakeCards:
      openCards = action.payload.openCards
      arr = JSON.parse(JSON.stringify(state))
      arr[openCards[0].row][openCards[0].col].open = false
      arr[openCards[1].row][openCards[1].col].open = false
      arr[openCards[0].row][openCards[0].col].value = CARD_TAKEN
      arr[openCards[1].row][openCards[1].col].value = CARD_TAKEN
      return arr;

    case BoardActionTypes.PutBackCards:
      openCards = action.payload.openCards
      arr = JSON.parse(JSON.stringify(state))
      arr[openCards[0].row][openCards[0].col].open = false
      arr[openCards[1].row][openCards[1].col].open = false
      arr[openCards[0].row][openCards[0].col].value = openCards[0].value
      arr[openCards[1].row][openCards[1].col].value = openCards[1].value
      return arr;

    default:
      return state;
  }
}
