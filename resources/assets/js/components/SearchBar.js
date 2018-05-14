import React, { Component } from 'react';
import Popup from "reactjs-popup";
import MapContainer from './MapContainer';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import {MapControl} from 'react-leaflet';


export default class SearchBar extends MapControl{
  constructor(props){
    super(props);
  }

  createLeafletElement() {
    return GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style:'bar',
      autoComplete: true,
      autoClose:true,
      autoCompleteDelay: 100,
      retainZoomLevel: false,
      searchLabel: 'Ingrese localidad',
      keepResult: true,
      showMarker: false,
      animateZoom: true,
    });
  }

}
