import React, { useState, useEffect} from 'react';
import { Checkbox } from 'antd';
import './AttributeContribution.css';
import * as d3 from 'd3';
// range function
const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

export const AttributeContribution = ({selectedAttr,selectedTrip,scores}) => {
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
          .attr("id","attrContribSVG")
        .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    // X axis: scale and draw:
    xRange= range(10, width, width/selectedAttr.length);
    xScale = d3.scaleOrdinal()
          .domain(selectedAttr)
          .range(xRange);
    xAxis = svg.append("g")
          .attr("transform", "translate(10," + height + ")")
          .attr("id","xAxis")
          .attr("class","attributeNameAxis")
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
  useEffect(() => {
    //console.log(selectedAttr);
    xRange= range(10, width, width/selectedAttr.length);
    // X axis: scale and draw:
    xScale = d3.scaleOrdinal().domain(selectedAttr).range(xRange);
    xAxis = d3.select("g#xAxis");
    xAxis.transition().duration(2000).call(d3.axisBottom(xScale))
  }, [selectedAttr]);

  useEffect(() => {
    let meanTripScore;
    if (scores!= null){
      // Creating the mean trajectory attr contribution viz
      meanTripScore = scores.find(x => x[0] == 162); // finding the mean trip in scores
      meanTripScore = meanTripScore.map(x=>x.attrContribution);
      meanTripScore.splice(0,2);
      let meanTripAttrContrib =new Array(selectedAttr.length).fill(0);
      meanTripAttrContrib.forEach((element,index, arr) => {
          arr[index] = meanTripScore.reduce((accum, curr) => accum + curr[index],0)
      });
      meanTripAttrContrib = meanTripAttrContrib.map(x=>x/selectedAttr.length);
      
      xRange= range(15, width, width/selectedAttr.length);
      xScale = d3.scaleOrdinal().domain(selectedAttr).range(xRange);
      yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
      svg = d3.select("#attrContribWrapper #attrContribSVG g");
      // Add the line if it is not there, or update
      if(!svg.select("#meanLine").empty()){
        svg.select("#meanLine")
          .datum(meanTripAttrContrib)
          .transition()
          .duration(1500)
          .attr("id", "meanLine")
          .attr("fill", "none")
          .attr("stroke", "#69b3a2")
          .attr("stroke-width", 2.5)
          .attr("d", d3.line()
            .x(function(d, i) { return xScale(selectedAttr[i]) })
            .y(function(d) { return yScale(d) })
            )
      }
      else{
        svg.append("path")
          .datum(meanTripAttrContrib)
          .attr("id", "meanLine")
          .attr("fill", "none")
          .attr("stroke", "#69b3a2")
          .attr("stroke-width", 2.5)
          .attr("d", d3.line()
            .x(function(d, i) { return xScale(selectedAttr[i]) })
            .y(function(d) { return yScale(d) })
            )
      }
      if(!svg.select(".dots").empty()){
        let dots = svg.selectAll('.dots').data(meanTripAttrContrib);
        dots.enter().append('circle')
          .transition()
          .duration(1500)
          .attr("cx", function(d, i) { return xScale(selectedAttr[i]) })
          .attr("cy", function(d) { return yScale(d) })
          .attr("r", 7)
          .attr("class","dots")
          .style("fill", "green");

        dots  
        .transition()
        .duration(1500)
          .attr("cx", function(d, i) { return xScale(selectedAttr[i]) })
          .attr("cy", function(d) { return yScale(d) })
          .attr("r", 7)
          .style("fill", "green");
        dots.exit().remove();
      }
      else{
        svg
        .selectAll('circle')
        .data(meanTripAttrContrib)
        .enter()
        .append('circle')
          .attr("class","dots")
          .attr("cx", function(d, i) { return xScale(selectedAttr[i]) })
          .attr("cy", function(d) { return yScale(d) })
          .attr("r", 7)
          .style("fill", "green")
        }
     }
  }, [scores])

  return (
      <div id="attrContribWrapper">
          
      </div>
  );

}

