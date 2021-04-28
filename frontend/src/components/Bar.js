import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { select, curveCardinal, line, axisBottom, axisRight, scaleLinear, scaleBand, brushX, event, geoClipRectangle } from 'd3';
import './D3Test.css';

export const TestD3 = () => {
  // const [data, setData] = useState([25, 30, 45, 1]);
  const [data, setData] = useState([25, 30, 45, 1]);
  const data2 = [[1037, { value: 0.15, interpolation: 0.7, 'a': 1}, { value: 0.15, interpolation: 0.7, 'a': 2}, { value: 0.15, interpolation: 0.7, 'a': 3}],
                  [1038, { value: 0.25, interpolation: 0.5, 'a': 1}, { value: 0.15, interpolation: 0.3, 'a': 2}, { value: 0.2, interpolation: 0.4, 'a': 3}],
                  [1039, { value: 0.25, interpolation: 0.5, 'a': 1}, { value: 0.15, interpolation: 0.3, 'a': 2}, { value: 2.3, interpolation: 0.2, 'a': 3}],
                [1040, { value: 0.15, interpolation: 0.7, 'a': 1}, { value: 0.15, interpolation: 0.7, 'a': 2}, { value: 0.15, interpolation: 0.7, 'a': 3}],
                [1041, { value: 0.25, interpolation: 0.5, 'a': 1}, { value: 0.15, interpolation: 0.3, 'a': 2}, { value: 0.2, interpolation: 0.4, 'a': 3}],
                [1042, { value: 0.25, interpolation: 0.5, 'a': 1}, { value: 0.15, interpolation: 0.3, 'a': 2}, { value: 2.3, interpolation: 0.2, 'a': 3}]]
  return (
    <>
      {/* <BarChart data={data}/>
      <button onClick={() => setData(data.map(val => val + 10))}>Update</button>
      <button onClick={() => setData(data.filter(val => val > 20))}>Filter</button>
      <button onClick={() => setData([...data, Math.round(Math.random() * 75)])}>Add</button> */}
      <TableLens data={data2}/>
    </>
  )
}

const useResizeObserver = (ref) => {
  const [dimensions, setDimensions] = useState(null);
  const resizeObserver = new ResizeObserver(entries => {
    setDimensions(entries[0].contentRect);
  });

  useEffect(() => {
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.unobserve(ref.current)
    }
  }, [ref]);


  return dimensions;
}

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const BarChart = ({ data }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);
  const [selection, setSelection] = useState([0, 1]);
  const previousSelection = usePrevious(selection);

  useEffect(() => {
    if (!dimensions) {
      return;
    }

    const svg = select(svgRef.current);

    const xScale = scaleLinear()
      .domain([0, 4])
      .range([0, dimensions.width])
      // .padding(0.5);

    const yScale = scaleLinear()
      .domain([0, Math.max(...data) * 2])
      .range([dimensions.height, 0]);

    const colorScale = scaleLinear()
      .domain([75,100,150])
      .range(['green', 'orange', 'red'])
      .clamp(true)

    const xAxis = axisBottom(xScale)
      .ticks([0.21, 1, 2, 3.73]);

    const yAxis = axisRight(yScale);

    const myLine = line()
      .x((val, index) => index * 50)
      .y(val => dimensions.height - val)
      .curve(curveCardinal);

    svg
      .select('.x-axis')
      .style('transform', `translateY(${dimensions.height}px)`)
      .call(xAxis);

    svg
      .select('.y-axis')
      .style('transform', `translateX(${dimensions.width}px)`)
      .call(yAxis)

    svg
      .selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .style('transform', 'scale(1, -1)')
      .attr('x', (val, index) => xScale(index))
      .attr('y', -dimensions.height)
      .on('mouseenter', (value, index) => {
        svg
          .selectAll('.tooltip')
          .data([value])
          .join(enter => enter.append('text').attr('y',  yScale(value) - 4))
          .attr('class', 'tooltip')
          .text(value)
          .attr('text-anchor', 'middle')
          .attr('x', xScale(index))
          .transition()
          .attr('y', yScale(value) - 8)
          .attr('opacity', 1)
      })
      .on('mouseleave', () => svg.selectAll('.tooltip').remove())
      .attr('width', 40)
      .transition()
      .attr('height', val => dimensions.height - yScale(val))
      .attr('fill', colorScale)

      const brush = brushX()
        .extent([
          [0, 0],
          [dimensions.width, dimensions.height]
        ])
        .on("start brush end", () => {
          if (event.selection) {
            // console.log(xScale.invert)
            // const indexSelection = event.selection.map(xScale.invert);
            // setSelection(indexSelection);
          }
        });

      // initial position + retaining position on resize
      if (previousSelection === selection) {
        svg
          .select(".brush")
          .call(brush)
          .call(brush.move, selection.map(xScale));
      }
  }, [data, dimensions,  previousSelection, selection]);

  return (
    <div className='wrapper' ref={wrapperRef}>
      <svg className='svgtest' ref={svgRef}>
        <g className='x-axis' />
        <g className='y-axis' />
        <g className='brush' />
      </svg>
    </div>
  )
}

