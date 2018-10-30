import React from 'react';
import Plot from 'react-plotly.js';

export default function Matrix(props) {
  const frames = Object.entries(props.data).map(([name, d]) => {
    return {
      name,
      data: [
        {
          z: d.data,
          x: d.label,
          y: d.label,
          colorscale: 'YIOrRd',
          type: 'heatmap',
        },
      ],
    };
  });

  const sliderSteps = frames.map(({name}) => ({
    method: 'animate',
    label: name,
    args: [
      [name],
      {
        mode: 'immediate',
        transition: {duration: 300},
        frame: {duration: 300, redraw: true},
      },
    ],
  }));

  const layout = {
    width: document.body.clientWidth - 64,
    height: 600,
    sliders: [
      {
        pad: {l: 0, t: 55},
        currentvalue: {
          visible: true,
          prefix: 'Year:',
          xanchor: 'right',
          font: {size: 20, color: '#666'},
        },
        steps: sliderSteps,
      },
    ],
  };

  return <Plot data={frames[1].data} layout={layout} frames={frames} />;
}
