import React, { Component } from 'react';
import {Map, GoogleApiWrapper} from 'google-maps-react';
var SunCalc = require('suncalc');


export class MapContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      currentLocation: {
        lat: '-36.82013519999999',
        lng: '-73.0443904',
        elevation: -1
      }
    }
    this.mapClicked = this.mapClicked.bind(this);
    this.onDragend = this.onDragend.bind(this);
    this.onMapReady = this.onMapReady.bind(this);
  }

  getGeocode(latLng, _callback){
    var geocoder = new google.maps.Geocoder;
    var res = "hola";
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
          elevation: result.elevationgi
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

  onMapReady(mapProps, map){
    const google = this.props.google;

    if (!google || !map) return;

    const autocomplete = new google.maps.places.Autocomplete(this.autocomplete);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) return;

      if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
      else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

      this.setState({ currentLocation: place.geometry.location });
    });
  }

  onSubmit(e) {
    e.preventDefault();
  }

  render() {
    const style = {
      width: '100vw',
      height: '50vh'
    }

    return (
      <div>
        <div>
          <form onSubmit={this.onSubmit}>
            <input
              placeholder="Ingrese localidad"
              ref={ref => (this.autocomplete = ref)}
              type="text"
            />

            <input className='button' type="submit" value="Go" type='hidden'  />
          </form>
        </div>
        <div style={style}>
         <Map className="map"
            google={this.props.google}
            onClick={this.mapClicked}
            onDragend={this.onDragend}
            onReady={this.onMapReady}
            initialCenter={this.state.currentLocation}
            center={this.state.currentLocation}
         />
       </div>
     </div>
    )
  }
}

export default GoogleApiWrapper(
  (props) => ({
    apiKey: props.apiKey,
  }
))(MapContainer)
