import { 
  View, 
  StyleSheet, 
  AppState, 
  Platform 
}                               from 'react-native';
import React, { Component }     from 'react';
import styles                   from './assets/styles/styles';
import AppConfig                from './config/AppConfig';
import PushController           from './PushController';
import NotificationsController  from './NotificationsController';
import DataController           from './DataController';
import Drawer                   from 'react-native-drawer';
import ControlPanel             from './ControlPanel';
import Button                   from './Button';
import tweens                   from './tweens';

const drawerStyles = {
  drawer: {
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 0,
  }
}

export default class App extends Component {
  constructor(props) {
    super(props); 

    this.DataController = new DataController;

    // Function binding
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.toggleNotifications = this.toggleNotifications.bind(this);
    
    // General component constants
    this.PUSH_NOTIFICATION_DELAY = 5;      // seconds

    this.state = {
      openPanel             : false,
      drawerType            : 'displace',
      openDrawerOffset      : 100,
      closedDrawerOffset    : 0,
      panOpenMask           : .1,
      panCloseMask          : .9,
      relativeDrag          : false,
      panThreshold          : .25,
      tweenHandlerOn        : false,
      tweenDuration         : 350,
      tweenEasing           : 'linear',
      disabled              : false,
      tweenHandlerPreset    : null,
      acceptDoubleTap       : false,
      acceptTap             : false,
      acceptPan             : true,
      tapToClose            : false,
      negotiatePan          : false,
      rightSide             : true,
      notificationsEnabled  : false,
      toggleNotifications   : false,
      minDataIndex          : 0,
      maxDataIndex          : 99,
      curDataIndex          : 0,
      firstTimeEnabled      : true,
    };
  }

  setDrawerType(type){
    this.setState({
      drawerType: type
    })
  }

  tweenHandler(ratio){
    if(!this.state.tweenHandlerPreset){ return {} }
    return tweens[this.state.tweenHandlerPreset](ratio)
  }

  noopChange(){
    this.setState({
      changeVal: Math.random()
    })
  }

  openDrawer(){
    this.drawer.open()
  }

  setStateFrag(frag) {
    this.setState(frag);
  }

  async componentDidMount() {
    AppState.addEventListener( 'change', this.handleAppStateChange );

    this.setDataIndexProps();
  }

  async setDataIndexProps() {
    var curDataIndex = await this.DataController.getDataIndexForDisplay();
    var dataIndexLength = this.DataController.getDataProps().length;

    this.setState({
      curDataIndex : parseInt( curDataIndex ), 
      maxDataIndex : parseInt( dataIndexLength - 1 )
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener( 'change', this.handleAppStateChange );
  }

  /**
   * Application state-change handler
   * 
   * @param  {string} appState - the current state of the app
   * @return none
   */
  handleAppStateChange( appState ) {
    App._log( 'app has changed state to: ' + appState );
    App._log( 'platform: ' + Platform.OS + ' version: ' + Platform.Version );

    if( appState === 'active' ) {
      this.setDataIndexProps();
    }
  }

  async toggleNotifications(state) {
    await this.refs.NC.toggleNotifications();
    this.setDataIndexProps();
  }

  setDataAtIndex(index, increment ) {
    this.refs.NC.setDataAtIndex(index, increment);
  }

  displayDataAtIndex(index, fetchAWS ) {
    this.refs.NC.displayDataAtIndex(index, fetchAWS );
  }

  /**
   * Simple logger with app-specific output
   * 
   * @param  {string} msg - string to log
   * @return none
   */
  static _log( msg ) {
    console.log( '[ABBAHO]: ' + msg );
  }

  render() {
    
    return (
      <View style={ styles.container }>
        <AppConfig /> 
        <PushController />
        
        <View style={styles.cardContainer}>
          <NotificationsController 
            ref='NC' 
            setParentState={this.setStateFrag.bind(this)} 
            delay={ this.PUSH_NOTIFICATION_DELAY }
          />
        </View>
        
        <View style={styles.cpContainer} >
          <ControlPanel 
            notificationsEnabled={this.state.notificationsEnabled} 
            toggleNotifications={this.toggleNotifications.bind(this)} 
            setParentState={this.setStateFrag.bind(this)} 
            panThreshold={this.state.panThreshold}
            maxDataIndex={this.state.maxDataIndex}
            minDataIndex={this.state.minDataIndex}
            curDataIndex={this.state.curDataIndex}
            setDataAtIndex={this.setDataAtIndex.bind(this)}
            displayDataAtIndex={this.displayDataAtIndex.bind(this)}
          />
        </View>

      </View>
      
    );
  }
}