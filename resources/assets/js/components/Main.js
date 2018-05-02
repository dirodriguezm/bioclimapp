import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MapContainer from './MapContainer';

export default class Main extends Component {
  constructor(props) {
    super(props);
  }

  /*componentDidMount() is a lifecycle method
   * that gets called after the component is rendered
   */
  componentDidMount() {

  }

  render() {

      return (
          <div className="container">
              <div className="row justify-content-center">
                  <div className="col-md-8">
                      <div className="card">
                          <div className="card-header">Mapa</div>
                          <div className="card-content">
                            <MapContainer apiKey='AIzaSyAA_ayr9aMRSAPIugacjp_CL6S5ux_N4is'/>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }
}

if (document.getElementById('root')) {
    ReactDOM.render(<Main />, document.getElementById('root'));
}
