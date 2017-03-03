import { StyleSheet, PixelRatio } from 'react-native';
import React, { Component } from 'react';

const deviceScreen = require('Dimensions').get('window')

const styles = StyleSheet.create({
  container: {
    flex              : 1,
    flexDirection     : 'column',
    justifyContent    : 'center',
    alignItems        : 'center',
    backgroundColor   : '#eee',
    paddingTop        : 7,
    paddingLeft       : 7,
    paddingRight      : 7,
    paddingBottom     : 7,
  },
  controlPanel: {
    flex: 1,
    backgroundColor:'#ddd',
  },
  controlPanelText: {
    color:'white',
  },
  cpContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  row: {
    flexDirection: 'row',
    // backgroundColor:'#fff',
    borderRadius: 0,
    borderWidth: 1,
    borderTopWidth: 1 / PixelRatio.get(),
    borderColor: '#d6d7da',
    padding:7,
    alignItems: 'center'
  },
  rowInput: {
    right:10,
  },
  rowLabel: {
    left:5,
    fontSize:15,
    flex:1,
  },
  sliderContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  sliderLabel: {
    flex: 2,
  },
  sliderMetric: {
    right:0,
    width:30,
  },
  slider: {
    flex: 8,
    height: 40,
  },
  button : {
    backgroundColor : '#2C9963',
    padding         : 7,
    alignItems      : 'center', 
  },
  displayItem : {
    padding         : 15,
    flex            : 1,
  },
  displayItemContainer : {
    flex          : 3,
    flexDirection : 'row',
  },
  imageContainer: {
    flex: 6,
    padding: 10,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex        : 1,
    resizeMode  : 'contain', // or 'stretch'
    // alignSelf   : 'stretch',
    width       : null,
    height      : null,
  },
  buttonContainer : {
    height: 0,
  },
  cardContainer: {
    flex: 5,
    flexDirection: 'row',
  },
  ovContainer: {
    flex              : 1,
    flexDirection     : 'column',
    borderBottomWidth : 4,
    borderBottomColor : 'rgba(0,0,0,0.2)',
    borderLeftWidth   : 3,
    borderLeftColor   : 'rgba(0,0,0,0.2)',
    borderRightWidth  : 3,
    borderRightColor  : 'rgba(0,0,0,0.2)',
    borderTopWidth    : 3,
    borderTopColor    : 'rgba(0,0,0,0.2)',
  },
  ovContainerDisabled: {
    borderBottomColor : 'red',
    borderLeftColor   : 'red',
    borderRightColor  : 'red',
    borderTopColor    : 'red',
  },
  cardTitle: {
    fontSize      : 21,
    marginBottom  : 10,
    flex: 4,
  },
  cardSubtitle: {
    flex: 1,
  },
  cardLink: {
    fontSize        : 16,
    color           : '#ffab40',
  },
  cardLinkBtn: {
    flex: 1,    
    flexDirection: 'column-reverse'
  },
  noImage : {
    color: '#fff',
  }
});

module.exports = styles;