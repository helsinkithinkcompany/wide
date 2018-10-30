import React from 'react';
import Plot from 'react-plotly.js';
import processBubbleData from '../helpers/processBubbleData';

export default function KeywordChart(props) {
  const processed = processBubbleData(props.data);
  return <Plot {...processed} />;
}
