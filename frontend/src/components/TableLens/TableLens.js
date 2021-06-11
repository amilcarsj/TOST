import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { select, axisBottom, scaleLinear, group } from 'd3';
import { Button, Typography } from 'antd';
import { renderBarChart } from './renderBarChart';
import sortDefault from './sort.svg';
import sortAsc from './sort_asc.svg';
import sortDesc from './sort_desc.svg';
import cancelIcon from './cancelIcon.svg';
import { ScoreHelper, Filter } from '..';
import './TableLens.css';

const { Title } = Typography;

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

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

let prevFilterByColumn;

export const TableLens = ({ data, header, onTripClick, calcMethod, setCalcMethod }) => {
  const numColumnsWithScores = data[0].length;
  const svgRef = useRef();
  const wrapperRef = useRef();
  const hoveredRowRef = useRef();
  const tableHeaderRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  const [selected, setSelected2] = useState(null);
  const [selectedIndex, setSelected] = useState(null);
  const [hovered, setHovered] = useState(1);
  const [sortState, setSortState] = useState(null);
  const [filterByColumn, setFilterChange] = useState(Array(numColumnsWithScores).fill(null));
  const [sortedData, setSortedData] = useState(data);
  const [showFilters, setShowFilters] = useState(false);

  const headerHeight = 130;
  const columnPadding = 20;
  const padding = sortedData.length <= 20 ? 1 : 0.1;
  const selectedBarHeight = 20;

  if (!prevFilterByColumn) {
    prevFilterByColumn = Array(numColumnsWithScores).fill(null)
  }

  const compare = (a,b, sortBy, sortState) => {
    const aVal = sortBy == 'score' ? a.value : a.interpolation;
    const bVal = sortBy == 'score' ? b.value : b.interpolation;
    if (sortState == 1) {
      return bVal - aVal
    }

    return aVal - bVal;
  }
  // Setting the states after receiving the data
  useEffect(() => {
    // clean filter on different scenarios
    setSortState(null);
    setFilterChange(Array(numColumnsWithScores).fill(null));
    setSortedData(data);
    setHovered(null);
    setSelected(null);
  }, [data]);

  // const prevFilterByColumn = usePrevious(filterByColumn);
  // const prevSortState = usePrevious(sortState);

  // Filtering and sorting the data depending on the selection 
  useEffect(() => {
    let sortedData = [...data];

    const isFilterReset = filterByColumn.every(val => val == null);
    if (!isFilterReset) {
      sortedData = sortedData.filter(row => {
        return filterByColumn.some((filterInterval, columnIndex) => {
          if (filterInterval == null) { // no filter has been set to this column yet
            return false;
          }

          const score = row[columnIndex].value;
          if (score < filterInterval[0] || score > filterInterval[1]) {
            return false;
          }

          return true;
        });
      });
    }

    if (sortState) {
      const columnIndex = sortState.column;
      sortedData.sort((a,b) => compare(a[columnIndex], b[columnIndex], sortState.sortBy, sortState.state ))
    }

    setSortedData(sortedData);
  }, [sortState, filterByColumn])

  const calcWidth = (value, column) => {
    const maxWidth = (dimensions.width / data[0].length) - (columnPadding + 5);

    if (column == 0) {
      return 0;
    }

    const values = data.map(row => row[column].value);
    const maxValue = Math.ceil(Math.max(...values)); // add this to round up to align with bar chart
    const width = (value.value / maxValue) * maxWidth;
    return width;
  }

  const getXScale = () => {
    return scaleLinear()
    .domain([0, data[0].length])
    .range([0, dimensions.width])
  }

  const colorScale = scaleLinear()
    .domain([0,0.5,1])
    .range(['#67a9cf', '#f7f7f7', '#ef8a62'])
    .clamp(true)

  const getNonSelectedBarHeight = () => {
    const numPaddings = (sortedData.length - 1) * 2;
    const heightWithoutPaddings =  (dimensions.height - headerHeight - (padding * numPaddings))
    if (selected != null) {
      return (heightWithoutPaddings - selectedBarHeight) / (sortedData.length - 1);
    }

    return Math.min(heightWithoutPaddings / sortedData.length, 20);
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
      return (index * getNonSelectedBarHeight()) + usedPadding + headerHeight;
    }

    return ((index - 1) * getNonSelectedBarHeight()) + usedPadding + selectedBarHeight;
  }

  useEffect(() => {
    // Header
    if (!dimensions) {
      return;
    }
    const barChartHeight = 50;
    const xScale = getXScale();
    const columnWidth = dimensions.width / data[0].length - columnPadding;
    const gHeader = select(tableHeaderRef.current);
    const columns = [...Array(data[0].length).keys()] // get number of columns which have values to display
    const columnsValues = columns.map(column => column == 0 ? [] : data.map(row => row[column].value)); // groups values by columns
    const iconSize = 15;
    // const addTitle = (d, i, j) => {
    //   const parent = d3.select(nodes[i]);

    // }

    const addTitle = (columnValues, columnIndex, nodes) => {
      const parent = d3.select(nodes[columnIndex]);
      if (columnIndex == 0) {
        return;
      }

      const getIcon = (columnIndex, sortBy) => {
        if (!sortState || sortState.column != columnIndex || sortBy != sortState.sortBy) return sortDefault;
        if (sortState.state == 1) return sortAsc;
        return sortDesc;
      }

      parent
        .selectAll('.title')
        .data(d => [d])
        .join('text')
        .attr('class', 'title')
        .text(header[columnIndex])
        .attr('y', 0)
        .attr('x', columnWidth / 2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', "hanging")

      const sortGroup = parent
        .selectAll('.sortGroup')
        .data(d => [d])
        .join('g')
        .attr('class', 'sortGroup')
        .attr('transform', 'translate(0, 20)')

      sortGroup
        .selectAll('.sortIcon')
        .data(d => [columnIndex])
        .join('svg:image')
        .attr('class', 'sortIcon')
        .attr("xlink:href", getIcon(columnIndex, 'score'))
        .attr("width", iconSize)
        .attr("height", iconSize)
        .attr("x", 0)
        .attr("y",0)
        .on('click', () => {
          const columnSortState = (!sortState || sortState.column != columnIndex) ? 0 : sortState.state;
          const newState = (columnSortState == 0 ||  columnSortState == 2) ? 1 : 2; // if on default or desc go to asc
          setSortState({ column: columnIndex, state: newState, sortBy: 'score' });
        });

        sortGroup
          .selectAll('.sortIconI')
          .data(d => [columnIndex])
          .join('svg:image')
          .attr('class', 'sortIconI')
          .attr("xlink:href", getIcon(columnIndex, 'interpolation'))
          .attr("width", iconSize)
          .attr("height", iconSize)
          .attr("x", columnWidth - iconSize)
          .attr("y",0)
          .on('click', () => {
            const columnSortState = (!sortState || sortState.column != columnIndex) ? 0 : sortState.state;
            const newState = (columnSortState == 0 ||  columnSortState == 2) ? 1 : 2; // if on default or desc go to asc
            setSortState({ column: columnIndex, state: newState, sortBy: 'interpolation' });
          });

      const sortLegendPadding = 20;
      sortGroup
        .selectAll('.S')
        .data(d => [d])
        .join('text')
        .attr('class', 'S')
        .text('S')
        .attr('y', 12)
        .attr('x', sortLegendPadding)
        .attr('text-anchor', 'start')

      sortGroup
        .selectAll('.I')
        .data(d => [d])
        .join('text')
        .attr('class', 'S')
        .text('I')
        .attr('y', 12)
        .attr('x', columnWidth - sortLegendPadding)
        .attr('text-anchor', 'end')
    }

    const addBarChart = (columnValues, columnIndex, nodes) => {
      if (columnIndex == 0) {
        return;
      }

      const parent = d3.select(nodes[columnIndex])

     const g = parent
        .selectAll('.barGroup')
        .data(d => [columnValues])
        .join('g')
        .attr('class', 'barGroup')
        .attr('transform', `translate(0,  ${headerHeight - barChartHeight - 25})`)
      // let g = parent.select('g')
      // if (g.empty()) {
      //   g = parent.append('g').attr('transform', `translate(0,  ${headerHeight - barChartHeight - 25})`)
      // }

      const onFilterChange = (minMaxFilterValues) => {
        if (filterByColumn[columnIndex] != null && filterByColumn[columnIndex].every((val, index) => val ==  minMaxFilterValues[index])){
          return;
        }
        let filterValues = [...filterByColumn];
        filterValues[columnIndex] = minMaxFilterValues;
        setHovered(null);
        setSelected(null);
        setFilterChange(filterValues);
      }

      // console.log(prevFilterByColumn, filterByColumn)
      const isFilterReset = filterByColumn.every(val => val == null);
      const isEqual = filterByColumn[columnIndex] == prevFilterByColumn[columnIndex] ||
        (filterByColumn[columnIndex] &&  prevFilterByColumn[columnIndex] && filterByColumn[columnIndex].every((val, index) => val ==  prevFilterByColumn[columnIndex][index]))
      // console.log('isEqual', isEqual, filterByColumn[columnIndex], prevFilterByColumn[columnIndex]);
      prevFilterByColumn[columnIndex] = filterByColumn[columnIndex]
      // console.log(isFilterReset)
      renderBarChart(g, columnValues, columnValues[hovered], columnWidth, barChartHeight, onFilterChange, isFilterReset, filterByColumn[columnIndex], !isEqual);
    }

    const headerGroup = gHeader
      .selectAll('.headerGroup')
      .data(columnsValues)
      .join('g')
      .attr('class', 'headerGroup')
      .attr('transform', (val, index) => `translate(${xScale(index) + 5}, 0)`)
      .each(addTitle)
      .each(addBarChart)

  }, [data, sortedData, filterByColumn, dimensions]);

// creates the table of trip score from the sortedData
  useEffect(() => {
    // Table
    if (!dimensions) {
      return;
    }

    const svg = select(svgRef.current);
    // const svgHovered = select(svgRef.current);

    const xScale = getXScale();
      // .padding(0.5);

    // const yScale = scaleBand()
    //   .domain(data.map((value, index) => index))
    //   .range([0, dimensions.height])
    //   .padding(0.02);
    // const yScale = scale()

    //d3 selector for all the bars in the tablelense
    const groups = svg
      .select('.table')
      .selectAll('.row')
      .data(sortedData)
      .join('g')
      .attr('class', 'row')
      .on("mouseenter", (value, index) => {
        //  setSelected(index);
        setHovered(index);
      })
      // .on("mouseleave", () => {
      //   setHovered(null);
      // })
      .on('click', (value, index) => {
        const tripId = value[0]
        onTripClick(tripId);
        if (selectedIndex == index) {
          return setSelected(null)
        }
        setSelected(index);
      })
      .attr('transform', (val, index) => `translate(0, ${getYPos(index)})`)
      .each((d, i, nodes) => {
        const parent = d3.select(nodes[i]);
        parent
          .selectAll('.rowbackground') // selector for row background
          .data(d => [d])
          .join('rect')
          .attr('class', 'rowbackground')
          .attr('height', getBarHeight(i) + (i == selectedIndex ? padding * 2 : 0))
          .attr('y', (i == selectedIndex ? -padding : 0))
          .attr('width', dimensions.width)
          .attr('fill', `${i == selectedIndex ? '#999999': 'white'}`)

        parent
          .selectAll('.bar')   // selector for all the bars
          .data(d)
          .join('rect')
          .attr('class', 'bar')
          .attr('height', getBarHeight(i))
          .attr('x', (val, index) => {
            return xScale(index) + 5; // there is some padding with the bar chart tick, it need to add here so both align
          })
          .attr('y', 0)
          .transition()
          .attr('width', (val, index) => calcWidth(val, index))
          .attr('fill', val => colorScale(val.interpolation))
      })

  }, [sortedData, selectedIndex, dimensions]);

  useEffect(() => {
    const hoveredRow = select(hoveredRowRef.current);
    if (hovered == null) {
      hoveredRow.selectAll('.hoveredRowData').remove();

      return;
    }

    if (!dimensions || !sortedData[hovered]) {
      return;
    }

    const columnWidth = dimensions.width / data[0].length - columnPadding;
    const xScale = getXScale();
    const marginTop = 10;
    const height = 30;

    const getText = (data, index, row) => {
      if (index == 0) {
        return `Id: ${data.toFixed(0)}, Rank: ${(selectedIndex || hovered) + 1}`;
      }
      if (data.value == null) {
        return "No data"
      }
      return `S: ${data.value.toFixed(2)}, I: ${Math.round(data.interpolation.toFixed(2) * 100)}%`;
    }

    const updateHoveredRow = (d, i, j) => {
      const parent = d3.select(j[i]);
      let fo;
      if (i == 0) {
        fo = parent.select('.fo');
        if (fo.empty()) {
          fo = parent.append('foreignObject')
            .attr('class', 'fo')
            .attr("width", columnWidth)
            .attr("height", 50)
            .attr("y", -8)
        }
      }

      if (i > 0) {
        parent
        .selectAll('.bar')
        .data(d => [d])
        .join('rect')
        .attr('class', 'bar')
        .attr('height', 12)
        // .attr('x', (val, index) => {
        //   return xScale(index);
        // })
        .attr('y', 15)
        .attr('x', 5)
        .transition()
        .attr('width', (val) => calcWidth(val, i))
        .attr('fill', val => colorScale(val.interpolation))

        parent
        .selectAll('.bla')
        .data(d => [d])
        .join('text')
        .attr('class', 'bla')
        .text(data =>  getText(data, i))
        .attr('y', 0)
        .attr('x', 5)
        .attr('stroke', 'gray')
        .attr('alignment-baseline', "hanging")
      }

      if (i == 0) {
        fo
        .selectAll('.tripId')
        .data(d => [d])
        .join("xhtml:body")
        .attr('class', 'tripId')
        .html(`
          <div class='TripIdAndRankWrapper'>
            <div><b>Trip Id:</b> <span>${d}</span></div>
            <div><b>Rank:</b> <span>${(selectedIndex != null ? selectedIndex : hovered) + 1}</span></div>
          </div>`)
      }


    // selected.forEach((data, index) => {
    //      console.log(data, index);
    //    });
    }

    const aHeight = Math.min(dimensions.height, headerHeight +20 + sortedData.length * 21)
    hoveredRow
      .attr('transform', `translate(0, ${aHeight + marginTop})`)
      .selectAll('.hoveredRowData')
      .data(selectedIndex != null ? sortedData[selectedIndex] : sortedData[hovered])
      .join('g')
      .attr('class', 'hoveredRowData')
      .attr('transform', (val, index) => `translate(${xScale(index)}, 0)`)
      .each(updateHoveredRow)

    // if (hoveredRow.select('.cancelIcon').empty()) {
        hoveredRow.selectAll('.cancelIcon')
        .data(selectedIndex => [selectedIndex])
        .join('svg:image')
        .attr('class', 'cancelIcon')
        .attr("xlink:href", cancelIcon)
        .attr("width", 15)
        .attr("height", 15)
        .attr('x', dimensions.width + 2)
        .attr('y', 5)
        .attr('fill', 'currentColor')
        .style('visibility', () => selectedIndex == null ? 'hidden' : 'visible')
        .style('cursor', 'pointer')
        .on('click', () =>  {
          setSelected(null)
        })
    // }

  }, [sortedData, hovered, selectedIndex, dimensions]);

  return(
    <div className='scoreTable'>
      <Filter visible={showFilters} data={data} onUpdateFilters={setFilterChange} filterByColumn={filterByColumn} onClose={() => setShowFilters(false)} columnWidth={dimensions ? (dimensions.width / data[0].length): 100}/>
      <div className='scoreTableHeader'>
        <div style={{ display: 'flex' }}>
          <Title level={4} className='TableHeaderTitle' style={{ marginRight: dimensions ? (dimensions.width / data[0].length) - 92 : 20 }}>Trip Score</Title>
          <Button className={`TextButton ${calcMethod == 'max' ? 'ButtonSelected': ''}`}  onClick={() => setCalcMethod('max')}>Highest Score</Button>
          <Button className={`TextButton ${calcMethod == 'avg' ? 'ButtonSelected': ''}`} onClick={() => setCalcMethod('avg')}>Avg Score</Button>
        </div>
        <div>
          <Button className='resetFilterButton' onClick={() => setFilterChange(Array(numColumnsWithScores).fill(null))}> reset filters</Button>
          <Button className='showFiltersButton' style={{ marginLeft: 10 }} onClick={() => setShowFilters(true)}> show filters</Button>
        </div>

        <ScoreHelper />
      </div>
      {/* Score Tablelens */}
      <div className='wrapper' ref={wrapperRef}>
        <svg className='svgtest' ref={svgRef} style={{ height: dimensions ? dimensions.height : 300 }}>
          <g className='header' ref={tableHeaderRef}/>
          <g className='table' />
          <g className='hoveredRow' ref={hoveredRowRef}/>
        </svg>
      </div>
    </div>
  )
}
