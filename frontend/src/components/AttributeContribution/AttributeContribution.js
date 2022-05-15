import React, { useState, useEffect} from 'react';
import { Checkbox } from 'antd';
import './AttributeContribution.css';
import * as d3 from 'd3';
// range function
const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

export const AttributeContribution = ({selectedAttr,selectedTrip,scores}) => {
  const [tripID, setTripID] = useState(null);
  
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
    svg.append("circle").attr("cx",width-200).attr("cy",40).attr("r", 6).style("fill", "#3b7406")
    svg.append("circle").attr("cx",width-200).attr("cy",60).attr("r", 6).style("fill", "#ee4266")
    svg.append("text").attr("x", width-190).attr("y", 45).text("Mean Trip").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", width-190).attr("y", 65).text("Selected Trip").style("font-size", "15px").attr("alignment-baseline","middle")
    
  }, [])

  // This hook will be called when a new trip is selected on the scoretable
  useEffect(() => {
    //console.lo g(selectedTrip);
    let tripId, selectedTripScore;
    if(selectedTrip != null){
      setTripID(selectedTrip.tripId);
      //console.log(selectedTrip.tripId);
      // Prepping the selected trip data
      tripId = selectedTrip.tripId;
      selectedTripScore = scores.find(x => x[0] == tripId);
      selectedTripScore = selectedTripScore.map(x => x.attrContribution);
      selectedTripScore.splice(0, 2);
      let selectedTripAttrContrib =new Array(selectedAttr.length).fill(0);
      selectedTripAttrContrib.forEach((element,index, arr) => {
          arr[index] = selectedTripScore.reduce((accum, curr) => accum + curr[index],0)
      });
      selectedTripAttrContrib = selectedTripAttrContrib.map(x=>x/selectedTripScore.length);
      //console.log(selectedTripAttrContrib);
      // creating the viz
      xRange= range(20, width, width/selectedAttr.length);
      xScale = d3.scaleOrdinal().domain(selectedAttr).range(xRange);
      yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
      svg = d3.select("#attrContribWrapper #attrContribSVG g");

      if(!svg.select(".selectedTripBars").empty()){
        let bars = svg.selectAll('.selectedTripBars').data(selectedTripAttrContrib);
        bars.enter()
        .append("rect")
          .attr("class","selectedTripBars")
          .attr("x", function(d, i) { return xScale(selectedAttr[i])-15; })
          .attr("y", function(d) { return yScale(d); })
          .attr("width", 30)
          .transition()
          .duration(1500)
          .attr("height", function(d) { return height - yScale(d); })
          .attr("fill", "#ee4266")
          .style("opacity",0.7);
        
        bars
        .transition()
        .duration(1500)
          .attr("x", function(d, i) { return xScale(selectedAttr[i])-15; })
          .attr("y", function(d) { return yScale(d); })
          .attr("width", 30)
          .attr("height", function(d) { return height - yScale(d); })
          .attr("fill", "#ee4266")
          .style("opacity",0.7);
        
        bars.exit().remove();
        
      }
      else{
        svg.selectAll("selectedTripBar")
        .data(selectedTripAttrContrib)
        .enter()
        .append("rect")
          .attr("class","selectedTripBars")
          .transition()
          .duration(1500)
            .attr("x", function(d, i) { return xScale(selectedAttr[i])-15; })
            .attr("y", function(d) { return yScale(d); })
            .attr("width", 30)
            .attr("height", function(d) { return height - yScale(d); })
            .attr("fill", "#ee4266")
            .style("opacity",0.7)
      }
      
    }
  }, [selectedTrip, scores])

  // This hook will be called when the selected attributes will change
  useEffect(() => {
    //console.log(selectedAttr);
    xRange= range(10, width, width/selectedAttr.length);
    // X axis: scale and draw:
    xScale = d3.scaleOrdinal().domain(selectedAttr).range(xRange);
    xAxis = d3.select("g#xAxis");
    xAxis.transition().duration(2000).call(d3.axisBottom(xScale))
  }, [selectedAttr]);
  // This hook will be called when the calculated score changess
  useEffect(() => {
    let meanTripScore;
    if (scores!= null){
      // Prepping the mean trajectory attr contribution data
      meanTripScore = scores.find(x => x[0] == 162); // finding the mean trip in scores
      meanTripScore = meanTripScore.map(x=>x.attrContribution);
      meanTripScore.splice(0,2);
      let meanTripAttrContrib =new Array(selectedAttr.length).fill(0);
      meanTripAttrContrib.forEach((element,index, arr) => {
          arr[index] = meanTripScore.reduce((accum, curr) => accum + curr[index],0)
      });
      meanTripAttrContrib = meanTripAttrContrib.map(x=>x/meanTripScore.length);
      // viz setup for the mean attr contrib
      xRange= range(20, width, width/selectedAttr.length);
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
          .attr("stroke", "#0ead69")
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
          .attr("stroke", "#0ead69")
          .attr("stroke-width", 2.5)
          .attr("d", d3.line()
            .x(function(d, i) { return xScale(selectedAttr[i]) })
            .y(function(d) { return yScale(d) })
            )
      }
      // dots of the attribute contribution viz
      if(!svg.select(".dots").empty()){
        let dots = svg.selectAll('.dots').data(meanTripAttrContrib);
        dots.enter().append('circle')
          .transition()
          .duration(1000)
          .attr("cx", function(d, i) { return xScale(selectedAttr[i]) })
          .attr("cy", function(d) { return yScale(d) })
          .attr("r", 7)
          .attr("class","dots")
          .style("fill", "#3b7406");

        dots  
        .transition()
        .duration(1500)
          .attr("cx", function(d, i) { return xScale(selectedAttr[i]) })
          .attr("cy", function(d) { return yScale(d) })
          .attr("r", 7)
          .style("fill", "#3b7406");
        dots.exit().remove();
      }
      else{
        svg
        .selectAll('circle .dots')
        .data(meanTripAttrContrib)
        .enter()
        .append('circle')
          .attr("class","dots")
          .attr("cx", function(d, i) { return xScale(selectedAttr[i]) })
          .attr("cy", function(d) { return yScale(d) })
          .attr("r", 7)
          .style("fill", "#3b7406")
        }
     }
  }, [scores])

  return (
      <div id="attrContribWrapper">
          
      </div>
  );

}

