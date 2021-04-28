import React from 'react';
import { Select } from 'antd';

const { Option } = Select;
const nrOfScenarios = 9;
const scenarios = [...Array(nrOfScenarios).keys()].map(i => i + 1);

export const SelectScenario = ({ onScenarioChange }) => (
  <Select
    className='Select'
    size='large'
    placeholder="Choose a scenario"
    optionFilterProp="children"
    onChange={onScenarioChange}
    defaultValue={1}
    filterOption={(input, option) =>
      option.children.toString().indexOf(input.toLowerCase()) >= 0
    }
  >
    { scenarios.map(scenario => (
      <Option key={scenario} value={scenario}>scenario {scenario}</Option>
    ))}
  </Select>
)
