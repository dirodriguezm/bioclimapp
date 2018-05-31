import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TabPanel from "./TabPanel";
import {Grid, Row, Col} from 'react-bootstrap';

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
              <Grid>
                <Row className="show-grid">
                  <Col xs={12} md={8}>
                    <div style={{height:"80vh", width:"50vw"}} ><TabPanel/></div>

                  </Col>
                  <Col xs={6} md={4}>
                    <Row>ACA VA LA NOTA </Row>
                    <Row>ACA VA LA INFO GEOGRAFICA</Row>
                  </Col>
                </Row>
                <Row className="show-grid">
                  <Col xs={12} md={8}>
                    ACA VAN LOS BOTONES DE DIBUJO
                  </Col>
                </Row>
              </Grid>
          </div>
      );
  }
}

if (document.getElementById('root')) {
    ReactDOM.render(<Main />, document.getElementById('root'));
}
