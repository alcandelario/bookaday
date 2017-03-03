import { 
  View, 
  Text, 
  TouchableHighlight, 
  Image,
  Linking,
  ScrollView,
}                               from 'react-native';
import React, { Component }     from 'react';
import styles                   from './assets/styles/styles';
import App                      from './index';

export default class DisplayItem extends Component {
  
  constructor( props ) { 
    
    super(props);

    this.state = {
      style             : props.style,
      content           : props.content,
      itemUrl           : props.itemUrl,
      title             : props.title,
      subtitle          : props.subtitle,
      isFirstEnable     : props.isFirstEnable,
    };
  }

  componentDidMount() {
    
    this.setState({
      content   : this.props.content,
      style     : this.props.style,
      itemUrl   : this.props.itemUrl,
    });
  }

  displayLink() {

    if( this.props.itemUrl.length > 0 ) {
      return ( 
        <TouchableHighlight 
          style={styles.cardLinkBtn} 
          onPress={ () => Linking.openURL( this.props.itemUrl ) } 
        >
          <Text style={styles.cardLink}>Find on Amazon</Text> 
        </TouchableHighlight>
      );
    }
    else if( this.props.isEnabled !== 'true' && this.props.itemUrl.length === 0 && this.props.isFirstEnable === false ) {
      // && this.props.isFirstEnable === false 
      return ( <Text style={{fontSize:18, textAlign: 'center', color:'red'}}>Turn notifications on first to see the current book of the day, or select a new book using the slider below</Text> );
    }
  }

  render() {
      
    return (  
      <View style={ [ styles.displayItemContainer ] }>
        <View style={styles.displayItem}>
          <Text style={styles.cardSubtitle}>{ this.props.subtitle }</Text> 
            <Text style={styles.cardTitle}>{ this.props.title }</Text>
            { this.displayLink() }
        </View>
      </View>
    );
  }
}