import { 
  View, 
  StyleSheet, 
  AppState, 
  Platform 
}                                 from 'react-native';
import React, { Component }       from 'react';
import App                        from '../index';
import AppConfig                  from './AppConfig';
import BackgroundJob              from 'react-native-background-job';

module.exports =  React.createClass({
  propTypes: function() {
    return {
      BACKGROUND_PROCESS_NAME : 'bookadayJob',
    }    
  },

  getInitialState: function() {
    return {
     BACKGROUND_PROCESS_NAME : 'bookadayJob', 
    }
  },

  componentDidMount: function() {
    AppState.addEventListener( 'change', this.handleAppStateChange );
  },

  handleAppStateChange: function( appState ) {

    /*
     * Configure the Android background process
     *
     * This must be "registered" every time the app 
     * runs, but the scheduling only needs to run 
     * once.
     */
    if ( appState === 'background' ) {
      BackgroundJob.cancelAll();

      const backgroundJob = {
        jobKey: 'bookadayJob',
        job: () => { 
          AppConfig.prototype.handleBackgroundEvent( this );
        }
      };

      BackgroundJob.register( backgroundJob );
    }
  },

  render: function() {
    return null;
  },
});

// export default Android;

// export default class Android extends Component {

//   constructor( props ) {
//     super();

//     this.handleAppStateChange = this.handleAppStateChange.bind(this);
//     this.BACKGROUND_PROCESS_NAME = 'abbahoJob';
//   }

//   componentDidMount() {
//     AppState.addEventListener( 'change', this.handleAppStateChange );
//   }

//   handleAppStateChange( appState ) {

//     /*
//      * Configure the Android background process
//      *
//      * This must be "registered" every time the app 
//      * runs, but the scheduling only needs to run 
//      * once.
//      */
//     if ( appState === 'background' ) {
//       BackgroundJob.cancelAll();

//       const backgroundJob = {
//         jobKey: this.BACKGROUND_PROCESS_NAME,
//         job: () => { 
//           AppConfig.prototype.handleBackgroundEvent( this );
//         }
//       };

//       BackgroundJob.register( backgroundJob );
//     }
//   }

//   async configAndroidBG() {

//     // Get the current state of the app config
//     let enb = await AsyncStorage.getItem( this.STORAGE_ANDROID_CONFIG );
//     let enabled = ( enb === null || typeof enb === 'undefined' ) ? 'false' : enb;
    
//     App._log( 'Android background-jobs (aka notifications) enabled: ' + enabled );
    
//     if( AppState.currentState === 'background' && enabled ) {
//       App._log( 'Scheduling android background job' );

//       // Schedule the job, only needs to run once
//       var backgroundSchedule = {
//        jobKey   : "abbahoJob",
//        timeout  : 5000,
//        warn     : false,
//       }

//       BackgroundJob.schedule(backgroundSchedule);

//       AsyncStorage.setItem( this.STORAGE_ANDROID_CONFIG, 'true' );
//     }
//   }

//   render() {
//     return null;
//   }
// }