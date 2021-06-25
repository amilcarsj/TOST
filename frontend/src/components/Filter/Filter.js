import React, { useState, useRef } from 'react';
import { Drawer, Input, InputNumber, Button, Dropdown, Menu, Select } from 'antd';
import moize from 'moize';
import './Filter.css';
import { values } from 'd3';
import { DownOutlined } from '@ant-design/icons';

const calculateMinMax = (data, filterByColumn) => {
  const columns = [...Array(data[0].length).keys()] // get number of columns which have values to display
  const columnsValues = columns.map(column => column == 0 ? [] : data.map(row => row[column].value)); // groups values by columns
  const minMaxValues = columnsValues.map(values => {
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));

    return [min, max]
  })

  return minMaxValues;
}

const memcalculateMinMax = moize(calculateMinMax);


const { Option } = Select;

export const Filter = ({ visible, filterByColumn, onClose, numFilters, columnWidth, data, onUpdateFilters }) => {
  const inputRefMin = useRef([]);
  const inputRefMax = useRef([]);
  const interpFilterRef= useRef([]);

  if (filterByColumn.length != data[0].length) {
    return <></>;
  }
  const minMaxValues = memcalculateMinMax(data, filterByColumn);

  // const [filterValues, setFilterValues] = useState(filterByColumn);

  inputRefMin.current = new Array(filterByColumn.length);
  inputRefMax.current = new Array(filterByColumn.length);
  interpFilterRef.current = new Array(filterByColumn.length);

  const calculateFilterValues = () => {
    const values = [...Array(filterByColumn.length).keys()].map(index => {
      if (index == 0) {
        return null;
      }
      const min = inputRefMin.current[index].inputNumberRef.state.inputValue;
      const max = inputRefMax.current[index].inputNumberRef.state.inputValue;
      const interpFilter = interpFilterRef.current[index];
      console.log(interpFilter);
      let filters = new Array();
      if (min == null && max == null) {
        filters=  [minMaxValues[index][0],minMaxValues[index][1]];
      }
      else if (min != null && max != null) {
        filters = [parseFloat(min),parseFloat(max)];
      }
      else if (max == null) {
        filters = [parseFloat(min), minMaxValues[index][1]];
      }
      else if (min == null){
        filters = [minMaxValues[index][0],parseFloat(max)];
      }
      filters.push(interpFilter);
      
      return filters;
    });

    return values;
  }
  const selectFilter = (option, el, index) =>{ 
    interpFilterRef.current[index] = option.value;
  }

  return(<Drawer
    title="Filters"
    placement={'bottom'}
    closable={true}
    onClose={onClose}
    visible={visible}
    destroyOnClose={true}
  >
    <div className={'FilterContentWrapper'}>
    {[...Array(filterByColumn.length).keys()].map(index => {  return (
      <Input.Group key={index} compact style={{padding: '0 5px 0 5px',  width: columnWidth, visibility: index == 0 ? 'hidden' : 'visible', }}>
        { index > 0 &&
          <>
          <Select
              labelInValue
              defaultValue={{value:'all'}}
              style={{ width: '100%' }}
              //ref= {el => interpFilterRef.current[index] = el}
              //ref= {el => interpFilterRef.current[index] = el}
              onSelect = {(val, el) => selectFilter(val, el,index)}
            >
              <Option value="all">Show All </Option>
              <Option value="lt25">interp&lt;25% </Option>
              <Option value="25to50">25%&lt;interp&lt;50%</Option>
              <Option value="50to75">50%&lt;interp&lt;75%</Option>
              <Option value="gt75">interp&gt;75% </Option>

            </Select>
            
            <InputNumber
              style={{ width: '100%', textAlign: 'center', marginBottom: 5 }}
              step={0.1}
              min={minMaxValues[index][0]}
              max={minMaxValues[index][1]}
              placeholder="Min"
              defaultValue={filterByColumn[index] ? filterByColumn[index][0].toFixed(2) : null}
              ref = {el => inputRefMin.current[index] = el}
            />
            <InputNumber
              style={{ width: '100%', textAlign: 'center'}}
              step={0.1}
              min={minMaxValues[index][0]}
              max={minMaxValues[index][1]}
              placeholder="Max"
              defaultValue={filterByColumn[index] ? filterByColumn[index][1].toFixed(2) : null}
              ref = {el => inputRefMax.current[index] = el}
            />
          </>
        }
      </Input.Group>
    )})}
    </div>
    <Button className='UpdateFiltersButton' onClick={() => { onUpdateFilters(calculateFilterValues()) }}> Update Filters </Button>
  </Drawer>)
}

// inputRef.current[11].inputNumberRef.state.inputValue)
