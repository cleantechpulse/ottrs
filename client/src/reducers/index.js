import { combineReducers } from 'redux'
// import moment from 'moment'
// import Profile from './../data/profile.json'
// import { selectedRange, isFetchingTweets, tweets, category, matrix } from './timeline'
// import { selectedFriend } from './flow'

const isFetching = (state = false, action) => {
  switch (action.type) {
    case 'REQUEST_DATA':
      return true
    case 'RECEIVE_DATA':
      return false
    default:
      return state
  }
}

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
// let isTimeRangeSet = false;
// const timeRange = () => {
//   if (!isTimeRangeSet) {
//     const start = moment(Profile['signed_up_at'], 'YYYY-MM-DD HH:mm:ss');
//     const end = start.clone().add(10, 'years');
//     return [start, end];
//   }
// }

// const dataByPage = (state = {}, action) => {
//   if (action.type === 'RECEIVE_DATA') {
//     return Object.assign({}, state, {[action.page]: action.data})
//   } else {
//     return state
//   }
// }

export default combineReducers({
  isFetching,
  currentHour,
  playStatus,
  selectedNode
  // flowData
  // timeRange,
  // dataByPage,
  // selectedRange, isFetchingTweets, tweets, category, matrix,
  // selectedFriend
})