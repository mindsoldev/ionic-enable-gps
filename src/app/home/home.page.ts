import { Component } from '@angular/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor() {}
  // constructor(private locationAccuracy: LocationAccuracy) {}

  async getCurrentLocation() {
    try {
      console.log('Before checkPermissions');
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('Permission status 1: ', permissionStatus.location);
      if (permissionStatus?.location != 'granted') {
        console.log('Before requestPermissions');
        const requestStatus = await Geolocation.requestPermissions();
        console.log('remission status 2: ', requestStatus.location);
        if (requestStatus.location != 'granted') {
          // go to location settings
          await this.openSettings(true);
          return; 
        }
      }

      // if (Capacitor.getPlatform() == 'android') {
      //   this.enableGps();
      // }

      let options: PositionOptions = {
        maximumAge: 3000,
        timeout: 10000,
        enableHighAccuracy: true
      };
      const position = await Geolocation.getCurrentPosition();
      console.log(position);
    } catch (e: any) {
      if(e?.message == 'Location services are not enabled') {
        await this.openSettings();
      }
      console.log(e);
      throw(e);
    }
  }

  openSettings(app = false) {
    console.log('open settings; aopp: ', app);
    return NativeSettings.open({
      optionAndroid: app ? AndroidSettings.ApplicationDetails : AndroidSettings.Location, 
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices 
    });
  }

  // async enableGps() {
  //   const canRequest = await this.locationAccuracy.canRequest();
  //   if(canRequest) {
  //     await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
  //   }
  // }
  
}
