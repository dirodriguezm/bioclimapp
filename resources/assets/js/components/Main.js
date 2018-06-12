import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TabPanel from "./TabPanel";
import GradePanel from "./GradePanel";
import GeoInfoPanel from "./GeoInfoPanel";
import { Container, Row, Col } from 'reactstrap';

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comuna: "",
      grade: "",
    };
    this.onComunaChanged = this.onComunaChanged.bind(this);
  }

  /*componentDidMount() is a lifecycle method
   * that gets called after the component is rendered
   */
  componentDidMount() {
    this.setState({
      width: this.col.clientWidth
    });
    console.log(this.col);
  }

  onComunaChanged(mapState){
    this.setState({
      comuna: mapState.comuna,
      latitud: mapState.lat,
      longitud: mapState.lng,
      sunTimes: mapState.sunTimes,
      sunPosition: mapState.sunPosition,
    });
    let angulos = this.calcularAngulos(0,90);
    console.log("sun azimuth", this.state.sunPosition.azimuth);
    console.log("calculated azimuth", angulos.gammas);
    //console.log("solar noon",mapState.sunTimes.solarNoon.getHours() + ":" + mapState.sunTimes.solarNoon.getMinutes());
  }
  onGradeChanged(grade){
    this.setState({
      grade: grade
    });
  }

  getDayOfYear(date){
    var now = date;
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    return day;

  }

  getHourAngle(date){
    let dif = date - this.state.sunTimes.solarNoon;
    return (dif/36e5) * 15;
  }

  sign(x){
    if(x > 0) return 1;
    if(x < 0) return -1;
    if(x == 0) return 0;
  }

  calcularAngulos(gamma, beta){
    let date = new Date();
    let phi = this.state.latitud;
    let omega = this.getHourAngle(date);
    let delta = 23.45 * Math.sin(this.toRadians(360*(284+this.getDayOfYear(date))/365));
    let w2 = this.toDegrees( Math.acos(-Math.tan(this.toRadians(phi)) * Math.tan(this.toRadians(delta))) );
    let w1 = -w2;
    let theta = this.toDegrees( Math.acos( Math.sin(this.toRadians(delta)) * Math.sin(this.toRadians(phi)) * Math.cos(this.toRadians(beta))
                           - Math.sin(this.toRadians(delta)) * Math.cos(this.toRadians(phi)) * Math.sin(this.toRadians(beta)) * Math.cos(this.toRadians(gamma))
                           + Math.cos(this.toRadians(delta)) * Math.cos(this.toRadians(phi)) * Math.cos(this.toRadians(beta)) * Math.cos(this.toRadians(omega))
                           + Math.cos(this.toRadians(delta)) * Math.sin(this.toRadians(phi)) * Math.sin(this.toRadians(beta)) * Math.cos(this.toRadians(gamma)) * Math.cos(this.toRadians(omega))
                           + Math.cos(this.toRadians(delta)) * Math.sin(this.toRadians(beta)) * Math.sin(this.toRadians(gamma)) * Math.sin(this.toRadians(omega))));
    let costhetaz = Math.cos(this.toRadians(phi)) * Math.cos(this.toRadians(delta)) * Math.cos(this.toRadians(omega))
                    + Math.sin(this.toRadians(phi)) * Math.sin(this.toRadians(delta));
    let thetaz = this.toDegrees(Math.acos(costhetaz));
    let alfas = this.toDegrees( Math.asin(costhetaz) );
    let gammas = this.sign(omega) * Math.abs( this.toDegrees(Math.acos((Math.cos(this.toRadians(thetaz)) * Math.sin(this.toRadians(phi))
                  - Math.sin(this.toRadians(delta))) / (Math.sin(this.toRadians(thetaz)) * Math.cos(this.toRadians(phi))))));
    return {
      date: date,
      phi: phi,
      omega: omega,
      delta: delta,
      w2: w2,
      w1: w1,
      theta: theta,
      costhetaz: costhetaz,
      alfas: alfas,
      gammas: gammas,
    }
  }

  toRadians(angle){
    return angle * (Math.PI/180);
  }

  toDegrees(angle){
    return angle * (180 / Math.PI);
  }

  render() {

      return (
          <Container fluid>
            <Row >
              <Col xs="8"><TabPanel onComunaChanged={this.onComunaChanged}/></Col>
              <Col xs="4">
                <Row>
                  <Col xs="5">
                    <GradePanel grade="NOTA"/>
                  </Col>
                </Row>
                <Row>
                  <Col xs="12" >
                    <div ref={(col) => { this.col = col }}>
                      <GeoInfoPanel comuna={this.state.comuna} width={this.state.width}/>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col xs="8">
                PANEL HERRAMIENTAS
              </Col>
            </Row>
          </Container>
      );
  }
}

if (document.getElementById('root')) {
    ReactDOM.render(<Main />, document.getElementById('root'));
}
