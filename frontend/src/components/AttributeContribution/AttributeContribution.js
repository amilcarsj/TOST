import React, { useState, useEffect} from 'react';
import { Checkbox } from 'antd';
import './AttributeContribution.css';
import * as d3 from 'd3';
// range function
const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

export const AttributeContribution = ({selectedAttr,selectedTrip,meanTrajectory}) => {
  const [trip, setTrip] = useState(null);
  
  // initiate the viz
  const margin = {top: 10, right: 30, bottom: 30, left: 40},
      width = 800 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;
  let svg;
  let xScale,xAxis,xRange;
  let yScale;
  useEffect(() => {
    // SVG Component
    svg = d3.select("#attrContribWrapper")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    // X axis: scale and draw:
    xRange= range(10, width, width/selectedAttr.length);
    xScale = d3.scaleOrdinal()
          .domain(selectedAttr)
          .range(xRange);
    xAxis = svg.append("g")
          .attr("transform", "translate(50," + height + ")")
          .attr("id","xAxis")
          .call(d3.axisBottom(xScale));
    // Y axis
    yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    svg.append("g")
          .call(d3.axisLeft(yScale));
    
  }, [])

  // This hook will be called when a new trip is selected on the scoretable
  useEffect(() => {
    //console.lo g(selectedTrip);
    setTrip(selectedTrip);
  }, [selectedTrip])

  // This hook will be called when the selected attributes will change
  // TODO: On the change of the selected attribute, the xaxis should reflect the change
  useEffect(() => {
    console.log(selectedAttr);
    xRange= range(10, width, width/selectedAttr.length);
    // X axis: scale and draw:
    xScale = d3.scaleOrdinal().domain(selectedAttr).range(xRange);
    xAxis = d3.select("g#xAxis");
    xAxis.transition().duration(2000).call(d3.axisBottom(xScale))
  }, [selectedAttr])

  return (
      <div id="attrContribWrapper">
          
      </div>
  );

}

