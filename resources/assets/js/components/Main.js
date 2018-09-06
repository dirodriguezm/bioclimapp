import React, {Component} from 'react';
import TabPanel from "./TabPanel";
import GeoInfoPanel from "./GeoInfoPanel";
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import MapContainer from './MapContainer';
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';

var SunCalc = require('suncalc');

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
});

class Main extends Component {
    constructor(props) {
        super(props);
        // this.classes = this.props;
        this.state = {
            comuna: "",
            grade: "",
            sunPosition: null,
        };
        this.onComunaChanged = this.onComunaChanged.bind(this);
        this.onParedesChanged = this.onParedesChanged.bind(this);
        this.onRadiationsChanged = this.onRadiationsChanged.bind(this);
    }

    /*componentDidMount() is a lifecycle method
     * that gets called after the component is rendered
     */
    componentDidMount() {
        this.setState({
            width: this.col.clientWidth
        });
        //console.log(this.col);
    }


    onComunaChanged(mapState) {
        this.setState({
            comuna: mapState.comuna,
            latitud: mapState.lat,
            longitud: mapState.lng,
            sunTimes: mapState.sunTimes,
            sunPosition: mapState.sunPosition,
        });
    }

    onParedesChanged(paredes) {
        console.log("calculando angulos paredes");
        for (let pared of paredes) {
            console.log("pared:", pared.id);
            let angulos = BalanceEnergetico.calcularAngulos(pared.gamma, 90, this.state.latitud, this.state.sunTimes);
            console.log(angulos);
            let sun = SunCalc.getPosition(BalanceEnergetico.hourAngleToDate(angulos.omega, this.state.latitud, this.state.longitud), this.state.latitud, this.state.longitud);
            let azimuth = sun.azimuth * 180 / Math.PI;
            console.log("AZIMUTH", azimuth);
            let gammas = BalanceEnergetico.calcularGammasPared(pared.gamma);
            console.log("Gammas", gammas);
            let omega_mna = BalanceEnergetico.calcularOmegaPared(angulos.phi, angulos.delta, gammas.gamma1, this.state.latitud, this.state.longitud);
            let omega_tde = BalanceEnergetico.calcularOmegaPared(angulos.phi, angulos.delta, gammas.gamma2, this.state.latitud, this.state.longitud);
            console.log("Omega Mañana", omega_mna);
            console.log("Omega Tarde", omega_tde);
            let omegas = BalanceEnergetico.calcularHoraIncidencia(pared.gamma, angulos.w1, angulos.w2, omega_mna, omega_tde);
            console.log("omegas", omegas);
            let omegasDate = {
                wm: {
                    desde: omegas.wm[0] >= angulos.w1 && omegas.wm[0] <= angulos.w2 ?
                        BalanceEnergetico.hourAngleToDate(omegas.wm[0],this.state.latitud, this.state.longitud) : null,
                    hasta: omegas.wt[0] >= angulos.w1 && omegas.wt[0] <= angulos.w2 ?
                        BalanceEnergetico.hourAngleToDate(omegas.wt[0],this.state.latitud, this.state.longitud) : null
                },
                wt: {
                    desde: omegas.wm[1] >= angulos.w1 && omegas.wm[1] <= angulos.w2 ?
                        BalanceEnergetico.hourAngleToDate(omegas.wm[1],this.state.latitud, this.state.longitud): null,
                    hasta: omegas.wt[1] >= angulos.w1 && omegas.wt[1] <= angulos.w2 ?
                        BalanceEnergetico.hourAngleToDate(omegas.wt[1],this.state.latitud, this.state.longitud): null
                }
            };

            let Rb = BalanceEnergetico.calcularRB(angulos, pared, omegas);
            pared.omegas = omegasDate;
            pared.rb = Rb;
        }
        this.setState({paredes: paredes});
    }

    onGradeChanged(grade) {
        this.setState({
            grade: grade
        });
    }

    onRadiationsChanged(global, direct, difuse){
        this.setState({radiaciones: {global: global, directa: direct, difusa: difuse}});
    }



    render() {

        const {classes} = this.props;
        const {camara, sunPosition} = this.state;

        return (
            <div className={classes.root}>
                <Grid container spacing={8}>

                    <Grid item xs={8}>
                        <TabPanel
                            comuna={this.state.comuna}
                            radiaciones={this.state.radiaciones}
                            onComunaChanged={this.onComunaChanged}
                            onParedesChanged={this.onParedesChanged}
                            sunPosition={sunPosition}
                            camara={camara}
                            paredes={this.state.paredes}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <MapContainer
                            lat={-36.82013519999999}
                            lng={-73.0443904}
                            zoom={12}
                            markers={[]}
                            onComunaChanged={this.onComunaChanged}
                        />
                        <div ref={(col) => {
                            this.col = col
                        }}>
                            <GeoInfoPanel
                                comuna={this.state.comuna}
                                width={this.state.width}
                                onRadiationsChanged={this.onRadiationsChanged}
                            />
                        </div>
                    </Grid>

                </Grid>

            </div>
        );
    }
}

export default withStyles(styles)(Main)
