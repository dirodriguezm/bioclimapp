import React, {Component} from 'react';
import {Map, TileLayer, Marker, Popup} from 'react-leaflet';
import SearchBar from './SearchBar';

var SunCalc = require('suncalc');
import axios from 'axios'


export default class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lat: this.props.lat,
            lng: this.props.lng,
            zoom: this.props.zoom,
            markers: this.props.markers,
        };
        this.mapClicked = this.mapClicked.bind(this);
        this.getSunPosition = this.getSunPosition.bind(this);
        this.getSolarTimes = this.getSolarTimes.bind(this);
        this.handleLocationFound = this.handleLocationFound.bind(this);
    }

    componentWillMount(){
        axios.get("http://127.0.0.1:8000/api/comuna/" + this.state.lat + "/" + this.state.lng)
            .then(response => {
                    this.setState({
                        lat: this.state.lat,
                        lng: this.state.lng,
                        comuna: response.data[0],
                        sunPosition: this.getSunPosition(this.state.lat, this.state.lng),
                        sunTimes: this.getSolarTimes(this.state.lat, this.state.lng),

                    });
                    this.createMarker(this.state.lat, this.state.lng);
                    this.props.onComunaChanged(this.state);
                }
            );
    }


    getSunPosition(lat, lng, date = new Date()) {
        let sun = SunCalc.getPosition(/*Date*/ date, /*Number*/ lat, /*Number*/ lng);
        let altitude = sun.altitude * 180 / Math.PI;
        let azimuth = sun.azimuth * 180 / Math.PI;
        return {
            altitude: altitude,
            azimuth: azimuth
        }
    }

    getSolarTimes(lat, lng, date = new Date()) {
        return SunCalc.getTimes(date, lat, lng);
    }

    createMarker(lat, lng) {
        let markers = [];
        markers.push([lat, lng]);
        this.setState({
            markers: markers
        })
    }


    mapClicked(e) {
        this.createMarker(e.latlng.lat, e.latlng.lng);
        axios.get("http://127.0.0.1:8000/api/comuna/" + e.latlng.lat + "/" + e.latlng.lng)
            .then(response => {
                    this.setState({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                        comuna: response.data[0],
                        sunPosition: this.getSunPosition(e.latlng.lat, e.latlng.lng),
                        sunTimes: this.getSolarTimes(e.latlng.lat, e.latlng.lng),

                    });
                    this.props.onComunaChanged(this.state);
                }
            );

    }

    handleLocationFound(e) {
        let lng = parseFloat(e.location.x);
        let lat = parseFloat(e.location.y);
        console.log(lat + "," + lng);
        this.createMarker(lat, lng);
        axios.get("http://127.0.0.1:8000/api/comuna/" + lat + "/" + lng)
            .then(response => {
                    this.setState({
                        lat: lat,
                        lng: lng,
                        comuna: response.data[0],
                        sunPosition: this.getSunPosition(lat, lng),
                        sunTimes: this.getSolarTimes(lat, lng),
                    });
                    this.props.onComunaChanged(this.state);
                }
            );
    }


    render() {
        const position = [this.state.lat, this.state.lng];
        const style = {
            width: '100%',
            height: '35vh'
        }
        return (
            <div>
                <Map
                    center={position}
                    zoom={this.state.zoom}
                    style={style}
                    onDblclick={this.mapClicked}
                    onLocationfound={this.handleLocationFound}
                    onShowlocation={this.handleLocationFound}
                    ref="map"
                    doubleClickZoom={false}
                >
                    <TileLayer
                        attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {this.state.markers.map((position) =>
                            <Marker key={position} position={position}>
                                <Popup>
                                    <span>
                                      {this.state.comuna ? this.state.comuna.nombre : ""}
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
