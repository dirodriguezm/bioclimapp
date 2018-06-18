import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TabPanel from "./TabPanel";
import GradePanel from "./GradePanel";
import GeoInfoPanel from "./GeoInfoPanel";
import { Container, Row, Col } from 'reactstrap';
var SunCalc = require('suncalc');
export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comuna: "",
      grade: "",
    };
    this.onComunaChanged = this.onComunaChanged.bind(this);
    this.onParedesChanged = this.onParedesChanged.bind(this);
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
  }

  onParedesChanged(paredes){
    console.log("calculando angulos paredes");
    for(let pared of paredes){
      let angulos = this.calcularAngulos(pared.gamma,90);
      console.log(angulos);
      let sun = SunCalc.getPosition(this.hourAngleToDate(angulos.omega),this.state.latitud, this.state.longitud);
      let azimuth = sun.azimuth * 180 / Math.PI;
      console.log("AZIMUTH",azimuth);
      let gammas = this.calcularGammasPared(pared.gamma);
      console.log("Gammas", gammas);
      let omega_mna = this.calcularOmegaPared(angulos.phi, angulos.delta, gammas.gamma1);
      let omega_tde = this.calcularOmegaPared(angulos.phi, angulos.delta, gammas.gamma2);
      console.log("Omega Mañana", omega_mna);
      console.log("Omega Tarde",omega_tde);
      let omegas = this.calcularHoraIncidencia(pared.gamma, angulos.w1, angulos.w2, omega_mna, omega_tde);
      console.log("omegas", omegas);
      let omegasDate = {
        wm: {
          desde: this.hourAngleToDate(omegas.wm[0]),
          hasta: this.hourAngleToDate(omegas.wt[0])
        },
        wt: {
          desde: this.hourAngleToDate(omegas.wm[1]),
          hasta: this.hourAngleToDate(omegas.wt[1])
        }
      }

      let Rb = this.calcularRB(angulos,pared,omegas);
      this.setState({
        omegas:omegasDate,
        rb: Rb
      })
    }

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

  hourAngleToDate(angle){
    let dif = (angle/15)*36e5;
    let solarNoon = SunCalc.getTimes(new Date(), this.state.latitud,this.state.longitud).solarNoon;
    let date = dif + solarNoon.getTime();
    return new Date(date);
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
    let alfa_solar = this.toDegrees( Math.asin(costhetaz) );
    let gamma_solar = this.sign(omega) * Math.abs( this.toDegrees(Math.acos((Math.cos(this.toRadians(thetaz)) * Math.sin(this.toRadians(phi))
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
      alfa_solar: alfa_solar,
      gamma_solar: gamma_solar,
    }
  }

  calcularGammasPared(gamma){
    let gammas = {
      gamma1: 0,
      gamma2: 0
    }
    if(90<gamma && gamma<=180){       // Cuadrante 2
      gammas.gamma1=-270+gamma;
      gammas.gamma2=gamma-90;
    }
    if (-180<gamma && gamma<=-90){ // Cuadrante 1
      gammas.gamma1=gamma+90;
      gammas.gamma2=270+gamma;
    }
    if (0<gamma && gamma<=90){ // Cuadrante 3
      gammas.gamma1=-90+gamma;
      gammas.gamma2=90+gamma;
    }
    if (-90<gamma && gamma<=0){ // Cuadrante 4
      gammas.gamma1=-90+gamma;
      gammas.gamma2=90+gamma;
    }
    return gammas;
  }

  calcularOmegaPared(phi,delta,gamma){
    let dif = 1;
    let omega_m = -180;
    let gamma_m = 0;
    while (Math.abs(dif) > 0.1){
      omega_m += 0.01;
      // let costhetaz = Math.cos(this.toRadians(phi)) * Math.cos(this.toRadians(delta)) * Math.cos(this.toRadians(omega_m))
      //                 + Math.sin(this.toRadians(phi)) * Math.sin(this.toRadians(delta));
      // let thetaz = Math.acos(costhetaz);
      // gamma_m = this.sign(omega_m) * Math.abs( this.toDegrees(Math.acos((Math.cos(this.toRadians(thetaz)) * Math.sin(this.toRadians(phi))
      //               - Math.sin(this.toRadians(delta))) / (Math.sin(this.toRadians(thetaz)) * Math.cos(this.toRadians(phi))))));
      let sun = SunCalc.getPosition(this.hourAngleToDate(omega_m),this.state.latitud, this.state.longitud);
      gamma_m = sun.azimuth * 180 / Math.PI;
      dif = gamma - gamma_m;
    }
    return omega_m;
    //return {omega: omega_m, gamma: gamma_m};
  }

  calcularHoraIncidencia(gamma, w1,w2, omega_m, omega_t){
    let wm = [0,0]; // hora de incidencia en la mañana
    let wt = [0,0]; // hora de incidencia en la tarde
    if( (90 < gamma && gamma <= 180) || (-180 < gamma && gamma <= -90)){
      wm = [Math.max(w1,omega_m)];
      wt = [Math.min(w2,omega_t)];
    }
    else{
      if(omega_m > w1){
        wm[0] = w1;
        wt[0] = omega_m;
      }
      else{
        wm[0]=180;
        wt[0]=180;
      }
      if(omega_t < w2){
        wm[1] = omega_t;
        wt[1] = w2;
      }
      else{
        wm[1] = 180;
        wt[1] = 180;
      }
    }
    return {wm: wm, wt:wt}
  }

  calcularRB(angulos,pared, omegas){
    let a_Rb = [0,0];
    let b_Rb = [0,0];
    let R_ave = [0,0];
    for(let i = 0; i < 2; i++){
      let w1 = omegas.wm[i];
      let w2 = omegas.wt[i];
      a_Rb[i] = ( Math.sin(this.toRadians(angulos.delta)) * Math.sin(this.toRadians(angulos.phi))
                * Math.cos(this.toRadians(90)) - Math.sin(this.toRadians(angulos.delta))
                * Math.cos(this.toRadians(angulos.phi)) * Math.sin(this.toRadians(90))
                * Math.cos(this.toRadians(pared.gamma)) ) * (w2 - w1) * (Math.PI / 180)
                + ( Math.cos(this.toRadians(angulos.delta)) * Math.cos(this.toRadians(angulos.phi))
                * Math.cos(this.toRadians(90)) + Math.cos(this.toRadians(angulos.delta))
                * Math.sin(this.toRadians(angulos.phi)) * Math.sin(this.toRadians(90))
                * Math.cos(this.toRadians(pared.gamma)) ) * (Math.sin(this.toRadians(w2)) - Math.sin(this.toRadians(w1)))
                - Math.cos(this.toRadians(angulos.delta)) * Math.sin(this.toRadians(90))
                * Math.sin(this.toRadians(pared.gamma)) * ( Math.cos(this.toRadians(w2)) - Math.cos(this.toRadians(w1)) );
      b_Rb[i] = Math.cos(this.toRadians(angulos.phi)) * Math.cos(this.toRadians(angulos.delta))
                * ( Math.sin(this.toRadians(w2)) - Math.sin(this.toRadians(w1)) )
                + Math.sin(this.toRadians(angulos.delta)) * Math.sin(this.toRadians(angulos.phi))
                * ( w2 - w1) * (Math.PI/180);
      R_ave[i] = a_Rb[i] / b_Rb[i];
      console.log("a_Rb",a_Rb);
      console.log("b_Rb",b_Rb);
      console.log("R_ave",R_ave);
    }
    if(R_ave[1]){
      return (R_ave[0] + R_ave[1]) / 2;
    }
    else{
      return R_ave[0];
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
              <Col xs="8">
                <TabPanel
                  onComunaChanged={this.onComunaChanged}
                  onParedesChanged={this.onParedesChanged}
                />
              </Col>
              <Col xs="4">
                <Row>
                  <Col xs="5">
                    <GradePanel grade="NOTA"/>
                  </Col>
                </Row>
                <Row>
                  <Col xs="12" >
                    <div ref={(col) => { this.col = col }}>
                      <GeoInfoPanel
                        comuna={this.state.comuna}
                        width={this.state.width}
                        omegas={this.state.omegas}
                        rb={this.state.rb}
                      />
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
