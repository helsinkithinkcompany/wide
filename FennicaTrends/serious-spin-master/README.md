# FennicaCloud

Rather cool word cloud article trend visualizer.

## Before anything
Create a new project to Firebase https://console.firebase.google.com

## Format data
Follow instructions from data/README.md before setup.

## Setup

Add firebase:  
`npm install -g firebase-tools`

Login to firebase:  
`firebase login`

add .env file to project root:  
REACT_APP_APIKEY=  
REACT_APP_AUTHDOMAIN=  
REACT_APP_DATABASEURL=  
REACT_APP_PROJECTID=  
REACT_APP_STORAGEBUCKET=  
REACT_APP_MESSAGINGSENDERID=  

`yarn`

`yarn start`

## Deploy to firebase

`yarn build-fb`

## See app working in Firebase
https://serious-spin.firebaseapp.com
