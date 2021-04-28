import React from 'react';
import { Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import './ScoreHelper.css';

const content = (
  <div className='ScoreHelperContent'>
    <div className='LegendTitle'>Highest Score/ Avg Score</div>
    <div className='LegendItem'><b>Highest Score</b> shows the score value and the interpolation of the highest score of a trip in one of the segments</div>
    <div className='LegendItem'><b>Avg Score</b> shows the average score and interpolation of a trip between all segments</div>
    <div className='LegendTitle'>Score Distribution</div>
    <div className='LegendItem'>
      <div className='ScoreBarDistribution' />
      The bar height represents the number of scores in a 1 score interval
    </div>
    <div className='LegendTitle'>Score</div>
    <div className='LegendItem'>
      <div className='ScoreBar' />
      Is represented by ther bar's length. Higher score = higher probability it is outlier
    </div>
    <div className='LegendTitle'>Interpolation/Artifitial points</div>
    <div className='LegendItem'>
      <div className='InterpolationSquare NoInterpolation' />
      When there is 0 interpolation
    </div>
    <div className='LegendItem'>
      <div className='InterpolationSquare SplitInterpolation' />
      When there is 50% interpolation
    </div>
    <div className='LegendItem'>
      <div className='InterpolationSquare FullInterpolation' />
      When there is 100% interpolation
    </div>
  </div>
);

export const ScoreHelper = () => (
  <Popover content={content} title="Trip Score Legend" trigger="click" placement="topRight">
      <QuestionCircleOutlined className='scoreHelperIcon'/>
  </Popover>
)
