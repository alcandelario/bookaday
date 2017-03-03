import { 
  View, 
  Text, 
  Image,
  Linking,
  AppState, 
  Platform,
  AsyncStorage,
  TouchableHighlight
}                               from 'react-native';
import {  
  MKColor, 
  getTheme,
  setTheme, 
}                               from 'react-native-material-kit';
import React, { Component }     from 'react';
import styles                   from './assets/styles/styles';
import App                      from './index';
import DisplayItem              from './DisplayItem';
import DataController           from './DataController';
import PushNotification         from 'react-native-push-notification';
import Buttons                  from './UI/Buttons';
import Cards                    from './UI/Cards';
import Sliders                  from './UI/Sliders';

if( Platform.OS === 'android' ) {
  var BackgroundJob = require( 'react-native-background-job' );
}

export default class NotificationsController extends Component {
  
  constructor( props ) {
    super(props);

    // Function binding
    this.getTime = this.getTime.bind(this);
    this.checkStatus = this.checkStatus.bind(this);
    this.updateDisplayItem = this.updateDisplayItem.bind(this);
    this.toggleNotifications = this.toggleNotifications.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.notificationsEnabled = this.notificationsEnabled.bind(this);
    this.getNotificationParams = this.getNotificationParams.bind(this);
    this.appActiveCheckDisplay = this.appActiveCheckDisplay.bind(this);
    this.checkForNextNotification = this.checkForNextNotification.bind(this);
    this.isTimeForNextNotification = this.isTimeForNextNotification.bind(this);

    // Button properties
    this.button = {
      text : {
        default   : 'Start the notifications!',
        on        : 'Notifications ON',
        off       : 'Notifications are OFF',
      }
    }

    // Async storage keys
    this.STORAGE_KEYS = { 
      ANDROID_CONFIG                  : '@configAndroid:key',
      NOTIFICATIONS_ENABLED           : '@notificationState:key',
      NOTIFICATION_START_TIME         : '@notificationTime:key',
      NOTIFICATIONS_IS_FIRST_ENABLE   : '@notificationHasBeenEnabled:key',
    };

    // General-component params
    this.NOTIFICATION_INTERVAL =  3600000;            //86400000; // 20min = 1200000 60min = 3600000ms 24hrs = 86400000ms;
    this.NOTIFICATION_CHECK_INTERVAL =  90000;  // 1.5min = 90000 15min = 900000 24hrs = 86400000ms;
    this.DEFAULT_IMAGE_URL = './assets/images/defaultbook.jpg';

    // App state properties
    this.state =  {
      buttonPropsText   : this.button.text.default,
      displayTitle      : '',
      displaySubtitle   : '',
      displayStyle      : styles.displayItem,   
      displayContent    : "",
      itemUrl           : '',
      imageUrl          : '', 
      isEnabled         : null,
      isFirstEnable     : false,
    };

    // Init the DataController
    this.DataController = new DataController();

    if( typeof props !== 'undefined' ) {
      props.displayDataAtIndex = this.displayDataAtIndex.bind(this);
      props.setDataAtIndex = this.setDataAtIndex.bind(this);
    }
  }

  displayDataAtIndex( index, fetchAWS ) {
    let data    = this.DataController.getIndexData( index );

    fetchAWS = ( typeof fetchAWS === 'undefined' ) ? true : fetchAWS;

    data.display = '';
    data.itemUrl = '';
    data.imageUrl = '';

    this.updateDisplayItem( data, null, fetchAWS );
  }

  async setDataAtIndex( index, shouldIncrement ) {

    shouldIncrement = ( typeof shouldIncrement === 'undefined' ) ? false : shouldIncrement;

    var setIndex = ( shouldIncrement ) ? index + 1 : index;

    await this.DataController.setDataIndexForDisplay( setIndex );
    await this.DataController.setCurrentDataIndex( setIndex + 1 );

    this.displayDataAtIndex( index, true );
  }
  
  /**
   * Toggles the overall notification state, 
   * kicks off a notification if necessary, and 
   * updates the UI
   * 
   * @return none
   */
  async toggleNotifications() {
    
    // Are notifications enabled
    let enabled = await this.checkStatus();

    // Notifications are currently on
    if( enabled === 'true' ) {
      this.notificationsOff();
    }

    // Notifications are currently off
    else {
      this.notificationsOn();

      // Record when notifications started
      await this.setStartTime()
      .then( ( t ) => {

        // Force the app to send the first notification
        this.checkForNextNotification( t, true );
      });
    }
  }

  isTimeForNextNotification( time ) {
    let ready     = false;
    let now       = Date.now();
    let interval  = parseInt( time ) + this.NOTIFICATION_INTERVAL;

    App._log( 'Time right now: ' + new Date( now ).toLocaleString() );
    App._log( 'Next Notification can be triggered after: ' +  new Date( interval ).toLocaleString() );

    // Update the start time otherwise future checks will
    // also trigger a notification
    if( now > interval ) {
      ready = true;
      this.setStartTime( now );
    }

    return ready;
  }

