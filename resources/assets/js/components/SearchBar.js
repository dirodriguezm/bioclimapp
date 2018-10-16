import React, { Component } from 'react';
import Popup from "reactjs-popup";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import {MapControl} from 'react-leaflet';


class ChileProvider{
    getComunas(){

    }
    async search({ getComunas }) {
        return [{
            x: Number,                      // lon
            y: Number,                      // lat
            label: String,                  // formatted address
            bounds: [
                [Number, Number],             // s, w - lat, lon
                [Number, Number],             // n, e - lat, lon
            ],
        }]
    }
}

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
