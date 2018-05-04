import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MapContainer from './MapContainer';
import Scene from './World';
import SearchBar from './SearchBar';

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

      return (
          <div className="container">
              <div>
                  <SearchBar
                    apiKey={this.state.apiKey}
                  />
                  <Scene/>
              </div>
          </div>
      );
  }
}

if (document.getElementById('root')) {
    ReactDOM.render(<Main />, document.getElementById('root'));
}
