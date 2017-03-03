<snippet>
  <content><![CDATA[
# ${1:Book-a-Day}

A simple RN app that displays a suggested book to read as part of a Book A Day challenge. Integrates Amazon Affiliates API to retrieve related book information, images, links, etc.

## Installation

View the "[Running on Device](https://facebook.github.io/react-native/docs/running-on-device.html)" instructions in RN documentation

## Issues

Due to project being renamed, npm cache issues seem to cause Red Screen of death that didn't exist on original project. To Fix:

open node_modules\react-native\Libraries\Core\InitializeCore.js line 112
change function handleError(e, isFatal) to var handleError = function(e, isFatal)
then do npm start -- --reset-cache

## Usage

Click the "Start the Notifications" button to toggle on/off push notifications.
The app will then create a new push notification roughly once a day (not exact as the background process that schedules notifications has a 15 minute resolution)

Clicking on the title of the book will either open the Amazon shopping app (if installed, of course), or open the amazon website with search terms for the book if no matching book data could be retrieved from the Amazon Associates API.

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