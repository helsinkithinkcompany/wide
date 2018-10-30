import firebase from 'firebase/app'
import 'firebase/database'

const config = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_DATABASEURL,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID
}

const fb = firebase.initializeApp(config)

export const getFennicaGroupedData = (group, year) =>
  fb.database().ref(`fennica-grouped/${group}/${year}`).once('value').then((snapshot) => snapshot.val())

export const getFennicaGraphData = () =>
  fb.database().ref(`fennica-graph`).once('value').then((snapshot) => snapshot.val())

export const getFennicaAllDataPerYear = (year) =>
  fb.database().ref(`fennica-all/${year}`).once('value').then((snapshot) => snapshot.val())

export const getAllGroups = () =>
  fb.database().ref(`fennica-group-labels`).once('value').then((snapshot) => snapshot.val())