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
      h: 500 - this.margin.top - this.margin.bottom
    };
  }

  componentDidMount() {
    this.x = d3.scaleLinear().range([0, this.dim.w]).domain([0, 24]);
    this.y = d3.scaleLinear().range([this.dim.h, 0]);
    this.drawGraphs(this.props);
  }

  drawGraphs(props) {
    this.y.domain(d3.extent(_.flatten(_.values(props.data))));
    const g = d3.select('#individual-axis');
    g.call(d3.axisLeft(this.y)
      .tickSize(-this.dim.w)
      .tickPadding(6)
      .tickFormat((d) => (d * 500).toLocaleString())
    );

    let self = this;
    const line = d3.line()
      .x((d, i) => self.x(i))
      .y((d) => self.y(d))
      .curve(d3.curveMonotoneX);

    d3.select('#shapeable').html('')
      .append('path')
      .datum(props.data.shapeable)
      .attr('d', line)
      .attr('class', 'individual-curve-shapeable');

    d3.select('#deferrable').html('')
      .append('path')
      .datum(props.data.deferrable)
      .attr('d', line)
      .attr('class', 'individual-curve-deferrable');

    d3.select('#batt').html('')
      .append('path')
      .datum(props.data.batt)
      .attr('d', line)
      .attr('class', 'individual-curve-batt');

    d3.select('#solar').html('')
      .append('path')
      .datum(props.data.solar)
      .attr('d', line)
      .attr('class', 'individual-curve-solar');

    d3.select('#batt')
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', this.dim.h)
      .attr('class', 'js-timer-line timer');
  }

  componentWillReceiveProps(nextProps) {
    this.drawGraphs(nextProps);

    const h = nextProps.currentHour;

    d3.select('.js-timer-line')
      .attr('x1', this.x(Math.max(h - 1, 0)))
      .attr('x2', this.x(Math.max(h - 1, 0)))
      .transition()
      .attr('x1', this.x(h))
      .attr('x2', this.x(h));
  }

  render () {
    const hours = _.range(25).map((i) => (
      <text x={i * this.dim.w / 24} y={this.dim.h} dy="18" className="hour" key={i}>{getAmPm(i)}</text>
    ));

    return (<div className="row">
      <div className="col-xs-12">
        <h1> Power Consumption at Node {this.props.node} </h1><div onClick={this.props.onMountFunc} className="link graph-start">Start</div>
        <div className="wrapper">
          <div className="legends">
            <div className="battery"><span className="color"></span>Battery</div>
            <div className="solar"><span className="color"></span>Solar</div>
            <div className="shapeable"><span className="color"></span>Shapeable</div>
            <div className="deferrable"><span className="color"></span>Deferrable</div>
          </div>
          <svg
            width={this.dim.w + this.margin.left + this.margin.right}
            height={this.dim.h + this.margin.top + this.margin.bottom}
          >
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id="shapeable"/>
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id="deferrable"/>
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id="solar"/>
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id="batt"/>
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} className="axis axis-x">
              {hours}
            </g>
            <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id="individual-axis" className="axis" />
            <text x={-this.dim.h / 2} y="20" className="y-label" transform="rotate(-90)">Power Production-Consumption (kW)</text>
          </svg>
        </div>
      </div>
    </div>)
  }
}

export default IndividualWrapper