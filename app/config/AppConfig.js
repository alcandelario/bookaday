import { 
  AppState, 
  Platform 
}                               from 'react-native';
import React, { Component }     from 'react';
import App                      from '../index';
import IOS                      from './IOS';
import NotificationsController  from '../NotificationsController';

if( Platform.OS === 'android' ) {
  var Android = require( './Android.js' );
}

export default class AppConfig extends Component {

  constructor( props ) {
    super();
  }

  componentDidMount() {
  }

  handleAppStateChange( appState ) {
  }

  async handleBackgroundEvent( context ) {
    let n = new NotificationsController;
    let time = await n.getTime();

    App._log( "Received background-fetch event" );
    App._log( 'The notifications start-time: ' + new Date( parseInt( time ) ).toLocaleString() );

    /*
     * Report the start time and check to see
     * if we need to fire a new notification
     */
    await n.checkForNextNotification( time );
  }

  render() {

    // Which config component to use?
    var config = ( Platform.OS === 'android' ) ? <Android /> : <IOS />;

    return (

      config
      
    );
  }
}