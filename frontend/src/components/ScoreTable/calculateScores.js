export const calculate = (tripsId, data, selectedSegments, selectedAttr, calcMethod) => {
  const segmentNumbers = Object.keys(data);
  const numSegments = selectedSegments.length;
  const numAttr = selectedAttr.length;
  const tripsScoring = tripsId.map(tripId => {
    let maxScore = 0;
    let totalTripScore = 0;
    let interpolationSum = 0;
    let highesScoreInterpolation = 0;
    let numSegmentsWithScore = numSegments; // use this while there can be trips without score in certain segments
    const segmentScoresForTrip = selectedSegments.reduce((segmentScores, segmentNumber) => {
      const tripIdAndValues = data[segmentNumber].find(row => row[0] == tripId);

      const hasValuesInSegment = tripIdAndValues[1] != null; // if any attribute is null then all of then will be null, except for the tripId

      if (!hasValuesInSegment) {
        numSegmentsWithScore -= 1;
        segmentScores.push({ value: null, interpolation: null })
        return segmentScores;
      }

      const interpolation = tripIdAndValues[tripIdAndValues.length - 1]
      const filteredAttr = selectedAttr.map(attrIndex => tripIdAndValues[attrIndex + 1]) // we add +1 because the first value is the trip id
      // TODO: Capture the attribute names and values
      const sum = filteredAttr.reduce((acc, cur) => acc + Math.abs(cur), 0);
      //TODO: As this sum is being calculated from selected column's sum, 
      //TODO: from the individual value of those attributes, we can calculate, 
      //TODO:how much/percentage of sum is being added from that attribute
      // Later we need to pass it to the parent component, and construct a D3 visualization
      // or some modal to show the amount of contribution (Need to ask from professor) 
      const avgScore = numSegmentsWithScore > 0 ? totalTripScore / numSegmentsWithScore : null;
      const score = sum / numAttr;
      totalTripScore += score;
      if (score > maxScore) {
        maxScore = score;
        highesScoreInterpolation = interpolation;
      }
      interpolationSum += interpolation;
      segmentScores.push({ value: score, interpolation })

      return segmentScores;
    }, []);

    const avgScore = numSegmentsWithScore > 0 ? totalTripScore / numSegmentsWithScore : null;
    const avgInterpolation = numSegmentsWithScore > 0 ?  interpolationSum / numSegmentsWithScore : null;

    if (calcMethod == 'max')
     return [tripId, { value: maxScore, interpolation: highesScoreInterpolation }, ...segmentScoresForTrip];
    return  [tripId, { value: avgScore, interpolation: avgInterpolation }, ...segmentScoresForTrip];
  });

  // downloadObjectAsJson(tripsScoring, 'scoring');
  return tripsScoring;
}
