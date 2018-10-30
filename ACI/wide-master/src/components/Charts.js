import React from 'react';
import {Heading, Pane, Text} from 'evergreen-ui';

import Component from '@reactions/component';
import KeywordChart from './KeywordChart';
import Matrix from './Matrix';
import mock from './tst.json';

export default function({data}) {
  if (data == null)
    return <Text>No data to be shown yet. Just try to enter a keyword.</Text>;
  // data = mock.data[0];

  return (
    <Pane>
      <Heading
        size={500}
        letterSpacing="2px"
        paddingLeft={16}
        paddingRight={16}
      >
        BUBBLE CHART
      </Heading>
      <KeywordChart data={data.bubble} />

      <Heading
        size={500}
        letterSpacing="2px"
        paddingLeft={16}
        paddingRight={16}
        marginTop={24}
      >
        CO-OCCURENCE MATRIX
      </Heading>
      <Matrix data={data.comat} />
    </Pane>
  );
}
