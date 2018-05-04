import React, { Component } from 'react';
import {Map, GoogleApiWrapper} from 'google-maps-react';
var SunCalc = require('suncalc');


export class MapContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      currentLocation: this.props.currentLocation,
    }
    this.mapClicked = this.mapClicked.bind(this);
    this.onDragend = this.onDragend.bind(this);
  }

  getGeocode(latLng, _callback){
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location': latLng}, function(results, status){
      if (status === 'OK'){
        if (results[1]){
          _callback(results);
        }
      }
    });
  }

  getElevationOfPoint(latLng, _callback){
    var elevator = new google.maps.ElevationService;
    elevator.getElevationForLocations({
      locations: [latLng]
    }, function(results, status){
      if (status === 'OK'){
        if (results[0]){
          _callback(results[0]);
        }
      }
    });
  }

  getSunPosition(latLng){
    let sun = SunCalc.getPosition(/*Date*/ new Date(), /*Number*/ latLng.lat(), /*Number*/ latLng.lng());
    let altitude = sun.altitude * 180 / Math.PI;
    let azimuth = sun.azimuth * 180 / Math.PI;
    return {
      altitude: altitude,
      azimuth: azimuth
    }
  }

  createMarker(latLng, map, info_content){
    return new google.maps.Marker({
      position: latLng,
      map: map
    });
  }

  createInfoWindow(map, marker, info_content){
    var infowindow = new google.maps.InfoWindow;
    infowindow.setContent(info_content);
    infowindow.open(map, marker);
  }


  mapClicked(mapProps, map, clickEvent){
    this.getElevationOfPoint(clickEvent.latLng, (result) => {
      this.setState({
        currentLocation: {
          lat: clickEvent.latLng.lat(),
          lng: clickEvent.latLng.lng(),
          elevation: result.elevation
        }
      });
    });

    let marker = this.createMarker(clickEvent.latLng,map);
    this.getGeocode(clickEvent.latLng, (results) => {
      this.createInfoWindow(map,marker,results[1].formatted_address);
    });
    //
  }

  onDragend(mapProps, map){
    this.setState({
      currentLocation: {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng()
      }
    });
  }


  render() {
    const style = {
      width: '100px',
      height: '50vh'
    }

    return (
      <div style={style}>
       <Map className="map"
          google={this.props.google}
          onClick={this.mapClicked}
          onDragend={this.onDragend}
          onReady={this.props.onReady}
          initialCenter={this.state.currentLocation}
          center={this.state.currentLocation}
       >

       </Map>
     </div>
    )
  }
}

export default GoogleApiWrapper(
  (props) => ({
    apiKey: props.apiKey,
  }
))(MapContainer)
