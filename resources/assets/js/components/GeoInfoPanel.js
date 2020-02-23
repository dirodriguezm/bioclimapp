import React, {Component} from 'react';
import axios from 'axios';
import {Bar} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardHeader from "@material-ui/core/CardHeader/CardHeader";

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
    contentLeft: {},
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    contentShiftLeft: {},
    appFrame: {
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%',
    },
    card: {
        position: 'relative'
    }
});

class GeoInfoPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {temperaturaConfort: 14};
    }


    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.comuna != null && nextProps.comuna !== prevState.comuna) {
            return {comuna: nextProps.comuna};
        }
        else return null;
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.comuna !== this.props.comuna){
            let pointer = this;
            let props = this.props;
            axios.all([this.getTemperaturesById(this.props.comuna.id), this.getGlobalRadiationById(this.props.comuna.id),
                this.getDirectRadiationById(this.props.comuna.id), this.getDifuseRadiationById(this.props.comuna.id)])
                .then(axios.spread(function (temps, global, direct, difuse) {
                    pointer.setState({
                        comuna: props.comuna,
                        temps: temps.data,
                        global: global.data,
                        directa: direct.data,
                        difusa: difuse.data,
                        height: props.height,
                    });
                    props.onRadiationsChanged(global.data, direct.data, difuse.data);
                }));
        }
        if(this.props.temperatura !== prevProps.temperatura){
            this.setState({temperaturaConfort: this.props.temperatura});
        }
    }

    getTemperaturesById(id) {
        return axios.get('http://bioclimatic.inf.udec.cl/api/temperaturas/' + id);
    }

    getGlobalRadiationById(id) {
        return axios.get('http://bioclimatic.inf.udec.cl/api/radiaciones/' + id);
    }

    getDirectRadiationById(id) {
        return axios.get('http://bioclimatic.inf.udec.cl/api/radiaciones_directa/' + id);
    }

    getDifuseRadiationById(id) {
        return axios.get('http://bioclimatic.inf.udec.cl/api/radiaciones_difusa/' + id);
    }


    render() {
        const {classes, theme} = this.props;
        let tempAnual = null;
        let radAnual = null;
        if (this.state.temps != null) {
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
                    yAxisID: 'temperatura',
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
                    label: 'Temperatura de confort',
                    yAxisID: 'temperatura',
                    type: 'line',
                    data: Array(12).fill(tempAnual ? this.state.temperaturaConfort : null),
                    fill: false,
                    borderColor: '#c51162',
                    backgroundColor: "#c51162",
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 0
                },
                {
                    label: 'Radiación global promedio mensual',
                    yAxisID: 'radiacion',
                    backgroundColor: 'rgba(161, 146, 48, 0.5)',
                    borderColor: 'rgba(161, 146, 48, 1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(161, 146, 48, 0.8)',
                    hoverBorderColor: 'rgba(161, 146, 48, 1)',
                    data: this.state.global ? this.state.global.map(function (rad) {
                        return rad.valor;
                    }) : null
                },
            ]
        };
        const optionsTemp = {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    id: 'temperatura',
                    ticks:{
                        beginAtZero:true,
                        stepSize: 5,
                        min:0,
                        max:25
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '°C'
                    },
                }, {
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'right',
                    id: 'radiacion',
                    gridLines: {
                        drawOnChartArea: false
                    },
                    ticks:{
                        beginAtZero:true,
                        stepSize: 60,
                        min:0,
                        max:300
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'KW/m^2'
                    },
                }],
            }
        }


        return (
            <div>
                <Card className={classes.card}>
                    {
                        this.state.comuna != null ?
                            <div>
                                <CardHeader
                                    title={"Comuna: " + this.state.comuna.nombre}
                                />
                                <CardContent>
                                    <Bar
                                        height={280}
                                        data={dataTemp}
                                        options={optionsTemp}
                                    />
                                </CardContent>

                            </div>
                            :
                            <CardContent>
                                <Typography variant="headline" component="h4">Selecciona una comuna</Typography>
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
