import React, { Component }     from 'react';
import {
  SwitchIOS,
  View,
  Text,
  StyleSheet,
  Platform,
  Switch,
  SliderIOS,
  PickerIOS,
  PickerItemIOS,
} from 'react-native';

import styles                   from './assets/styles/styles';
import Button                   from './Button';
import SliderJS                 from 'react-native-slider';

export default class ControlPanel extends Component {

  constructor(props) {
    super(props);

    this.ctlNotifications = {
      enableText    : 'Notifications On',
      disableText   : 'Notifications Off',
    }

    this.state = {
      curIndex                  : props.curIndex,
      toggleNotificationsText   : '',
      notificationsEnabled      : ( props.notificationsEnabled || props.notificationsEnabled === 'true' ) ? true : false,
    }

    this.toggleNotifications = this.toggleNotifications.bind(this);
  }
  
  setParentState(args){
    this.props.setParentState(args)
  }

  toggleNotifications() {
    this.props.toggleNotifications();
  }

  setNotificationsText( btnText ) {
    var text = '';

    if( typeof btnText === 'undefined' ) {
      text = ( this.props.notificationsEnabled === true ) ? this.ctlNotifications.enableText : this.ctlNotifications.disableText;
    }
    else {
      text = btnText;
    }
    
    this.setState({ toggleNotificationsText : text });
  }

  componentDidMount() {
    this.setState(
      { notificationsEnabled : ( this.props.notificationsEnabled || this.props.notificationsEnabled === 'true' ) ? true : false },
      this.setNotificationsText  
    );
  }

  componentDidUpdate() {

  }

  componentWillReceiveProps(nextProps) { 
    this.setState( nextProps, this.setNotificationsText );
  }

  render() {

    return (
      <View style={styles.controlPanel}>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{this.state.toggleNotificationsText}</Text>
          <Switch
            onValueChange={this.toggleNotifications}
            style={styles.rowInput}
            disabled={this.props.drawerType === 'overlay'}
            value={this.state.notificationsEnabled} />
        </View>
                        
        <View style={[styles.row, styles.sliderContainer]}>
            <Text style={[styles.rowLabel, styles.sliderLabel]}>Book Index</Text>
            <SliderJS
                style={styles.slider}
                thumbStyle={sliderStyles.thumb}
                minimumTrackTintColor={minimumTrackTintColor}
                maximumTrackTintColor={maximumTrackTintColor}
                thumbTintColor={thumbTintColor}
                maximumValue={this.props.maxDataIndex}
                minimumValue={this.props.minDataIndex}
                value={this.props.curDataIndex}
                step={1}
                onSlidingComplete={ (value) => {
                    this.setState({curDataIndex : parseInt( value ) });
                    this.props.setDataAtIndex( parseInt( value ), false );
                }}
                onValueChange={ (value) => {
                  var self = this;

                  // setTimeout( function() {
                    self.setState({curDataIndex : parseInt( value ) });
                    self.props.displayDataAtIndex( parseInt( value ) );
                  // }, 500 );
                }}
              />
            <Text style={styles.sliderMetric}> {parseInt( this.state.curDataIndex ) + 1 }</Text>
        </View>

      </View>
    )
  }
}


// Shadow props are not supported in React-Native Android apps.
// The below part handles this issue.

// iOS Styles
var iosStyles = StyleSheet.create({
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {width: 3, height: 5},
    shadowRadius: 5,
    shadowOpacity: 0.75,
  }
});

const iosMinTrTintColor = '#1073ff';
const iosMaxTrTintColor = '#b7b7b7';
const iosThumbTintColor = '#343434';

// Android styles
const androidStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 4 / 2,
  },
  thumb: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
  },
  touchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugThumbTouchArea: {
    position: 'absolute',
    backgroundColor: 'green',
    opacity: 0.5,
  }
});

const androidMinTrTintColor = '#26A69A';
const androidMaxTrTintColor = '#d3d3d3';
const androidThumbTintColor = '#009688';


const sliderStyles = (Platform.OS === 'ios') ? iosStyles : androidStyles;
const minimumTrackTintColor = (Platform.OS === 'ios') ? iosMinTrTintColor : androidMinTrTintColor;
const maximumTrackTintColor = (Platform.OS === 'ios') ? iosMaxTrTintColor : androidMaxTrTintColor;
const thumbTintColor = (Platform.OS === 'ios') ? iosThumbTintColor : androidThumbTintColor;
