import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const steps = [
  {
    target: '.headerTitle',
    content: 'The goal of this tool is to help you to find potential outlier trips by giving scores to each of them.',
  },{
    target: '.MapWrapper',
    content: 'Trip trajectories were divided into 10 regions/segments and scores are given for each trip in each of these segments.',
  }, {
    target: '.ComputationFiltersContainer',
    content: 'You can select the segments and attributes you want to use to compute the score.',
  }, {
    target: '.scoreTable',
    content: 'This table show the trips score.',
  }, {
    target: '.row',
    content: 'Each trip is represented in a row, and they have a score for each segment which is represented by a bar',
  }, {
    target: '.row:nth-child(1) .bar:nth-child(3)',
    content: 'The size of the bar shows how big a score is. The larger the bar is the more outlier a trip is on avarage or on a specific segment.',
  }, {
    target: '.row:nth-child(1) .bar:nth-child(3)',
    content: 'Some trips have gaps, and those gaps are filled by artifitially created points/interpolations.',
  },
  {
    target: '.row:nth-child(1) .bar:nth-child(3)',
    content: 'The color of the bar represents how much interpolation there is in a segment for a trip.',
  },
  {
    target: '.row:nth-child(1) .bar:nth-child(3)',
    content: 'Blue means less than 50% interpolation. Red means there is more than 50% interpolation, which may indicate that the data is less reliable..',
  },
  {
    target: '.scoreTable',
    content: 'To see trip information, hover a line and the value will be displayed at the bottom of the table',
  },
  {
    target: '.TripIdAndRankWrapper',
    content: 'Trip Id is the identifier of a trip, and Rank is its position according to the sorting',
  },
  {
    target: '.hoveredRowData:nth-child(2)',
    content: 'S is the score (higher score, more outlier it is) and I is the interpolation (more interpolation less reliable the score is)',
  }, {
    target: '.hoveredRow',
    content: 'In case you want the information of a trip fixed.',
  },
  {
    target: '.row',
    content: 'You can click on a line. To go back with the hover behaviour click on the line again or..',
  },
  {
    target: '.cancelIcon',
    content: 'You can click on the cancel icon',
  },
  {
    target: '.MapWrapper',
    content: 'Clicking on a line also displays the trip trajectory on the map.',
  },
  {
    target: '.MapWrapper',
    content: 'The black portion of line are made of original points and the red are made of interpolations.',
  },

  {
    target: '.headerGroup:nth-child(2)',
    content: 'Here you can see score distribution, do filtering and ordering.',
  }, {
    target: '.header .bar',
    content: 'These bars show how the score is distributed, each bar has a score interval of 1. It is on log scale. You can hover a bar to see how many trips are in a specific interval',
  },
  {
    target: '.tick',
    content: 'Pay attention to these to see the minimun and maximum values',
  },
  // {
  //   target: '.selected',
  //   content: 'This bar shows where the current trip on hover score is in the score distribution. More to the left the better it is.',
  // }, showFiltersButton tick Here any trip that meets at least of the filters will be displayed, all others will be hidden
  {
    target: '.headerGroup:nth-child(2)',
    content: 'It is possible to filter the trips by brushing.',
  },
  {
    target: '.headerGroup:nth-child(2)',
    content: 'Then any trip that meets at least of the filters will be displayed, all others will be hidden.',
  },
  {
    target: '.showFiltersButton',
    content: 'You can also input the filter manually.',
  },{
    target: '.resetFilterButton',
    content: 'This reset all filters',
  }, {
    target: '.sortIcon',
    content: 'Click to sort trips by score',
  },{
    target: '.sortIconI',
    content: 'Click to sort trips by interpolation',
  }, {
    target: '.scoreHelperIcon',
    content: 'In case of doubt click here',
  }]

export const Onboarding = ({ run, setRunOnboarding }) => {

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunOnboarding(false);
    }
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      steps={steps}
      continuous={true}
      run={run}
      showSkipButton={true}
    />
  )
}
// {
//   target: '.row',
//   content: 'Each row shows the scores for a single trip. By clicking on it the trip trajectory will be plotted on th map above',
// },

