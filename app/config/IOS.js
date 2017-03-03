import { 
  View, 
  StyleSheet, 
  AppState, 
  Platform 
}                                 from 'react-native';
import React, { Component }       from 'react';
import App                        from '../index';
import AppConfig                  from './AppConfig';
import BackgroundFetch            from 'react-native-background-fetch';

export default class IOS extends Component {

  constructor( props ) {
    super();
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentDidMount() {
    this.configIOS();
  }

  handleAppStateChange( appState ) {
  }

  async configIOS() {
    var self = this;

    App._log( 'configuring Background Fetch' );

    BackgroundFetch.configure({
      stopOnTerminate: false,
    }, self.handleFetchEvent, self.handleFetchError );
  }

  async handleFetchEvent() {
    
    AppConfig.prototype.handleBackgroundEvent( this );

    // To signal completion of your task to iOS, you must call #finish!
    // If you fail to do this, iOS can kill the app.
    BackgroundFetch.finish();
  }

  handleFetchError( error ) {
    App._log( "RNBackgroundFetch failed to start" );
  }

  render() {
    return null;
  }
}