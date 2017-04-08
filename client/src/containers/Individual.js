import { connect } from 'react-redux'
import _ from 'lodash'
import IndividualWrapper from '../components/Individual'

const shapeableData = require('../data/shapeable.json');
const deferrableData = require('../data/deferrable.json');

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  };
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const node = ownProps.node;
  const data = {
    shapeable: shapeableData[+node],
    deferrable: deferrableData[+node]
  };

  const mergedProps = {
    node,
    data
  };
  return Object.assign({}, mergedProps);
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(IndividualWrapper)