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

const styles = {
    card: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0px',
        transform: 'scale(0.8)',
    },
    title: {
        marginBottom: 16,
        fontSize: 12,
    },
    pos: {
        marginBottom: 12,
    },
};

class GeoInfoPanel extends Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            comuna: props.comuna,
            selected: 0,
            width: props.width
        }
    }

    handleChange(event, value) {
        this.setState({selected: value});
    };

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.comuna.nombre != this.state.comuna.nombre) {
            let pointer = this;
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
                    this.props.onRadiationsChanged(global.data,direct.data,difuse.data);
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


        const {classes} = this.props;
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
                                    <Paper>
                                        <Tabs
                                            value={this.state.selected}
                                            indicatorColor="primary"
                                            textColor="primary"
                                            onChange={this.handleChange}
                                            fullWidth
                                        >
                                            <Tab label="Temperatura"/>
                                            <Tab label="Radiación"/>
                                        </Tabs>
                                    </Paper>
                                    {this.state.selected == 0 &&
                                    <TabContainer>
                                        <Bar
                                            height={230}
                                            width={this.state.width - 50}
                                            data={dataTemp}
                                            options={optionsTemp}
                                        />
                                    </TabContainer>
                                    }
                                    {this.state.selected == 1 &&
                                    <TabContainer>
                                        <Bar
                                            height={230}
                                            width={this.state.width - 50}
                                            data={dataRad}
                                            options={optionsRad}
                                        />
                                    </TabContainer>
                                    }
                                    {/*{this.state.omegas != null  &&*/}
                                    {/*<Typography>*/}
                                    {/*La pared recibe sol desde: {this.state.omegas.wm.desde.getHours()}:{this.state.omegas.wm.desde.getMinutes()}*/}
                                    {/*<br></br>*/}
                                    {/*Hasta: {this.state.omegas.wm.hasta.getHours()}:{this.state.omegas.wm.hasta.getMinutes()}*/}
                                    {/*<br></br>*/}
                                    {/*Y desde: {this.state.omegas.wt.desde.getHours()}:{this.state.omegas.wt.desde.getMinutes()}*/}
                                    {/*<br></br>*/}
                                    {/*Hasta {this.state.omegas.wt.hasta.getHours()}:{this.state.omegas.wt.hasta.getMinutes()}*/}
                                    {/*<br></br>*/}
                                    {/*Radiación de la pared: {this.state.rb}*/}
                                    {/*</Typography>*/}
                                    {/*}*/}


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

export default withStyles(styles)(GeoInfoPanel)
