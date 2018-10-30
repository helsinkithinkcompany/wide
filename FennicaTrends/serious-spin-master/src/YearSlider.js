import React, { Component } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import './YearSlider.css'

class YearSlider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      minYear: 1980,
      maxYear: 2018
    }
  }

  onSliderChange = (selectedYear) => {
    this.props.setSelectedYear(selectedYear)
  }

  getMarks = () => {
    const {minYear, maxYear} = this.state
    const {selectedYear} = this.props
    const marks = {}
    for (let i = minYear; i <= maxYear; i++) {
      if([minYear, maxYear, selectedYear].includes(i)) {
        marks[i] = i
      } else {
        marks[i] = ''
      }
    }
    return marks
  }

  render() {
    const {minYear, maxYear} = this.state
    const {selectedYear} = this.props
    return (
      <div className='YearSlider'>
        <Slider
          min={minYear}
          max={maxYear}
          defaultValue={selectedYear}
          trackStyle={{ backgroundColor: 'white' }}
          activeDotStyle={{ borderColor: 'white' }}
          marks={this.getMarks()}
          onChange={this.onSliderChange}
        />
      </div>
    )
  }
}

export default YearSlider