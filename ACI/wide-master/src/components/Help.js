import React from 'react';
import {
  SideSheet,
  Paragraph,
  Heading,
  Pane,
  UnorderedList,
  ListItem,
} from 'evergreen-ui';

export default function(props) {
  return (
    <SideSheet isShown={props.isShown} onCloseComplete={props.onClose}>
      <Pane padding={16}>
        <Heading marginBottom={12} size={600} letterSpacing="2px">
          MOTIVATION
        </Heading>
        <Paragraph marginTop={12} marginBottom={12}>
          To help students with two stages in the their research — looking how
          much resources they can expect to find at an institution and how their
          focus on the subject of interest changed over time, and to more easily
          explore commonly researched work.
        </Paragraph>

        <Heading
          marginBottom={12}
          marginTop={12}
          size={600}
          letterSpacing="2px"
        >
          HOW TO USE
        </Heading>
        <Paragraph marginTop={12} marginBottom={12}>
          It's simple. Just enter a keyword for interested subject, for example,
          "EEG" (without quotes). Then press <strong>ENTER</strong>. Please note
          that it takes some time to calculate the data.
        </Paragraph>

        <Paragraph marginTop={12} marginBottom={12}>
          The result is displayed as a bubble chart to show how many
          publications an institution has in one year. By default, the results
          of last 5 years are show.
        </Paragraph>
        <Heading
          marginBottom={12}
          marginTop={12}
          size={600}
          letterSpacing="2px"
        >
          BUBBLE DESCRIPTION
        </Heading>
        <Paragraph marginTop={12} marginBottom={12}>
          To better visualize the relative proportion of publications by
          institution for each year and how they change in publication activity
          over time — larger bubbles denote a higher proportion.
        </Paragraph>
        <Heading
          marginBottom={12}
          marginTop={12}
          size={600}
          letterSpacing="2px"
        >
          CO MAT DESCRIPTION
        </Heading>
        <Paragraph marginTop={12} marginBottom={12}>
          Given a user query as subject, the top 10 keywords that are also used
          in different papers that contain the user query and this heat map
          shows the co occurrence of the keyword pairs — how often they appear
          together in a single publication. Lighter color denotes higher
          frequency — in this example, the subject keyword eeg is very commonly
          seen the subject keyword electroencephalography.
        </Paragraph>
        <Heading
          marginBottom={12}
          marginTop={12}
          size={600}
          letterSpacing="2px"
        >
          FUTURE WORK
        </Heading>
        <UnorderedList>
          <ListItem>
            Normalize the proportions across all time bc different total
            publications from every year
          </ListItem>
          <ListItem>
            API: try with publishDate and see the difference of number in
            results
          </ListItem>
          <ListItem>
            Add more informative features to these visualizations e.g.
            interactive click for list of publications for more info, labels,
            legends
          </ListItem>
        </UnorderedList>
      </Pane>
    </SideSheet>
  );
}
