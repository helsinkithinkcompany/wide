import React, { Component } from 'react'
import Select from 'react-select'
import { getAllGroups } from './services/firebase'
import './GroupSelector.css'
import './Loader.css'

class GroupSelector extends Component {
  constructor(props) {
    super(props)
    this.state = {
      groupOptions: null,
      loading: true
    }
  }

  componentDidMount() {
    getAllGroups().then(groupNames => {
      const sortedGroupNames = this.sortGroups(groupNames)
      const groupOptions = sortedGroupNames.map(groupName => ({ value: groupName, label: groupName }))
      this.setState({groupOptions, loading: false})
      localStorage.setItem('wordCloud-groupOptions', JSON.stringify(groupOptions))
    })
  }

  sortGroups = groups => {
    const sortedArray = Object.keys(groups)
      .sort((a, b) => groups[a].localeCompare(groups[b]))
      .map(key => groups[key])
    return sortedArray
  }

  handleChange = selectedGroup => {
    this.props.setSelectedGroup(selectedGroup.label)
  }

  render() {
    const { groupOptions, loading } = this.state
    const selectedGroup = { value: this.props.selectedGroup, label: this.props.selectedGroup }
    return (
      <div className='GroupSelector'>
        {loading && <div className='loader'/> }
        {!loading &&
          <Select
            value={selectedGroup}
            onChange={this.handleChange}
            options={groupOptions}
          />
        }
      </div>
    )
  }
}

export default GroupSelector