import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.css';

class App extends React.Component {

constructor(props) {
    var IMAGE_BASE = 'https://api.finna.fi';
    super(props)
    this.state = {
        imgLink: null,
        title: null,
        showButton: true

        }
    }

    render(){

        const buttonGUI = ()  => (
            <div>
            <p onClick={this.getData}>Hello world</p>
            </div>
        )
            
        const itemGUI = () => (
            <div>
                <p onClick={this.changeButtonBack}>Hi item!</p>
                <img src={this.state.imgLink} ></img>
            </div>
        )
        const guiHeader = () => (
            <div>
                <div className="topnav">
                <a className="active" href="#home">Home</a>
                <a href="#about">About</a>  
                <a href="https://finna.fi/" target="_blank">FINNA</a>
                <a href="https://twitter.com/FinnaBot" target="_blank">Finna Bot</a>
            </div> 
            <header>
                <h1 className="headerH1">FINNA</h1>
                <h2 className="headerH2">Treasure Tracker</h2>
            </header>
            </div>
        )
    
        return(
            
            <div>
            {guiHeader()}
            {this.state.showButton === true ?
                    buttonGUI() : itemGUI() }
            </div>
        )
}
    

    changeButtonBack = () => {
        this.setState({showButton:true})
    }

   getData=(event)=>{
      const finnaUrl = 'https://api.finna.fi/api/v1/search?type=AllFields&field[]=title&field[]=id&field[]=images&sort=relevance%2Cid%20asc&page=102&limit=1&prettyPrint=false&lng=fi'
      axios.get(finnaUrl)
        .then(response =>{
            this.parseData(response.data)
        })
  }
    parseData = (data) => {
        this.setState({title:data.records[0].title})
        var img ='https://api.finna.fi'+data.records[0].images[0]
        this.setState({imgLink:img})
        this.setState({showButton:false})
        
  }
  
}
ReactDOM.render(<App />, document.getElementById('root'))