  /**
   * Main method that kicks off the process
   * of checking/scheduling/displaying
   * notifications
   * 
   * @param  {string}   time    - time-threshold for triggering notifications 
   * @param  {boolean}  force   - override for the time threshold
   * @return {boolean}  result  - whether or not notification was sent
   */
  async checkForNextNotification( time, force ) {
    let result    = false;
    let enabled   = await this.checkStatus();
    force         = ( typeof force === 'undefined' ) ? false : true;

    /*
     * Fire off a push notification if we're being forced
     * somehow, or if it's just time to do so.      
     */
    if ( enabled === 'true' && ( force === true || this.isTimeForNextNotification( time ) ) ) {
      App._log( 'scheduling next notification!' );

      result = true;
      let idx = await this.DataController.getCurrentDataIndex();
      let params = this.getNotificationParams( 5, idx );

      // Schedule the notification
      this.scheduleNotification( params ); //.date, params.message );

      // Save the data index the UI will display until the next notification
      this.DataController.setDataIndexForDisplay( idx );

      // Update the index for the next notification
      this.DataController.incrementDataIndex();

      // Update the UI if necessary
      if( AppState.currentState === 'active' ) {
          this.updateDisplayItem( params );
      }
    }
    else {
      App._log( 'not scheduling a new notification' );
    }

    return result;
  }

  async appActiveCheckDisplay( force ) {
    var self = this;

    let enabled = await this.checkStatus();

    App._log( 'app-active ' + Date.now() );

    if( ( typeof force !== 'undefined' && force === true ) || enabled === 'true' ) {

      // Get the index we need to retrieve our data
      let idx = await this.DataController.getDataIndexForDisplay();
      let params = await this.getNotificationParams( 5, idx );
      
      self.updateDisplayItem( params );
      self.setState( { buttonPropsText : self.button.text.on } );

      /* 
       * While the app is active, periodicially check 
       * to see if we need to update the item being displayed. 
       *
       * When the app goes to the background this setTimeout should 
       * not run. If not, this could be problematic as there'd
       * be multiple setTimeout's being set-up every time the 
       * user opens the app
       */
      setTimeout( function() {
        self.appActiveCheckDisplay();
      }, self.NOTIFICATION_CHECK_INTERVAL );
    }

    this.updateComponentProps()
  }

  /**
   * Get the data we need for next notification
   * 
   * @return {[type]} [description]
   */
  getNotificationParams( delay, idx ) {
    let date    = '';
    let message = '';
    let author  = '';
    let title   = '';
    let console = '';

    delay = ( typeof delay === 'undefined' ) ? this.props.delay : delay;
    date  = new Date( Date.now() + ( delay * 1000 ) );

    // Do we have an actual index from which to pull data?
    if( typeof idx !== 'undefined' && idx !== null ) {
      data    = this.DataController.getIndexData( idx );
      author  = data.author;
      title   = data.title;
      message = title + ' by ' + author;
      console = data.index + ': ' + title + ' by ' + author + ', from index ' + idx;
    }

    return { 
      index   : idx, 
      author  : author, 
      title   : title, 
      date    : date, 
      message : message, 
      display : message,
      console : console,
    };
  }

  /**
   * Config the push controller with the 
   * next notification message
   * 
   * @param  {object} date    - date object
   * @param  {string} message - the guts of the notification
   * @return none
   */
  scheduleNotification( params ) { //date, message ) {

    App._log( 'scheduling notification with msg: ' + params.console );

    // Set the first notification
    PushNotification.localNotificationSchedule({
      message: params.message,
      date : params.date,
    });
  }

  async updateDisplayItem( params, style, fetchAWS ) {

    params.itemUrl = '';
    params.imageUrl = '';

    style = ( typeof style === 'undefined' ) ? styles.buttonPress : style;
    
    // Should we hit the AWS API for data?
    fetchAWS = ( typeof fetchAWS === 'undefined' ) ? true : fetchAWS;

    this.clearDisplay();
    
    // Generate deep links/regular links and get images/metadata
    // from Amazon Associates API
    if( fetchAWS ) {
      params = await this.DataController.getItemDetailAWS( params );
    }

    this.setState({
      displayTitle    : params.title,
      displaySubtitle : params.author,
      displayStyle    : style,
      displayContent  : params.display,
      itemUrl         : params.itemUrl,
      imageUrl        : params.imageUrl,
    });

    this.props.setParentState({curDataIndex : parseInt( params.index ) });
  }

  clearDisplay() {
    this.setState({
      displayTitle    : '',
      displaySubtitle : '',
      displayStyle    : '',
      displayContent  : '',
      itemUrl         : '',
      imageUrl        : '',
    });
  }

  /**
   * Check notification on/off state
   *
   * @return { boolean } status - the on/off state of notifications
   */
  async checkStatus() {

    // Get from storage or pull it from this.state if possible
    let status = await AsyncStorage.getItem( this.STORAGE_KEYS.NOTIFICATIONS_ENABLED );  

    status = ( status === null || typeof status === 'undefined' ) ? 'false' : status;
    
    if( this._isMounted ) {
      this.setState({ isEnabled : status });
    }
    
    App._log( 'checking if notifications are enabled: ' + status );

    this.updateComponentProps();

    return status;
  }

