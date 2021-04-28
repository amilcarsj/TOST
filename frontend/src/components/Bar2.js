import React, { useRef, useEffect, useState } from "react";
import { select, axisBottom, axisRight, scaleLinear, scaleBand } from "d3";

const useResizeObserver = ref => {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        setDimensions(entry.contentRect);
      });
    });
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);
  return dimensions;
};
// 1.23 3.34  - [1-2][2-3][3-4]

function BarChart({ data, selected }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);
  const range = 1; // this value will be used to define the block sizes values

  const min = Math.min(...data).toFixed(2);
  const max = Math.max(...data).toFixed(2);
  const numBars = Math.ceil(max) - Math.floor(min) / range;
  const barsCount = Array(numBars).fill(0);

  data.forEach(val => {
    const index = Math.floor(val) - Math.floor(min);
    barsCount[index] += 1;
  })

  // will be called initially and on every data change
  useEffect(() => {
    const svg = select(svgRef.current);

    if (!dimensions) return;


    const xScale = scaleLinear()
      .domain([Math.floor(min), Math.ceil(max)]) // todo
      .range([0, dimensions.width]); // change

    // scales
    const xBarScale = scaleBand()
      .domain(barsCount.map((value, index) => index))
      .range([0, dimensions.width]) // change
      .padding(0.01);

    const yScale = scaleLinear()
      .domain([0, Math.max(...barsCount)]) // todo
      .range([dimensions.height, 20]); // change

    const colorScale = scaleLinear()
      .domain([75, 100, 150])
      .range(["green", "orange", "red"])
      .clamp(true);

    // create x-axis
    const xAxis = axisBottom(xScale)
      .ticks(2);

    svg
      .select(".x-axis")
      .style("transform", `translateY(${dimensions.height}px)`)
      .call(xAxis);

    // create y-axis
    // const yAxis = axisRight(yScale);
    // svg
    //   .select(".y-axis")
    //   .style("transform", `translateX(${dimensions.width}px)`)
    //   .call(yAxis);

    // draw the bars
    svg
      .selectAll(".bar")
      .data(barsCount)
      .join("rect")
      .attr("class", "bar")
      .style("transform", "scale(1, -1)")
      .attr("x", (value, index) => xBarScale(index))
      .attr("y", -dimensions.height)
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
      .attr("fill", 'green')
      .attr("height", value => dimensions.height - yScale(value));


    svg
      .selectAll('.selected')
      .data([selected])
      .join("rect")
      .attr("class", "selected")
      .attr('y', 0)
      .attr('height', dimensions.height)
      .attr('fill', 'yellow')
      .attr('width', 3)
      .transition()
      .attr("x", val => xScale(val))

  }, [data, dimensions]);

  return (
    <div ref={wrapperRef} style={{ margin: "2rem", width: 300 }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block', overflow: 'visible'}}>
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
    </div>
  );
}

export { BarChart as Bar2 };
