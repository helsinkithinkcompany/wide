import React from 'react';
import {Checkbox, Pane} from 'evergreen-ui';

const items = [
  {value: 'Helsinki', label: 'University of Helsinki'},
  {value: 'Åbo', label: 'Åbo Akademi University'},
  {value: 'Turku', label: 'University of Turku'},
  {value: 'Tampere', label: 'University of Tampere'},
  {value: 'Jyväskylä', label: 'University of Jyväskylä'},
  {value: 'Oulu', label: 'University of Oulu'},
  {value: 'Vaasa', label: 'University of Vaasa'},
  {value: 'Lapland', label: 'University of Lapland'},
  {value: 'Eastern Finland', label: 'University of Eastern Finland'},
  {value: 'Aalto', label: 'Aalto University'},
];

export default function UniversityList(props) {
  return (
    <Pane>
      {items.map((item) => (
        <Checkbox key={item.val} label={item.label} checked />
      ))}
    </Pane>
  );
}
