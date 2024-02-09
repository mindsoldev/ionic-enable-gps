import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { Capacitor } from '@capacitor/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HomePage {
  constructor(private locationAccuracy: LocationAccuracy) {}

  async getCurrentLocation() {
    console.log("getPlatform: ", Capacitor.getPlatform());
    const permissions = navigator.permissions.query({ name: "geolocation" });
    console.log("permissions: ", permissions);
    // const result = await this.getPosition();
    // console.log("getposition result: ", result);
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('Permission status: ', permissionStatus.location);
      if(permissionStatus?.location != 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        if(requestStatus.location != 'granted') {
          // go to location settings
          await this.openSettings(true);
          return;
        }
      }

      if(Capacitor.getPlatform() == 'android') {
        this.enableGps();
      }

      let options: PositionOptions = {
        maximumAge: 3000,
        timeout: 10000,
        enableHighAccuracy: true
      };
      const position = await Geolocation.getCurrentPosition(options);
      console.log(position);
    } catch(e: any) {
      if(e?.message == 'Location services are not enabled') {
        await this.openSettings();
      }
      console.log(e);
    }
  }

  openSettings(app = false) {
    console.log('Now open settings...');
    return NativeSettings.open({
      optionAndroid: app ? AndroidSettings.ApplicationDetails : AndroidSettings.Location, 
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices
    });
  }

  async enableGps() {
    const canRequest = await this.locationAccuracy.canRequest();
    console.log('Enable GPS; can request: ', canRequest);
    if(canRequest) {
      await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
    }
  }

  getPosition(): Promise<any>   {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };
    
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {

          resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
        },
        err => {
          reject(err);
        },
        options);
    });
  }

}
