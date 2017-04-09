import { connect } from 'react-redux'
import _ from 'lodash'
import IndividualWrapper from '../components/Individual'

const shapeableData = require('../data/shapeable.json');
const deferrableData = require('../data/deferrable.json');
const battData = require('../data/p_batt.json');
const solarData = require('../data/solar.json');

const mapStateToProps = (state, ownProps) => {
  return {
    currentHour: state.currentHour
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
  };
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const node = ownProps.node;
  const data = {
    shapeable: shapeableData[+node],
    deferrable: deferrableData[+node],
    batt: battData[+node],
    solar: solarData[+node]
  };

  const mergedProps = {
    currentHour: stateProps.currentHour,
    node,
    data,
    onMountFunc: () => {
      dispatchProps.setPlay(1);
      dispatchProps.addHour(stateProps.currentHour);
    },
  };
  return Object.assign({}, mergedProps);
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(IndividualWrapper)