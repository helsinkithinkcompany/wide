import React from 'react';
import {TagInput} from 'evergreen-ui';

export default function KeywordInput(props) {
  return (
    <TagInput
      width="100%"
      height={40}
      inputProps={{
        placeholder: 'Enter a subject, for example: EEG',
      }}
      values={props.values}
      onChange={props.onChange}
    />
  );
}
