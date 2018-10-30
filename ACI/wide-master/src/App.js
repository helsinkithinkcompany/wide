import React from 'react';
import {Pane, Heading, IconButton, Spinner, Text} from 'evergreen-ui';
import Help from './components/Help';
import KeywordInput from './components/KeywordInput';
import Charts from './components/Charts';
import axios from 'axios';

class App extends React.Component {
  state = {
    isLoading: false,
    showHelp: false,
    keywords: [],
    data: null,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const toYear = new Date().getFullYear();
    const fromYear = toYear - 4;
    const [keyword] = this.state.keywords;
    if (keyword == null) return;

    this.setState({isLoading: true});
    axios
      .get(
        `https://aqueous-headland-15358.herokuapp.com/query/${fromYear}/${toYear}/${keyword}`
      )
      .then(({data}) => {
        this.setState({isLoading: false, data});
      })
      .catch((err) => {
        console.log(err);
        this.setState({isLoading: false});
      });
  }

  doChangeKeyword = (keywords) => {
    this.setState({keywords}, this.fetchData);
  };

  doCloseHelp = () => this.setState({showHelp: false});

  doToggleHelp = () => this.setState({showHelp: !this.state.showHelp});

  render() {
    return (
      <main>
        <Help isShown={this.state.showHelp} onClose={this.doCloseHelp} />
        <Pane
          elevation={1}
          marginBottom={16}
          padding={16}
          display="flex"
          alignItems="center"
        >
          <Pane width="25%" display="flex" alignItems="center">
            <Heading size={600} letterSpacing="2px">
              WIDE CHALLENGE
            </Heading>
            <IconButton
              onClick={this.doToggleHelp}
              marginLeft={12}
              appearance="minimal"
              icon="help"
              iconSize={18}
              intent="success"
            />
          </Pane>
          <Pane width="75%">
            <KeywordInput
              values={this.state.keywords}
              onChange={this.doChangeKeyword}
            />
          </Pane>
        </Pane>
        {this.state.isLoading ? (
          <Pane
            width="100%"
            height={120}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Spinner />
            <Text size={500} marginTop={24}>
              May take a bit of time. Kahvia?{' '}
              <span role="img" aria-label="coffee">
                ☕️
              </span>
            </Text>
          </Pane>
        ) : (
          <Charts data={this.state.data} />
        )}
      </main>
    );
  }
}

export default App;
