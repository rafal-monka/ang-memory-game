import {ActionEx, PlayerActionTypes, PlayerAdd} from './player.actions';

export const initialState = [];

export function PlayerReducer(state = initialState, action: ActionEx) {
  let index
  switch (action.type) {

    case PlayerActionTypes.Add:
      return [...state, action.payload];

    case PlayerActionTypes.Remove:
      index = state.findIndex(player => player.email === action.payload)
      if (index === -1) {
          alert('Error in PlayerActionTypes.Remove. Player '+action.payload+' NOT FOUND')
          return [...state]
      } else {
          return [
          ...state.slice(0, index),
          ...state.slice(index+1)
        ];
      }

      case PlayerActionTypes.ConnectInit:
        return action.payload

      case PlayerActionTypes.ConnectNew:
        let playerConnected = action.payload
        index = state.findIndex(player => playerConnected.profile.email === player.email && playerConnected.gameid === player.gameid)
        let arr = state.map( (item, inx) => {
            if (index === inx) {
                return {
                    ...item,
                    wssClientID: playerConnected.wssClientID,
                    userid: playerConnected.userid,
                    name: playerConnected.profile.name,
                    connected: true
                }
            } else {
                return item
            }
        })
        return arr;

      case PlayerActionTypes.Disconnect:
        let tmp = state.map(item => {
          if (action.payload.email === item.email) {
              return {...item, wssClientID: null, connected: false}
          } else {
              return item
          }
        })
        return tmp;

      case PlayerActionTypes.Score:
        let playerUpdatedScore = state.map( (item, index) => {
           if (index === action.payload.currentPlayerInx) {
              return {...item, score: action.payload.playerScore}
           } else {
              return item
           }
        })
        return playerUpdatedScore

        case PlayerActionTypes.Missed:
          let playerUpdatedMissed = state.map( (item, index) => {
             if (index === action.payload.currentPlayerInx) {
                return {...item, missed: action.payload.playerMissed}
             } else {
                return item
             }
          })
          return playerUpdatedMissed

    default:
      return state;
  }
}
