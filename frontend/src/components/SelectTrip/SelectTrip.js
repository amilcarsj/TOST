import React, { useState, useEffect} from 'react';
import { Select, Typography } from 'antd';
import './SelectTrip.css';

const { Option } = Select;
const { Title } = Typography;

export const SelectTrip = ({ tripsId, onSelectedTripChange, value }) => {
  return (
    <div className='Wrapper'>
      <Select
        className='Select'
        size='large'
        value={value}
        showSearch
        style={{ width: '100%' }}
        placeholder="Select trip id"
        optionFilterProp="children"
        onChange={onSelectedTripChange}
        allowClear={true}
        filterOption={(input, option) =>
          option.children.toString().indexOf(input.toLowerCase()) >= 0
        }
      >
        { tripsId.map(tripId => (
          <Option key={tripId} value={tripId}>{tripId}</Option>
        ))}
      </Select>
    </div>
  );
}
