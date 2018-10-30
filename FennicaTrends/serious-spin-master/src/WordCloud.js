import React, { Component } from 'react'
import { getFennicaGroupedData } from './services/firebase'
import {mapCloudWordsPerYear} from './utils/utils'
import Cloud from 'react-d3-cloud'
import './WordCloud.css'
import './Loader.css'

class WordCloud extends Component {
  constructor(props) {
    super(props)
    this.state = {
      wordData: null,
      width: 500,
      height: 500,
      loading: true
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.props.selectedGroup === nextProps.selectedGroup &&
      this.props.selectedYear === nextProps.selectedYear &&
      this.state.loading === nextState.loading &&
      this.state.width === nextState.width
    ) {
      return false
    } else {
      return true
    }
  }

  componentDidMount() {
    this.updateDimensions()
    this.fetchData()
    window.addEventListener('resize', this.updateDimensions)
  }

  componentDidUpdate(prevProps) {
    if(prevProps.selectedYear !== this.props.selectedYear || prevProps.selectedGroup !== this.props.selectedGroup) {
      this.setState({loading: true})
      this.fetchData()
    }
  }

  fontSizeMapper = word => {
    const wordAmount = Object.keys(this.state.wordData).length
    const num = 10-Math.ceil(wordAmount/100)
    return Math.ceil(Math.log2(word.value) * num)+1
  }

  rotate = word => {
    const rand = Math.floor((Math.random() * 4) + 1)
    switch(rand) {
      case 0:
        return -(word.value % 30)
      case 1:
        return -(word.value % 60)
      case 2:
        return word.value % 30
      default:
        return word.value % 60
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }

  fetchData = () => {
    const selectedYear = this.props.selectedYear || '2018'
    const selectedGroup = this.props.selectedGroup || '00 General Terms'
    getFennicaGroupedData(selectedGroup, selectedYear).then(wordData => {
      this.setState({wordData: mapCloudWordsPerYear(wordData), loading: false})
    })

  }

  updateDimensions = () => {
    this.setState({width: window.innerWidth-20})
  }

  onWordClick = word => {
    this.props.setSelectedWord(word.text)
  }

  render() {
    const {wordData, loading} = this.state
    return (
      <div className='WordCloud'>
      {loading && <div className='loader'/> }
      {!loading &&
        <Cloud
          data={wordData}
          fontSizeMapper={this.fontSizeMapper}
          rotate={this.rotate}
          onWordClick={this.onWordClick}
          padding={20}
          width={this.state.width}
          height={this.state.height}
          font={'Fredoka One'}
        />
      }
      </div>
    )
  }
}

export default WordCloud
