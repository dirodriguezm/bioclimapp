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
        this.getSunPath = this.getSunPath.bind(this);
    }

    componentDidUpdate(prevProps){
        if(this.props.fecha != prevProps.fecha){
            this.setState((state) => ({sunPosition: this.getSunPosition(state.lat,state.lng,this.props.fecha)}), () => {this.props.onComunaChanged(this.state)});
        }
    }

    componentWillMount(){
        let comuna, sunPosition, sunPath;
        axios.get("http://bioclimatic.inf.udec.cl/api/comuna/" + this.state.lat + "/" + this.state.lng)
            .then(response => {
                comuna = response.data[0];
                sunPosition = this.getSunPosition(this.state.lat,this.state.lng);
                sunPath = this.getSunPath(this.state.lat,this.state.lng);
                    this.setState({
                        comuna:comuna,
                        sunPosition: sunPosition,
                        sunPath:sunPath
                    }, () => {
                        this.createMarker(this.state.lat, this.state.lng);
                        this.props.onComunaChanged(this.state);
                    });
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

    getSunPath(lat, lng){
        let sunPath = [];
        let now = new Date();
        let start = new Date(now.getFullYear(),0,0)
        let invierno = new Date(now.getFullYear(),5,21);
        let verano = new Date(now.getFullYear(),11,21);
        let diff_invierno = (invierno - start) + ((start.getTimezoneOffset() - invierno.getTimezoneOffset()) * 60 * 1000);
        let diff_verano = (verano - start) + ((start.getTimezoneOffset() - verano.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        let day_invierno = Math.floor(diff_invierno / oneDay);
        let day_verano = Math.floor(diff_verano / oneDay);
        for(let i = day_invierno; i < day_verano; i++){
            let daySunPath = [];
            for(let j = 0; j < 24; j++){
                let date = this.dateFromDay(now.getFullYear(),i);
                let dateWithTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), j);
                let sunPosition = this.getSunPosition(lat, lng, dateWithTime);
                daySunPath.push(sunPosition);
            }
            sunPath.push(daySunPath);
        }
        return sunPath;
    }

    dateFromDay(year, day){
        let date = new Date(year, 0); // initialize a date in `year-01-01`
        return new Date(date.setDate(day)); // add the number of days
    }

    getSolarTimes(lat, lng) {
        let now = new Date().getFullYear();
        let sunTimes=[];
        for(let date = new Date(now,0,1); date <= new Date(now,11,31); date.setDate(date.getDate()+1)){
            sunTimes.push(SunCalc.getTimes(date,lat,lng));
        }
        return sunTimes;
    }

    createMarker(lat, lng) {
        let markers = [];
        markers.push([lat, lng]);
        this.setState({
            markers: markers
        });
    }


    mapClicked(e) {
        this.props.setLoading(false);
        axios.get("http://bioclimatic.inf.udec.cl/api/comuna/" + e.latlng.lat + "/" + e.latlng.lng)
            .then(response => {
                    if(response.data.length > 0) {
                        this.createMarker(e.latlng.lat, e.latlng.lng);
                        this.setState({
                            lat: e.latlng.lat,
                            lng: e.latlng.lng,
                            comuna: response.data[0],
                            sunPosition: this.getSunPosition(e.latlng.lat, e.latlng.lng),
                            sunPath: this.getSunPath(e.latlng.lat, e.latlng.lng),
                        }, function () {
                            this.props.onComunaChanged(this.state);
                        });
                    }
                    else{
                        this.props.setLoading(true);
                        alert("No se encuentra comuna en la base de datos");
                    }
                }
            );

    }

    handleLocationFound(e) {
        let lng = parseFloat(e.location.x);
        let lat = parseFloat(e.location.y);
        //
        this.createMarker(lat, lng);
        axios.get("http://bioclimatic.inf.udec.cl/api/comuna/" + lat + "/" + lng)
            .then(response => {
                    this.setState({
                        lat: lat,
                        lng: lng,
                        comuna: response.data[0],
                        sunPosition: this.getSunPosition(lat, lng),
                        sunPath: this.getSunPath(e.latlng.lat, e.latlng.lng),
                    },function () {
                        this.createMarker(this.state.lat, this.state.lng);
                        this.props.onComunaChanged(this.state);
                    });
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
                    //onLocationfound={this.handleLocationFound}
                    //onShowlocation={this.handleLocationFound}
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
