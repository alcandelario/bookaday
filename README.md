<snippet>
  <content><![CDATA[
# ${1:Book-a-Day}

A React Native app that displays a suggested book to read as part of a Book A Day challenge. Integrates Amazon Affiliates API to retrieve related book information, images, links, etc.

## Installation

After cloning the repo, create a file called Credentials.json in ./app/config. The following parameters are required:

```
{
  "SEARCH_URL"   : "https://www.amazon.com/s/?field-keywords=",
  "ASSOC_KEY"    : "Your Amazon Associates Key",
  "API_KEY"      : "Your Amazon Product Advertising API KEY",
  "API_SECRET"   : "Your Amazon Product Advertising API SECRET"
}
```

View the "[Running on Device](https://facebook.github.io/react-native/docs/running-on-device.html)" instructions in RN documentation

## Issues

Due to RN version, you may get a "Strict Mode" error when loading on a device. To Fix:

open node_modules\react-native\Libraries\Core\InitializeCore.js line 112
change function handleError(e, isFatal) to var handleError = function(e, isFatal)
then do npm start -- --reset-cache

## Usage

Use the toggle switch to enable/disable notifications.

The app will then create a new push notification roughly once a day (not exact as the background process that schedules notifications has a 15 minute resolution)

Using the slider you can browse the list of books, but if you leave the slider there, new book notifications will continue from that point onward.

Clicking the "Find on Amazon" link to either be deep-linked into the Amazon Shopping App, or to Amazon's website if the appropriate data could not be retrieved to get the deep link from the Amazon Associates API.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

TODO: Write history

## Credits

TODO: Write credits

## License

The MIT License (MIT)

Copyright (c) 2017 Al Candelario, <a.candelario@gmail.com>
]]></content>
  <tabTrigger>readme</tabTrigger>
</snippet>