package com.bookaday;

import com.pilloxa.backgroundjob.BackgroundJobPackage;
import com.facebook.react.ReactActivity;
import android.util.Log;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
      Log.w( "Main Activity", " getMainComponentName" );
        return "bookaday";
    }
}
