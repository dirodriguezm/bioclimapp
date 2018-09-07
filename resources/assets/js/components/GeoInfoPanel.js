import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {Bar} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import DetalleBalance from "./DetalleBalance";
import SwipeableViews from "react-swipeable-views";
import AppBar from "@material-ui/core/AppBar/AppBar";

function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 0}}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    contentBarra: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    contentLeft: {
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    contentShiftLeft: {
    },
    appFrame: {
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%',
    },
});

class GeoInfoPanel extends Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeIndex = this.handleChangeIndex.bind(this);
        this.state = {
            comuna: props.comuna,
            selected: 0,
            width: props.width
        }
    }

    handleChange(event, value) {
        this.setState({selected: value});
    };
    handleChangeIndex(index) {
        this.setState({value: index});
    };

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.comuna.nombre != this.state.comuna.nombre) {
            let pointer = this;
            let props = this.props;
            axios.all([this.getTemperaturesById(nextProps.comuna.id), this.getGlobalRadiationById(nextProps.comuna.id),
                this.getDirectRadiationById(nextProps.comuna.id), this.getDifuseRadiationById(nextProps.comuna.id)])
                .then(axios.spread(function (temps, global, direct, difuse) {
                    pointer.setState({
                        comuna: nextProps.comuna,
                        temps: temps.data,
                        global: global.data,
                        directa: direct.data,
                        difusa: difuse.data,
                        width: nextProps.width,
                    });
                    props.onRadiationsChanged(global.data,direct.data,difuse.data);
                }));
        }

    }

    getTemperaturesById(id) {
        return axios.get('http://127.0.0.1:8000/api/temperaturas/' + id);
    }

    getGlobalRadiationById(id) {
        return axios.get('http://127.0.0.1:8000/api/radiaciones/' + id);
    }
    getDirectRadiationById(id) {
        return axios.get('http://127.0.0.1:8000/api/radiaciones_directa/' + id);
    }
    getDifuseRadiationById(id) {
        return axios.get('http://127.0.0.1:8000/api/radiaciones_difusa/' + id);
    }


    render() {
        const {classes, theme} = this.props;
        let tempAnual = null;
        let radAnual = null;
        if (this.state.temps) {
            let tempsCopy = Object.assign([], this.state.temps);
            let radsCopy = Object.assign([], this.state.global);
            tempAnual = tempsCopy.pop();
            radAnual = radsCopy.pop();
        }
        const dataTemp = {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            datasets: [
                {
                    label: 'Temperatura promedio mensual',
                    backgroundColor: 'rgba(48,63,159,0.5)',
                    borderColor: 'rgba(48,63,159,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(48,63,159,0.8)',
                    hoverBorderColor: 'rgba(48,63,159,1)',
                    data: this.state.temps ? this.state.temps.map(function (temp) {
                        return temp.valor;
                    }) : null
                },
                {
                    label: 'Temperatura promedio anual',
                    type: 'line',
                    data: Array(12).fill(tempAnual ? tempAnual.valor : null),
                    fill: false,
                    borderColor: '#c51162',
                    backgroundColor: "#c51162",
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        };
        const optionsTemp = {
            maintainAspectRatio: false,
            responsive: false,
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '°C'
                    },
                    ticks: {
                        beginAtZero: true,
                        stepSize: 5,
                        min: 0,
                        max: 25
                    }
                }],
            }
        }

        const dataRad = {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            datasets: [
                {
                    label: 'Radiación global promedio mensual',
                    backgroundColor: 'rgba(48,63,159,0.5)',
                    borderColor: 'rgba(48,63,159,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(48,63,159,0.8)',
                    hoverBorderColor: 'rgba(48,63,159,1)',
                    data: this.state.global ? this.state.global.map(function (rad) {
                        return rad.valor;
                    }) : null
                },
                {
                    label: 'Radiación global promedio anual',
                    type: 'line',
                    data: Array(12).fill(radAnual ? radAnual.valor / 12 : null),
                    fill: false,
                    borderColor: '#c51162',
                    backgroundColor: "#c51162",
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        }

        const optionsRad = {
            maintainAspectRatio: false,
            responsive: false,
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Kw/m^2',
                    },
                    ticks: {
                        beginAtZero: true,
                        stepSize: 50,
                        min: 0,
                        max: 350
                    }
                }],
            }
        }

        return (
            <div>
                <Card className={classes.card}>
                    {
                        this.state.comuna.nombre ?
                            <div>
                                <CardContent>
                                    <Typography variant="headline" component="h4">Información Geográfica</Typography>
                                    <Typography variant="subheading" color="textSecondary">
                                        {"Comuna: " + this.state.comuna.nombre}
                                    </Typography>
                                    {/*<Paper>*/}
                                        {/*<Tabs*/}
                                            {/*value={this.state.selected}*/}
                                            {/*indicatorColor="primary"*/}
                                            {/*textColor="primary"*/}
                                            {/*onChange={this.handleChange}*/}
                                            {/*fullWidth*/}
                                        {/*>*/}
                                            {/*<Tab label="Temperatura"/>*/}
                                            {/*<Tab label="Radiación"/>*/}
                                            {/*<Tab label="Balance Energético"/>*/}
                                        {/*</Tabs>*/}
                                    {/*</Paper>*/}
                                    <AppBar position="static">
                                        <Tabs value={this.state.selected} onChange={this.handleChange} fullWidth>
                                            <Tab label="Temperatura"/>
                                            <Tab label="Radiación"/>
                                            <Tab label="Balance Energético"/>
                                        </Tabs>
                                    </AppBar>
                                    <SwipeableViews
                                        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                        index={this.state.selected}
                                        onChangeIndex={this.handleChangeIndex}
                                    >
                                        <TabContainer dir={theme.direction}>
                                            <Bar
                                                height={230}
                                                width={this.state.width - 50}
                                                data={dataTemp}
                                                options={optionsTemp}
                                            />
                                        </TabContainer>
                                        <TabContainer dir={theme.direction}>
                                            <Bar
                                                height={230}
                                                width={this.state.width - 50}
                                                data={dataRad}
                                                options={optionsRad}
                                            />
                                        </TabContainer>
                                        <TabContainer dir={theme.direction}>
                                            <DetalleBalance
                                                width={this.props.width}
                                                height={230}
                                                aporte_solar={this.props.aporte_solar}
                                                aporte_interno={this.props.aporte_interno}
                                                perdida_conduccion={this.props.perdida_conduccion}
                                                perdida_ventilacion={this.props.perdida_ventilacion}
                                            />
                                        </TabContainer>
                                    </SwipeableViews>
                                </CardContent>

                            </div>
                            :
                            <CardContent>
                                <Typography variant="headline" component="h4">Información Geográfica</Typography>
                                <Typography variant="subheading" color="textSecondary">
                                    Selecciona una comuna
                                </Typography>
                            </CardContent>
                    }
                </Card>
            </div>
        );
    }
}

GeoInfoPanel.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(GeoInfoPanel)
