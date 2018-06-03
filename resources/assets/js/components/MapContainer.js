import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import SearchBar from './SearchBar';
var SunCalc = require('suncalc');
import axios from 'axios'


export default class MapContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      lat: this.props.lat,
      lng: this.props.lng,
      zoom: this.props.zoom,
      markers: this.props.markers,
    }
    this.mapClicked = this.mapClicked.bind(this);
  }

  getElevationOfPoint(latlng, callback){
    axios.get('https://api.open-elevation.com/api/v1/lookup\?locations\=' + latlng.lat + "," + latlng.lng)
    .then(response => callback(response.data.results));
  }

  getSunPosition(latlng){
    let sun = SunCalc.getPosition(/*Date*/ new Date(), /*Number*/ latlng.lat, /*Number*/ latlng.lng);
    let altitude = sun.altitude * 180 / Math.PI;
    let azimuth = sun.azimuth * 180 / Math.PI;
    return {
      altitude: altitude,
      azimuth: azimuth
    }
  }

  createMarker(lat,lng){
    let markers = this.state.markers;
    markers.push([lat,lng]);
    this.setState({
      markers: markers
    })
  }

  createInfoWindow(map, marker, info_content){

  }


  mapClicked(e){
    // this.getElevationOfPoint(e.latlng, results => {
    //
    // });

    axios.get("http://127.0.0.1:8000/api/comuna/" + e.latlng.lat + "/" + e.latlng.lng)
    .then(response => {
        this.setState({
          // lat: e.latlng.lat,
          // lng: e.latlng.lng,
          comuna: response.data[0]
          //elevation: results[0].elevation
        });
        this.props.onComunaChanged(response.data[0]);
      }
    );
  }


  render() {
    const position = [this.state.lat, this.state.lng];
    const style = {
      width: '100%',
      height: '50vh'
    }
    return (
      <div>
        <Map
          center={position}
          zoom={this.state.zoom}
          style={style}
          onDblclick={this.mapClicked}
          onLocationFound={this.handleLocationFound}
          ref="map"
          doubleClickZoom={false}
        >
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {this.state.markers.map((position) =>
            <Marker position={position}>
              <Popup>
                <span>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </span>
              </Popup>
            </Marker>
          )}
          <SearchBar/>
        </Map>


      </div>
    )
  }
}