  /**
   * A setter or getter for notifications enabled status
   * 
   * @param  {string} enabled - stringified boolean
   * @return {string} status - notifications status
   */
  async notificationsEnabled( enabled ) {
    if( enabled !== null ) {
      enabled = await AsyncStorage.setItem( this.STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled );
    }
    else {
      enabled = await this.checkStatus();
    }

    if( this._isMounted ) {
      this.setState({ isEnabled : enabled });

      this.updateComponentProps();
    }
    
    return enabled;
  }

  updateComponentProps() {
    if( this._isMounted ) {
      this.props.setParentState({ notificationsEnabled : ( this.state.isEnabled === 'true' ) ? true : false });    
    }
  }

  async notificationsOn( status ) {
    let isFirstEnable = await AsyncStorage.getItem( this.STORAGE_KEYS.NOTIFICATIONS_IS_FIRST_ENABLE );  
    
    // Set the first-time enabled status
    if ( isFirstEnable === null || typeof isFirstEnable === 'undefined' ) {
      isFirstEnable = 'true';
      AsyncStorage.setItem( this.STORAGE_KEYS.NOTIFICATIONS_IS_FIRST_ENABLE, isFirstEnable );
    } 
    
    if( this._isMounted ) {
      this.setState( { buttonPropsText : this.button.text.on, isFirstEnable : ( isFirstEnable === 'true' ) ? true : false });     
    }

    App._log( 'notifications are being turned on' );

    this.notificationsEnabled( 'true' );
  }

  async notificationsOff() {
    App._log( 'notifications are being turned off' );
    
    if( this._isMounted ) {
      this.setState( { buttonPropsText : this.button.text.off } );
    }

    this.notificationsEnabled( 'false' );
  }

  /**
   * Save the time at which notifications
   * were enabled
   */
  async setStartTime( time ) {

    // Set the start date so we know when to fire another notification
    var timestamp = String( ( typeof time === 'undefined' ) ? Date.now() : time );
    
    try {
      App._log( 'setting the "start time" to check against: ' + new Date( parseInt( timestamp ) ).toLocaleString() );

      await AsyncStorage.setItem( this.STORAGE_KEYS.NOTIFICATION_START_TIME, timestamp );

    } catch (error) {
      
      // Error saving data
      console.log( error );
    }

    return timestamp;
  }

  /**
   * Check what time notifications started
   * 
   * @return {string} time - the timestamp at which notifications started
   */
  async getTime() {
    let time = await AsyncStorage.getItem( this.STORAGE_KEYS.NOTIFICATION_START_TIME );
    return time;
  }

  handleAppStateChange( appState ) {
    
    // Update the UI if in the foreground
    if (appState === 'active' ) {
      this.appActiveCheckDisplay();
    }
    else if ( appState === 'background' && Platform.OS === 'android' ) {
      this.configAndroidBG();
    }
  }

  /**
   * Android helper to schedule our
   * background tasks. Should only run
   * once or may throw a warning
   */
  async configAndroidBG() {

    // Get the current state of the app config
    let enb = await AsyncStorage.getItem( this.STORAGE_KEYS.ANDROID_CONFIG );
    let enabled = ( enb === null || typeof enb === 'undefined' ) ? 'false' : enb;
  
    // Schedule the job, only needs to run once    
    // if( AppState.currentState === 'background' && enabled ) {
    if( enabled ) {
      App._log( 'Scheduling android background job' );

      var backgroundSchedule = {
       jobKey   : "bookadayJob",
       timeout  : 5000,
       warn     : false,
      }

      BackgroundJob.schedule(backgroundSchedule);

      // Save the state so we don't try and reschedule
      // as doing so may throw warnings/errors
      AsyncStorage.setItem( this.STORAGE_KEYS.ANDROID_CONFIG, 'true' );
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    this.appActiveCheckDisplay();
    AppState.addEventListener( 'change', this.handleAppStateChange );
  }

  componentWillUnmount() {
    this._isMounted = false;
    AppState.removeEventListener( 'change', this.handleAppStateChange );
  }

  componentWillReceiveProps( nextProps ) {

  }

  async setDataIndex(index) {
    this.DataController.resetCurrentDataIndex( index );
    this.appActiveCheckDisplay(true);
  }

  render() {

    /*
     * If we couldn't retrieve a BG image from the
     * DataController, use a default one instead
     */
    let imageSource = ( this.state.imageUrl.length === 0 ) ? require( './assets/images/defaultbook.jpg' ) : { uri : this.state.imageUrl };

    return (  
      <View style={ [ styles.ovContainer ] }>
        
        <View style={ styles.imageContainer }>
          <Image 
            style={ styles.backgroundImage } 
            source={ imageSource }>
          </Image>
        </View>

        <DisplayItem 
          isFirstEnable={this.state.isFirstEnable}
          isEnabled={this.state.isEnabled} 
          content={ this.state.displayContent } 
          itemUrl={ this.state.itemUrl}  
          title={this.state.displayTitle} 
          subtitle={this.state.displaySubtitle} 
        />
      </View>
    );
  }
}