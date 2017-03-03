import React, { Component }     from 'react';
import PushNotification         from 'react-native-push-notification';
import App                      from './index';
import NotificationsController  from './NotificationsController';
import DataController           from './DataController';

export default class PushController extends Component {

  constructor( props ) {
    super(props);

    this.state = {
      seconds: 3
    }
  }

  componentDidMount() {
     
    /**
     * Configure the push notifications native component
     */
    PushNotification.configure({
      onNotification: function( notification ) {
        App._log( 'NOTIFICATION OPENED');
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
    });
  }

  render() {
    return null;
  }
}