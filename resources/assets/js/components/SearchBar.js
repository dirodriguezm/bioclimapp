import React, { Component } from 'react';
import {Map, GoogleApiWrapper} from 'google-maps-react';
import Popup from "reactjs-popup";
import MapContainer from './MapContainer';


export default class SearchBar extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      currentLocation: {
        lat: '-36.82013519999999',
        lng: '-73.0443904',
      }
    }
    this.onMapReady = this.onMapReady.bind(this);
  }


  onSubmit(e) {
    e.preventDefault();
  }

  onMapReady(mapProps, map){
    const google = mapProps.google;

    if (!google || !map) return;

    const autocomplete = new google.maps.places.Autocomplete(this.autocomplete);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) return;

      if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
      else {
        map.setCenter(place.geometry.location);
        map.setZoom(20);
      }

      this.setState({ currentLocation: place.geometry.location });
    });
  }

  render() {
    var mapa =
      <MapContainer
        apiKey={this.props.apiKey}
        onReady={this.onMapReady}
        currentLocation={this.state.currentLocation}
      />;
    var form =
      <form onSubmit={this.onSubmit}>
        <input
          style={{width: '100%'}}
          placeholder="Ingrese localidad"
          ref={ref => (this.autocomplete = ref)}
          type="text"
        />
        <input className='button' type="submit" value="Go" type='hidden'  />
      </form>

    return (
      <Popup
        trigger={form}
        on="click"
        position="bottom center"
        closeOnDocumentClick
        contentStyle={{width:'100%'}}
        overlayStyle={{width:'80%'}}
      >
        {mapa}
      </Popup>

    )
  }
}
