import { 
  Linking,
  AppState, 
  Platform,
  AsyncStorage
}                               from 'react-native';
import React, { Component }     from 'react';
import App                      from './index';
import X2JS                     from 'x2js';
import Crypto                   from 'crypto-js';
import AppData                  from './assets/AppData';
import Credentials              from './config/Credentials';

export default class DataController extends Component {

  constructor(props) {
    super(props);

    // Function binding
    this.getCurrentDataIndex = this.getCurrentDataIndex.bind(this);
    this.getItemDetailAWS = this.getItemDetailAWS.bind(this);
    this.getAWSRequestURL = this.getAWSRequestURL.bind(this);
    this.resetCurrentDataIndex = this.resetCurrentDataIndex.bind(this);
    this.getDataIndexForDisplay = this.getDataIndexForDisplay.bind(this);
    this.setDataIndexForDisplay = this.setDataIndexForDisplay.bind(this);

    // Amazon API props
    this.AWS = {
      SEARCH_URL   : Credentials.SEARCH_URL,
      ASSOC_KEY    : Credentials.ASSOC_KEY,
      API_KEY      : Credentials.API_KEY,
      API_SECRET   : Credentials.API_SECRET,
    }

    // Async storage keysd
    this.STORAGE_KEYS = {
      TIME              : '@notificationTime:key',
      STATE             : '@notificationState:key',
      ITEMS             : '@notificationItems:key',
      CUR_ITEM_INDEX    : '@notificationCurIndex:key',
      DISP_ITEM_INDEX   : '@notificationDispIndex:key',
    }

    // The raw data
    this.AppData = AppData;
  }

  /*
   * Determine what data index to use for 
   * next upcoming notification
   */
  async getDataIndexForDisplay() {
    let idx = await AsyncStorage.getItem( this.STORAGE_KEYS.DISP_ITEM_INDEX );

    return ( idx === null || typeof idx === 'undefined' ) ? '0' : idx;
  }

  async setDataIndexForDisplay( idx ) {

    //  Reset the index to 0 if necessary, 
    //  otherwise save for later
    idx = parseInt( idx );
    idx = ( isNaN( idx ) || idx === null || typeof idx === 'undefined' ) ? '0' : idx;

    AsyncStorage.setItem( this.STORAGE_KEYS.DISP_ITEM_INDEX, String( idx ) ); 
  }

  /**
   * Try to hit Amazon Affiliate API (XML-based)
   * for detail about this item, among other things
   * build a deep link URL. 
   * 
   * ATM, only deep links to amazon shopping app
   * are supported. 
   *
   * If deep linking to content isn't possible, 
   * build a amazon web URL with search terms embedded
   * 
   * @param  {object} params - params from which to build link/deep-link
   * @return {object} params - same object but with additional metadata
   */
  async getItemDetailAWS( params ) {

    // Init the return object
    params.itemUrl   = '';
    params.imageUrl  = '';
    params.asin      = '';
    
    if( typeof params.index !== 'undefined' && params.index !== null ) {
      let author = params.author;
      let title = params.title;
            
      // Get a signed URL request to fetch item details
      let requestURL = this.getAWSRequestURL( author, title );
      let response = await fetch( requestURL );
      
      // Will output an xml string
      let xmlText = await response.text(); 

      /*
       * Parse the xml resonse and see if there's 
       * actual data to embed in the params object
       */
      if( xmlText ) {

        // Parse it
        var x2js = new X2JS();
        var doc = x2js.xml2js( xmlText ).ItemSearchResponse; 
        
        // See how many search results we have if any  
        var items = ( typeof doc !== 'undefined' && typeof doc.Items !== 'undefined' && typeof doc.Items.Item !== 'undefined' ) ? doc.Items.Item : [];
        var length = items.length;

        // For now, we'll return data from the first result
        for( var i = 0; i < length; i++ ) {
          var item = items[i];
          var itemAuthor = item.ItemAttributes.Author[0];
          var itemTitle = item.ItemAttributes.Title;
          
          params.itemUrl = item.DetailPageURL;
          params.imageUrl = item.LargeImage.URL;
          params.asin = item.ASIN;

          /*
           * Rebuild the detail URL as a deep-link and 
           * test to see if it can be opened
           */
          params.itemUrl = 'com.amazon.mobile.shopping.web' + item.DetailPageURL.replace( 'https', '' );
          App._log( 'Using deep link: ' + params.itemUrl );

          // Let's exit the loooooop  
          i = length;
        }
      }
      
      /*
       * Create a more specific link using the ASIN
       */
      if ( params.itemUrl.length > 0 ) {
        let supported = await Linking.canOpenURL( params.itemUrl );

        if( ! supported ) {
          params.itemUrl = 'https://www.amazon.com/gp/mas/dl/android?asin=' + params.asin;
          App._log( 'Can\'t use deep link, so using url: ' + params.itemUrl );
        } 
      }
      
      /*
       * The search terms didn't return data from
       * the API, so lets create a more general 
       * URL with search terms embedded in query string
       */
      else if( params.itemUrl.length === 0 ) {
        params.itemUrl = this.setSearchUrl( title, author );
        App._log( 'Had to use a generic search url: ' + params.itemUrl );
      }

      return params;
    }
  }

