import {ActionEx, PlayerActionTypes} from './player.actions';

export const initialState = [];

export function PlayerReducer(state = initialState, action: ActionEx) {
  let index
  switch (action.type) {

    case PlayerActionTypes.Init:
      return [action.payload];

    case PlayerActionTypes.Fill:
      return [...action.payload];

    case PlayerActionTypes.Add:
      return [...state, action.payload];

    case PlayerActionTypes.Remove:
      console.log('PlayerActionTypes.Remove', action.payload)
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
        console.log('PlayerActionTypes.ConnectInit', action.payload)
        return action.payload

      case PlayerActionTypes.ConnectNew:
        console.log('PlayerActionTypes.ConnectNew', action.payload)
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
        console.log('PlayerActionTypes.Disconnect', action.payload)
        let tmp = state.map(item => {
          if (action.payload === item.wssClientID) {
              return {...item, wssClientID: null, connected: false}
          } else {
              return item
          }
        })
        return tmp;


    default:
      return state;
  }
}