export const TableLens = ({ data }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);
  const [selected, setSelected] = useState(null);
  const padding = 2;
  const selectedBarHeight = 60;

  const calcWidth = (value, column) => {
    const maxWidth = dimensions.width / data[0].length;

    if (column == 0) {
      return 0;
    }

    const values = data.map(row => row[column].value);
    const maxValue = Math.max(...values);
    const width = (value.value / maxValue) * maxWidth;
    return width;
  }

  const getNonSelectedBarHeight = () => {
    const numPaddings = (data.length - 1) * 2;
    const heightWithoutPaddings =  (dimensions.height - (padding * numPaddings))
    if (selected != null) {
      return (heightWithoutPaddings - selectedBarHeight) / (data.length - 1);
    }

    return heightWithoutPaddings / data.length;
  }

  const getBarHeight = (index) => {
    if (index == selected) {
      return selectedBarHeight;
    }

    return getNonSelectedBarHeight();
  }

  const getYPos = (index) => {
    const usedPadding = (index * 2) * padding;
    if (selected == null || index <= selected) {
      return (index * getNonSelectedBarHeight()) + usedPadding;
    }

    return ((index - 1) * getNonSelectedBarHeight()) + usedPadding + selectedBarHeight;
  }

  useEffect(() => {
    if (!dimensions) {
      return;
    }

    const svg = select(svgRef.current);

    const xScale = scaleLinear()
      .domain([0, 4])
      .range([0, dimensions.width])
      // .padding(0.5);

    // const yScale = scaleBand()
    //   .domain(data.map((value, index) => index))
    //   .range([0, dimensions.height])
    //   .padding(0.02);
    // const yScale = scale()

    const colorScale = scaleLinear()
      .domain([75,100,150])
      .range(['green', 'orange', 'red'])
      .clamp(true)

    const groups = svg
      .selectAll('.row')
      .data(data)
      .join('g')
      .attr('class', 'row')
      .on("mouseenter", (value, index) => {
         setSelected(index);
      })
      .on("mouseleave", () => {
        setSelected(null);
      })
      .attr('transform', (val, index) => `translate(0, ${getYPos(index)})`)
      .attr("data-index", function(d, i) { return i; })
      .each((d, i, nodes) => {
        console.log('each', d, i, nodes)
      })

    groups
      .selectAll('.rowbackground')
      .data((row, index) => [index])
      .join('rect')
      .attr('class', 'rowbackground')
      .attr('height', val => getBarHeight(val))
      .attr('width', dimensions.width)
      .attr('stroke', val => {
        if (val == selected) {
          return 'red';
        }
        return 'none';
      })
      .attr('fill', 'white')

    const bars = groups
      .selectAll('.bar')
      .data((row, index) => row)
      .join('rect')
      .attr('class', 'bar')
      .attr('height', function(d, i) {
        var j = this.parentNode.getAttribute("data-index");
        return getBarHeight(j)
      })
      .attr('x', (val, index) => {
        return xScale(index);
      })
      // .attr("someAttr", function(d, i) {
      //   var j = this.parentNode.getAttribute("data-index");
      //   console.log(j)
      // })
      .attr('y', 0)
      .attr('width', (val, index) => calcWidth(val, index))
      .attr('fill', function(d, i) {
        var j = this.parentNode.getAttribute("data-index");
        if (j == selected) {
          return 'yellow'
        }
        return 'blue';
      })

      groups
        .selectAll('.label')
        .data((val, index) => { return val;})
        .join('text')
        .text('bla')
        .attr('x', (val, index) => {
          return xScale(index);
        })
        .attr('y', function(d, i, h) {
          // console.log(h)
          var j = this.parentNode.getAttribute("data-index");
          // console.log(j)
          const barHeight = getBarHeight(j);
          return barHeight / 2;
        })
        .attr('alignment-baseline', "middle")
        .attr('class', 'label')



      // bars
      //   .select('.bar')
      //   .append('text')
      // .style('transform', 'scale(1, -1)')
      // .attr('x', 0)
      // .attr('y',(val, index) => yScale(index))
      // .on('mouseenter', (value, index) => {
      //   svg
      //     .selectAll('.tooltip')
      //     .data([value])
      //     .join(enter => enter.append('text').attr('y',  yScale(value) - 4))
      //     .attr('class', 'tooltip')
      //     .text(value)
      //     .attr('text-anchor', 'middle')
      //     .attr('x', xScale(index))
      //     .transition()
      //     .attr('y', yScale(value) - 8)
      //     .attr('opacity', 1)
      // })
      // .on('mouseleave', () => svg.selectAll('.tooltip').remove())
      // .attr('width', '100%')
      // .transition()
      // .attr('height', yScale.bandwidth())
      // .attr('fill', 'colorScale')


  }, [data, selected, dimensions]);

  return(
    <div className='wrapper' ref={wrapperRef}>
      <svg className='svgtest' ref={svgRef}>
        {/* <g className='x-axis' />
        <g className='y-axis' /> */}
        {/* <g className='brush' /> */}
      </svg>
    </div>
  )
}
