import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MapContainer from './MapContainer';
import Scene from './World';
import SearchBar from './SearchBar';
import Popup from "reactjs-popup";

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      apiKey: 'AIzaSyAA_ayr9aMRSAPIugacjp_CL6S5ux_N4is',
    };
  }

  /*componentDidMount() is a lifecycle method
   * that gets called after the component is rendered
   */
  componentDidMount() {

  }

  render() {
    const mapStyle = {
      width: '100vh',
      height: '50vh'
    }

      return (
          <div className="container">
              <div>
                <Popup trigger={<button> Mapa</button>} position="right top" contentStyle={mapStyle}>
                  <MapContainer
                    lat={-36.82013519999999}
                    lng={-73.0443904}
                    zoom={15}
                    markers={[]}
                  />
                </Popup>

                  <Scene/>
              </div>
          </div>
      );
  }
}

if (document.getElementById('root')) {
    ReactDOM.render(<Main />, document.getElementById('root'));
}
