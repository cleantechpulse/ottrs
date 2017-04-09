import { connect } from 'react-redux'
import _ from 'lodash'
import AppWrapper from '../components/App'

//entire flow data by node for 24 hours
const flowData = require('../data/flow_to_parent.json');
const dendogram = require('../data/dendogram.json');

const mapStateToProps = (state, ownProps) => {
  return {
    currentHour: state.currentHour,
    playStatus: state.playStatus,
    selectedNode: state.selectedNode
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addHour: (hour) => {
      dispatch({ type: 'ADD_HOUR', value: hour });
    },
    setPlay: (value) => {
      dispatch({ type: 'SET_PLAY', value });
    },
    selectNode: (value) => {
      dispatch({ type: 'SELECT_NODE', value });
    }
  };
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {

  const data = _.map(dendogram, (d) => {
    const ids = d.split('-');
    const lastId = +ids[ids.length - 1];
    return {id: d, value: flowData[lastId - 1] };
  });

  //get max value (absolute value of the power to parent)
  let max = 0;
  _.forEach(flowData, (array) => {
    _.forEach(array, (d) => {
      max = Math.min(0, d)
    })
  });

  const mergedProps = {
    currentHour: stateProps.currentHour,
    playStatus: stateProps.playStatus,
    selectedNode: stateProps.selectedNode,
    data,
    max,
    onMountFunc: () => {
      dispatchProps.setPlay(1);
    },
    onStartFunc: () => {
      dispatchProps.addHour(stateProps.currentHour);
    },
    onResumeFunc: () => {
      dispatchProps.setPlay(1);
      dispatchProps.addHour(stateProps.currentHour);
    },
    onStopFunc: () => {
      dispatchProps.setPlay(2);
    },
    onSelectNode: (id) => {
      dispatchProps.selectNode(id);
      dispatchProps.setPlay(0);
      dispatchProps.addHour(-1);
    }
  };
  return Object.assign({}, mergedProps);
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AppWrapper)