  setSearchUrl( title, author ) {
    return this.AWS.SEARCH_URL + encodeURIComponent( title ) + encodeURIComponent( ' by ' ) + encodeURIComponent( author );
  }

  getAWSRequestURL( author, title ) {

    let title_encoded = encodeURIComponent( title );
    let author_encoded = encodeURIComponent( author );
    let timestamp = this.getTimestamp();
    let params = 'AWSAccessKeyId=' + this.AWS.API_KEY + '&AssociateTag=' + this.AWS.ASSOC_KEY + '&Author=' + author_encoded + '&Keywords=' + title_encoded + '&Operation=ItemSearch&ResponseGroup=' + encodeURIComponent( 'Images,ItemAttributes' ) + '&SearchIndex=Books&Service=AWSECommerceService&Timestamp=' + encodeURIComponent( timestamp );

    let request = this.signedRequest( params );

    return request;
  }

  signedRequest( params ) {
    let protocol = 'http://';
    let base = 'webservices.amazon.com';
    let uri = '/onca/xml';

    let prefix = "GET\n" +
    base + "\n" +
    uri + "\n";

    let str = prefix + params;
    
    let sig = Crypto.HmacSHA256( str, this.AWS.API_SECRET );

    sig = sig.toString( Crypto.enc.Base64 );

    sig = encodeURIComponent( sig );

    let request = protocol + base + uri + '?' + params + '&Signature=' + sig;

    return request;
  }

  getTimestamp() {
    let now = new Date();
    return now.toISOString();
  }

  getIndexData( idx ) {
    let index  = this.AppData[ "data" ][ idx ][ "idx" ];
    let author    = this.AppData[ "data" ][ idx ][ "author" ];
    let title     = this.AppData[ "data" ][ idx ][ "title" ];

    return { index : index, title : title, author : author };
  }

  getDataProps() {
    return { length : this.AppData['data'].length };
  }

  async getCurrentDataIndex() {
   let idx = await AsyncStorage.getItem( this.STORAGE_KEYS.CUR_ITEM_INDEX );

   return ( idx === null || typeof idx === 'undefined' ) ? '0' : idx;
  }

  async incrementDataIndex() {
    let idx = await this.getCurrentDataIndex();
    idx = parseInt( idx ) + 1;

    this.setCurrentDataIndex( String( idx ) );
  }

  /**
   * Set the current index for the data to retrieve,
   * but also make sure its a safe index to use
   * 
   * @param {string} idx - the index into our data store
   */
  async setCurrentDataIndex( idx ) {

    // Number of items total in our data store
    let cnt = this.AppData[ 'data' ].length;

    //  Reset the index to 0 if necessary, 
    //  otherwise save for later
    idx = parseInt( idx );
    idx = ( isNaN( idx ) || idx === null || idx === cnt - 1 || idx >= cnt ) ? '0' : idx;
    
    AsyncStorage.setItem( this.STORAGE_KEYS.CUR_ITEM_INDEX, String( idx ) ); 
  }

  /*
   * 
   */
  async resetCurrentDataIndex( dataIndex ) {

    dataIndex = ( dataIndex === null || typeof dataIndex === 'object' ) ? 0 : dataIndex;

    App._log( 'resetting data index to ' + dataIndex );

    await AsyncStorage.setItem( this.STORAGE_KEYS.CUR_ITEM_INDEX, String( dataIndex ) );
  }

  componentDidMount() {
  }

  handleAppStateChange( appState ) {
  }

  render() {
    return null;
  }
}