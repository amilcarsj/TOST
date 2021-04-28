import moize from 'moize';

const hasOutilierValues = (row) => {
  return row.some((columnVal, index) => {
    if (index == 0 || index == 1) { // no filter has been set to this column yet
      return false;
    }

    const score = columnVal.value;
    if (score > 3) {
      return true;
    }

    return false;
  });
}

const getDataWithoutOutliers = (data) => {
  return data.filter(row => !hasOutilierValues(row))
}

const getAOutliers = (data) => {
  return data.filter(row => hasOutilierValues(row))
}

const memGetDataWithoutOutliers = moize(getDataWithoutOutliers);
const memGetAOutliers = moize(getAOutliers);


const shortenNumberOfRows = (data, num) => {
    return [...Array(num).keys()].map(index => data[index]);
}

const scenario1 = (data) => {
  return memGetDataWithoutOutliers(data).slice(0, 200);
}

const scenario2 = (data) => {
  const dataWithoutOutliers = memGetDataWithoutOutliers(data).slice(200, 390);
  const outliers = memGetAOutliers(data);
  return [...outliers.slice(0, 10), ...dataWithoutOutliers];
}

const scenario3 = (data) => {
  const dataWithoutOutliers = memGetDataWithoutOutliers(data).slice(400, 575);
  const outliers = memGetAOutliers(data);
  return [...outliers.slice(outliers.length - 25, outliers.length), ...dataWithoutOutliers];
}

const scenario4 = (data) => {
  const outliers = memGetAOutliers(data);
  return [...outliers.slice(8, 11)]
}

const scenario5 = (data) => {
  return data.slice(100, 300);
}

const scenario6 = data => {
  return data.slice(300, 500);
}

const scenario7 = data => {
  return data.slice(500, 700);
}

const scenario8 = data => {
  const trips =  [2276, 1963, 3062].map(val => data.find(row => row[0] == val));
  return trips;
}

// const scenario9 = data => {
//   const dataWithoutOutliers = memGetDataWithoutOutliers(data).slice(300, 395);
//   const outliers = memGetAOutliers(data);
//   return [...outliers.slice(0, 5), ...dataWithoutOutliers];
// };

// const scenario9 = data => {
//   return [...data.slice(0, 200)];
// };

const scenario9 = data => {
  return data;
};

const getScenarioData = (data, scenarioNum) => {
  switch(scenarioNum) {
    case 1: return scenario1(data);
    case 2: return scenario2(data);
    case 3: return scenario3(data);
    case 4: return scenario4(data);
    case 5: return scenario5(data);
    case 6: return scenario6(data);
    case 7: return scenario7(data);
    case 8: return scenario8(data);
    case 9: return scenario9(data);
    default: return data;
  }
}

export const filterData = (data, scenarioNum) => {
  return getScenarioData(data, scenarioNum);
}

// export const filterData = (data, scenario) => {
//   const numOfOutliers = getNumOfOutliers(scenario);
//   const outliers = getOutliers(data, numOfOutliers);
//   if (scenario == 4) {
//     return outliers;
//   }
//   const dataWithoutOutliers = getDataWithoutOutliers(data);
//   const shotenDataWithoutOutliers = shortenNumberOfRows(dataWithoutOutliers, 200);
//   return [...outliers, ...shotenDataWithoutOutliers];
// }
