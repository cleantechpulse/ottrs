import { combineReducers } from 'redux'

const currentHour = (state = 0, action) => {
  switch (action.type) {
    case 'ADD_HOUR':
      const newHour = action.value === 23 ? 0 : action.value + 1;
      return newHour;
    default:
      return state;
  }
}

const playStatus = (state = 0, action) => {
  switch (action.type) {
    case 'SET_PLAY':
      return action.value;
    default:
      return state;
  }
}

const selectedNode = (state = -1, action) => {
  switch (action.type) {
    case 'SELECT_NODE':
      return action.value;
    default:
      return state;
  }
}

export default combineReducers({
  currentHour,
  playStatus,
  selectedNode
})