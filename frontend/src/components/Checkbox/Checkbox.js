import React, { useState } from 'react';
import { Checkbox } from 'antd';
import './Checkbox.css';

const CheckboxGroup = Checkbox.Group;

export const CheckboxT = ({ options, value, onChange }) => {
  const onCheckAllChange = () => {
    if (options.length == value.length) {
      onChange([]);
    } else {
     onChange(options.map(option => option.value));
    }
  };

  const onSelectChange = (checkedList) => {
    onChange(checkedList.map(item => parseInt(item)))
  }

  return (
    <div>
      <div>
        <Checkbox
          className='CheckAll'
          indeterminate={value.length > 0 && value.length < options.length}
          onChange={onCheckAllChange}
          checked={options.length === value.length}
        >
          Check all
        </Checkbox>
      </div>
      <CheckboxGroup
        options={options}
        value={value}
        onChange={onSelectChange}
      />
    </div>
  );

}

