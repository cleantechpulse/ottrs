import React, { Component } from 'react'
import _ from 'lodash'
import * as d3 from 'd3'
import { getCurrentHourText } from '../helpers'
import Individual from '../containers/Individual'

class AppWrapper extends Component {

  constructor(props) {
    super();
    const containerW = document.getElementById('graph-full').clientWidth - 30;
    this.margin = {top: 10, right: 40, bottom: 20, left: 40};
    this.dim = {
      w: containerW - this.margin.left - this.margin.right,
      h: 600 - this.margin.top - this.margin.bottom
    };
    this.widthRange = d3.scaleLinear().range([0, 20]);
  }

  componentDidMount() {

    //set opacity range;
    this.widthRange.domain([0, this.props.max]);

    const g = d3.select('#dendogram');

    //create dendogram data
    const stratify = d3.stratify()
        .parentId((d) => { return d.id.substring(0, d.id.lastIndexOf('-')); });
    const root = stratify(this.props.data)
        .sort((a, b) => { return (a.height - b.height) || a.id.localeCompare(b.id); });
    const tree = d3.cluster()
        .size([this.dim.h, this.dim.w]);
    tree(root);

    g.selectAll('.js-link')
      .data(root.descendants().slice(1))
      .enter().append('path')
        .attr('class', 'js-link connetion')
        .attr('d', (d) => {
          //add 100 to show the direction to child
          return 'M' + d.y + ',' + d.x
              + 'C' + (d.parent.y + 100) + ',' + d.x
              + ' ' + (d.parent.y + 100) + ',' + d.parent.x
              + ' ' + d.parent.y + ',' + d.parent.x;
        })
        .style('stroke-width', (d) => Math.sqrt(this.widthRange(d.data.value[0])));

    const node = g.selectAll('.js-node')
        .data(root.descendants())
      .enter().append('g')
        .attr('class', (d) => { return 'js-node node' + (d.children ? ' node-parent' : ' node-child'); })
        .attr('transform', (d) => { return 'translate(' + d.y + ',' + d.x + ')'; })

    node.append('circle')
        .attr('r', 6)
        .on('mouseover', function() {
          d3.select(this).classed('hover', true);
        })
        .on('mouseout', function() {
          d3.select(this).classed('hover', false);
        })
        .on('click', (d) => {
          const ids = d.data.id.split('-');
          this.props.onSelectNode(+ids[ids.length - 1]);
        });

    node.append('text')
        .attr('x', (d) => { return d.children ? -12 : 12; })
        .text((d) => { return d.id.substring(d.id.lastIndexOf('-') + 1); });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.playStatus === 1) {
      _.delay(() => this.props.onStartFunc(), 3000);
    }
    //TODO: animation
    d3.selectAll('.js-link')
      .style('stroke-width', (d) => Math.sqrt(this.widthRange(d.data.value[nextProps.currentHour])));
  }

  render () {
    return (<div className='container'>
      <div className='row'>
        <div className='col-xs-12'>
          <h1> Distribution Grid Power Flow</h1>
          <div className='wrapper'>
            <h3 className="clock">{getCurrentHourText(this.props.currentHour)}</h3>
            <div className="buttons">
              <div onClick={this.props.onMountFunc} className={this.props.playStatus === 0 ? 'link' : 'hidden'}>Start</div>
              <div onClick={this.props.onStopFunc} className={this.props.playStatus === 1 ? 'link' : 'hidden'}>Stop</div>
              <div onClick={this.props.onResumeFunc} className={this.props.playStatus === 2 ? 'link' : 'hidden'}>Resume</div>
            </div>
            <svg
              width={this.dim.w + this.margin.left + this.margin.right}
              height={this.dim.h + this.margin.top + this.margin.bottom}
            >
              <g transform={`translate(${this.margin.left}, ${this.margin.top})`} id='dendogram'/>
            </svg>
          </div>
        </div>
      </div>
      {this.props.selectedNode > -1 && <Individual node={this.props.selectedNode} />}
    </div>)
  }
}

export default AppWrapper