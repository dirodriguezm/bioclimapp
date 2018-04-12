import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

export default class Example extends Component {
<<<<<<< HEAD
  constructor() {
    super();
    //Initialize the state in the constructor
    this.state = {
        materiales: [],
    }
  }
=======
    render() {
        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">Example Component</div>
>>>>>>> cb5305db21eb9df4abceeb95a571828eef627ad0

  /*componentDidMount() is a lifecycle method
   * that gets called after the component is rendered
   */
  componentDidMount() {
    /* fetch API in action */
    fetch('/api/materiales')
        .then(response => {
            return response.json();
        })
        .then(materiales => {
            //Fetched product is stored in the state
            this.setState({ materiales });
        });
  }

  renderProducts() {
    return this.state.materiales.map(material => {
        return (
            /* When using list you need to specify a key
             * attribute that is unique for each list item
            */
            <li key={material.id} >
                { material.nombre }
            </li>
        );
    })
  }



  render() {
    const MyMapComponent = withScriptjs(withGoogleMap((props) =>
      <GoogleMap
        defaultZoom={15}
        defaultCenter={{ lat: -36.82013519999999, lng: -73.0443904 }}
      >
        {props.isMarkerShown && <Marker position={{ lat: -36.82013519999999, lng: -73.0443904 }} />}
      </GoogleMap>
    ))
      return (
          <div className="container">
              <div className="row justify-content-center">
                  <div className="col-md-8">
                      <div className="card">
                          <div className="card-header">Lista de materiales</div>
                      </div>
                      <MyMapComponent
                        isMarkerShown
                        googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `400px` }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                      />
                  </div>
              </div>
          </div>
      );
  }
}

if (document.getElementById('example')) {
    ReactDOM.render(<Example />, document.getElementById('example'));
}
