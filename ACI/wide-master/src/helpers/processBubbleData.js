const COLORS = [
  '#003f5c',
  '#2f4b7c',
  '#665191',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
  '#de425b',
  'rgb(93, 164, 214)',
  'rgb(255, 144, 14)',
  'rgb(44, 160, 101)',
  'rgb(255, 65, 54)',
  '#003f5c',
  '#2f4b7c',
  '#665191',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
  '#de425b',
  'rgb(93, 164, 214)',
  'rgb(255, 144, 14)',
  'rgb(44, 160, 101)',
  'rgb(255, 65, 54)',
  '#003f5c',
  '#2f4b7c',
  '#665191',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
  '#de425b',
  'rgb(93, 164, 214)',
  'rgb(255, 144, 14)',
  'rgb(44, 160, 101)',
  'rgb(255, 65, 54)',
  '#003f5c',
  '#2f4b7c',
  '#665191',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
  '#de425b',
  'rgb(93, 164, 214)',
  'rgb(255, 144, 14)',
  'rgb(44, 160, 101)',
  'rgb(255, 65, 54)',
];

export default function(data) {
  let min = Infinity;
  let max = -Infinity;

  const frames = Object.entries(data).map(
    ([year, {institutions, size_values}]) => {
      min = Math.min(min, ...size_values);
      max = Math.max(max, ...size_values);

      const opacity = Array.from({length: institutions.length}, () => 0.8);

      return {
        name: year,
        data: [
          {
            text: institutions,
            y: size_values,
            mode: 'markers',
            marker: {
              color: COLORS,
              opacity,
              size: size_values.map((x) => x * 3),
            },
          },
        ],
      };
    }
  );

  // Now create slider steps, one for each frame. The slider
  // executes a plotly.js API command (here, Plotly.animate).
  // In this example, we'll animate to one of the named frames
  // created in the above loop.
  const sliderSteps = frames.map(({name}) => ({
    method: 'animate',
    label: name,
    args: [
      [name],
      {
        mode: 'immediate',
        transition: {duration: 300},
        frame: {duration: 300, redraw: false},
      },
    ],
  }));

  const layout = {
    width: document.body.clientWidth - 64,
    height: 600,
    xaxis: {
      showgrid: false,
      zeroline: false,
      showline: false,
      autotick: true,
      ticks: '',
      showticklabels: false,
      // range: [30, 85],
    },
    yaxis: {
      range: [Math.floor(min) - 20, Math.ceil(max) + 20],
    },
    hovermode: 'closest',
    // Finally, add the slider and use `pad` to position it
    // nicely next to the buttons.
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

  return {data: frames[0].data, layout, frames};
}
