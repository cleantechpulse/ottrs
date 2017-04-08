import React, { Component } from 'react'
import * as d3 from 'd3'
import _ from 'lodash'
import { getAmPm } from '../helpers'

class IndividualWrapper extends Component {

  constructor(props) {
    super();
    const containerW = document.getElementById('graph-full').clientWidth - 30;
    this.margin = {top: 20, right: 40, bottom: 20, left: 60};
    this.dim = {
      w: containerW - this.margin.left - this.margin.right,
      h: 400 - this.margin.top - this.margin.bottom
    };
    this.widthRange = d3.scaleLinear().range([0, 40]);
  }

  componentDidMount() {

    this.x = d3.scaleLinear().range([0, this.dim.w]).domain([0, 23]);
    const maxY = Math.max(_.max(this.props.data.shapeable), _.max(this.props.data.deferrable));
    this.y = d3.scaleLinear().range([this.dim.h, 0]).domain([0, maxY]);

    //put axis
    const g = d3.select('#individual-axis');
    g.call(d3.axisLeft(this.y).tickSize(-this.dim.w).tickPadding(6));

    //put data curve
    let self = this;
    this.line = d3.line()
      .x((d, i) => self.x(i))
      .y((d) => self.y(d))
      .curve(d3.curveMonotoneX);

    d3.select('#shapeable')
      .append('path')
      .datum(this.props.data.shapeable)
      .attr('d', this.line)
      .attr('class', 'individual-curve-shapeable');

    d3.select('#deferrable')
      .append('path')
      .datum(this.props.data.deferrable)
      .attr('d', this.line)
      .attr('class', 'individual-curve-deferrable');
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);

    const maxY = Math.max(_.max(nextProps.data.shapeable), _.max(nextProps.data.deferrable));
    this.y.domain([0, maxY]);
    const g = d3.select('#individual-axis');
    g.call(d3.axisLeft(this.y).tickSize(-this.dim.w).tickPadding(6));

    d3.select('#shapeable').html('')
      .append('path')
      .datum(nextProps.data.shapeable)
      .attr('d', this.line)
      .attr('class', 'individual-curve-shapeable');

    d3.select('#deferrable').html('')
      .append('path')
      .datum(nextProps.data.deferrable)
      .attr('d', this.line)
      .attr('class', 'individual-curve-deferrable');
  }

  render () {
    const hours = _.range(25).map((i) => (
      <text x={i * this.dim.w / 24} y={this.dim.h} dy="18" className="hour" key={i}>{getAmPm(i)}</text>
    ));

    return (<div className="row">
      <div className="col-xs-12">
        <h1> Node {this.props.node} </h1>
        <div className="wrapper">
          <svg
            width={this.dim.w + this.margin.left + this.margin.right}
            height={this.dim.h + this.margin.top + this.margin.bottom}
          >
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id="shapeable"/>
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id="deferrable"/>
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} className="axis axis-x">
              {hours}
            </g>
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id="individual-axis" className="axis" />
          </svg>
        </div>
      </div>
    </div>)
  }
}

export default IndividualWrapper