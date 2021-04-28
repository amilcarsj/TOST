//
import { select, axisBottom, axisRight, scaleLinear, scaleBand, scaleSymlog, brushX, event } from "d3";

import { useEffect, useRef } from "react";

/**
 * Hook, that returns the last used value.
 */

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


export const renderBarChart = (svg, data, selected, width, height, onFilterChange, resetBrush, filterValue, shouldUpdate) => {
  const range = 1; // this value will be used to define the block sizes values
  const min = Math.min(...data).toFixed(2);
  const max = Math.max(...data).toFixed(2);
  const numBars = Math.ceil(max) - Math.floor(min) / range;
  const barsCount = Array(numBars).fill(0);

  data.forEach(val => {
    const index = Math.floor(val) - Math.floor(min);
    barsCount[index] += 1;
  });

  const xScale = scaleLinear()
    .domain([Math.floor(min), Math.ceil(max)]) // todo
    .range([0, width]); // change


  // scales
  const xBarScale = scaleBand()
    .domain(barsCount.map((value, index) => index))
    .range([0, width]) // change
    .padding(0.01);

  const yScale = scaleSymlog()
    .domain([0, Math.max(...barsCount)])
    .range([height, 20]) // add some spacing between the bars and the title
    .clamp(true);

  // create x-axis
  const xAxis = axisBottom(xScale)
    .tickValues([Math.floor(min), Math.ceil(max)]);

  const axis = svg
    .selectAll(".x-axis")
    .data(a => [1])
    .join('g')
    .attr('class', 'x-axis')
    .style("transform", `translateY(${height}px)`)

  axis.call(xAxis);


  svg
    .selectAll(".brush")
    .data(a => [1])
    .join('g')
    .attr('class', 'brush')

  const brush = brushX()
    .extent([
      [0, 0],
      [width, height]
    ])
    .on("brush", () => {
      // console.log('brush')
      if (event.selection) {
        const indexSelection = event.selection.map(xScale.invert);
        // setSelection(indexSelection);
        svg
        .selectAll('.filterValue')
        .data(a => [1])
        .join('text')
        .attr('class', 'filterValue')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -2)
        .style('font-size', '12px')
        .text(`${indexSelection[0].toFixed(2)} - ${indexSelection[1].toFixed(2)}`)
      }
    })
    .on("end", () => {
      // console.log('brush2')
      if (event.selection) {
        const indexSelection = event.selection.map(xScale.invert);
        onFilterChange([indexSelection[0], indexSelection[1]])
        // setSelection(indexSelection);
      }
    });

    const labrush = svg
    .select(".brush")
    .call(brush)

    if (shouldUpdate && filterValue) {
      labrush
      .call(brush.move, [xScale(filterValue[0]), xScale(filterValue[1])]);
    }
// initial position + retaining position on resize
  // if (previousSelection === selection) {

  // }
  // create y-axis
  // const yAxis = axisRight(yScale);
  // svg
  //   .select(".y-axis")
  //   .style("transform", `translateX(${width}px)`)
  //   .call(yAxis);

  if (filterValue == null && shouldUpdate) {
    svg
    .select(".brush")
    .call(brush.move, null);

    svg.selectAll('.filterValue').remove()
  }
  // draw the bars
  svg
    .selectAll(".bar")
    .data(barsCount)
    .join("rect")
    .attr("class", "bar")
    .style("transform", "scale(1, -1)")
    .attr("x", (value, index) => xBarScale(index))
    .attr("y", -height)
    .attr("width", xBarScale.bandwidth())
    .on("mouseenter", (value, index) => {
      svg
        .selectAll(".tooltip")
        .data([value])
        .join(enter => enter.append("text").attr("y", yScale(value) - 4))
        .attr("class", "tooltip")
        .text(value)
        .attr("x", xBarScale(index) + xBarScale.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .transition()
        .attr("y", yScale(value) - 8)
        .attr("opacity", 1);
    })
    .on("mouseleave", () => svg.select(".tooltip").remove())
    .transition()
    .attr("fill", '#998ec3')
    .attr("height", value => height - yScale(value));

  // svg
  //   .selectAll('.selected')
  //   .data([selected])
  //   .join("rect")
  //   .attr("class", "selected")
  //   .attr('y', 0)
  //   .attr('height', height)
  //   .attr('fill', '#f1a340')
  //   .attr('width', 3)
  //   .transition()
  //   .attr("x", val => xScale(val))
}
