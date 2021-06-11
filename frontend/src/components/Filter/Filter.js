import React, { useState, useRef } from 'react';
import { Drawer, Input, InputNumber, Button, Dropdown, Menu } from 'antd';
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

const interpolationFilterDropdown = (
  <Menu>
    <Menu.Item>
      <a>
        Interpolation&lt;25% 
      </a>
    </Menu.Item>
    <Menu.Item>
      <a>
        25%&lt;Interpolation&lt;50%
      </a>
    </Menu.Item>
    <Menu.Item>
      <a>
        50%&lt;Interpolation&lt;75%
      </a>
    </Menu.Item>
    <Menu.Item>
      <a>
        Interpolation&gt;75% 
      </a>
    </Menu.Item>
  </Menu>
);

export const Filter = ({ visible, filterByColumn, onClose, numFilters, columnWidth, data, onUpdateFilters }) => {
  const inputRefMin = useRef([]);
  const inputRefMax = useRef([]);
  const inpFilterRef= useRef([]);

  if (filterByColumn.length != data[0].length) {
    return <></>;
  }
  const minMaxValues = memcalculateMinMax(data, filterByColumn);

  // const [filterValues, setFilterValues] = useState(filterByColumn);

  inputRefMin.current = new Array(filterByColumn.length);
  inputRefMax.current = new Array(filterByColumn.length);

  const calculateFilterValues = () => {
    const values = [...Array(filterByColumn.length).keys()].map(index => {
      if (index == 0) {
        return null;
      }
      const min = inputRefMin.current[index].inputNumberRef.state.inputValue;
      const max = inputRefMax.current[index].inputNumberRef.state.inputValue;

      if (min == null && max == null) {
        return null;
      }
      if (min == null) {
        return [minMaxValues[index][0], parseFloat(max)]
      }
      if (max == null) {
        return [parseFloat(min), minMaxValues[index][1]]
      }
      return [parseFloat(min), parseFloat(max)];
    });

    return values;
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
            <Dropdown overlay={interpolationFilterDropdown} 
                      placement="bottomLeft" 
                      arrow='true'>
              <Button type="primary" style={{ width: '100%', textAlign: 'center',marginBottom: '5px'}}>Interpolation Filter 
                <DownOutlined style={{marginTop: '8px'}} />
              </Button>
            </Dropdown>
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
