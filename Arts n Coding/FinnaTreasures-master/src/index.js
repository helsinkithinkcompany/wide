import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.css';
import buttonImage from './FINAL.png';


class App extends React.Component {

constructor(props) {
    var IMAGE_BASE = 'https://api.finna.fi';
    super(props)
    this.state = {
        imgLink: null,
        title: null,
        url: null,
        id:null,
        showButton: true

        }
    }

    render(){

        const buttonGUI = ()  => (
            <div id="awesome">
            <div>
                <p>Tervetuloa Treasure Trackeriin!<br></br>
                Treasure Tracker-demo tuo Finnan aarteet eteesi yhdellä napin painaisulla.<br></br>
                <br></br>Paina nappia loytaaksesi aarteita</p>
            </div>
            <div>
                <button onClick={this.getData} id="picButton"><img src={buttonImage}/></button>
            </div>
            </div>
        )
            
        const itemGUI = () => (
            <div id="object">
                <h1>{this.state.title}</h1>
                <a href={this.state.id}>Aineisto Finna.fi:ssa</a>
                <img src={this.state.imgLink} ></img>
                <div>
                <button type="button" onClick={this.getData}>Seuraava</button>
                </div>
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
                <h2 className="headerH2">Treasure Tracker - demo</h2>
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
    getRandomNumber = (min,max) => {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }
    getRandomCategory = () => {
        var WorkOfArt = ["1/WorkOfArt/Graphic/", "1/WorkOfArt/Painting/", "1/WorkOfArt/Drawing/", "1/WorkOfArt/Sculpture/", "1/WorkOfArt/Photograph/", "1/WorkOfArt/Art%2industry/", "1/WorkOfArt/Media art", "1/WorkOfArt/Physical/", "1/WorkOfArt/Installation/", "1/WorkOfArt/Textile/", "1/WorkOfArt/Authorized document/", "1/WorkOfArt/Environment/", "1/WorkOfArt/Mosaic/"]
        var rnd2 = this.getRandomNumber(1,12)
        return WorkOfArt[rnd2];
    }

    changeButtonBack = () => {
        this.setState({showButton:true})
    }


   getData=(event)=>{
    var rnd = this.getRandomNumber(1,100);
    var rndWorkOfArt = this.getRandomCategory()

    const finnaUrl = 'https://api.finna.fi/api/v1/search?type=AllFields&field[]=title&field[]=id&field[]=images&field[]=onlineUrls&filter[]=format:"'+rndWorkOfArt+'"&sort=relevance%2Cid%20asc&page='+rnd+'&limit=1&prettyPrint=false&lng=fi'
        axios.get(finnaUrl)
        .then(response =>{
            this.parseData(response.data);
            
        })
    }
    parseData = (data) => {
        if(data.resultCount<=2 || data.records[0].images[0]==undefined){
            this.getData()
        }
        else{
        this.setState({title:data.records[0].title})
        var img = "https://api.finna.fi"+data.records[0].images[0]
        var finnaLink = "https://finna.fi/Record/"+data.records[0].id
        this.setState({id:finnaLink})
        this.setState({imgLink:img})
        this.setState({showButton:false})
        
        }
        
  }
}
ReactDOM.render(<App />, document.getElementById('root'))