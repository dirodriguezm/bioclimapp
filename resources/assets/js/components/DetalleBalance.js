import React, {Component} from 'react';
import {Bar, Doughnut} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Konva from 'konva';
import { render } from 'react-dom';
import {Stage, Layer, Text, Label, Tag, Line} from 'react-konva';
import {Parser as HtmlToReactParser} from 'html-to-react';

const htmlToReactParser = new HtmlToReactParser();


const styles = theme => ({
    root: {
        //flexGrow: 1,
        background: '#F0F0F0'
    },
    paper: {
        //padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        background: '#fdfdfd',
    },
    title: {
        textAlign: 'center',
        color: 'black',
        padding: theme.spacing.unit,
    },
});

function Legend(props) {
    let porcentaje = [0,0];
    let total = 0;
    for(let i = 0; i < props.data.datasets[0].data.length; i++){
        total += props.data.datasets[0].data[i] ? props.data.datasets[0].data[i] : 0;
    }
    for(let i = 0; i < props.data.datasets[0].data.length; i++){
        porcentaje[i] = Math.round(props.data.datasets[0].data[i] * 100 / total);
    }
    return(
        <div >
            {props.data.labels.map((label, index) => (
                <Grid key={index} container spacing={0}
                      direction={"row"}
                      justify="flex-end"
                      alignItems="center"
                      style={{margin:0}}
                >
                    <Grid item xs={2}>
                        <div style={{background: props.data.datasets[0].backgroundColor[index], width: 36, height:12}}/>
                    </Grid>
                    <Grid item xs={10}>
                        {label} : {props.data.datasets[0].data[index] ? porcentaje[index]  : 0} %
                    </Grid>
                </Grid>
            ))}
        </div>
    );
}

function Chart(props){
    return (
        <Paper>
            <Grid container spacing={24} alignItems="center" style={{margin:0}}>
                <Grid item xs={12}>
                    <Typography variant="title" align="center" style={{color: '#3a3b3d'}}>
                        {props.title}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Doughnut
                        data={props.data}
                        options={props.options}
                        //width={1000}
                        height={props.height}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Legend data={props.data} />
                </Grid>
            </Grid>
        </Paper>
    );
}

function Grades(props){
    let grades = ['A+','A','B','C','D','E','F','G'];
    let colors = ['#00b23b','#00ca2f','#91f300','#f3ff00','#fabf00','#ff4300','#ff0000','7d009c'];
    let startPosition = [120,20];
    let ranges = ['> 85%','70 - 85','55 - 70','40 - 55','20 - 40','10 - 20','-35 - -10','< -35%'];
    let grade = null;
    if(props.balance > 85) grade = 'A+';
    else if(props.balance <= 85 && props.balance > 70) grade = 'A';
    else if(props.balance <= 70 && props.balance > 55) grade = 'B';
    else if(props.balance <= 55 && props.balance > 40) grade = 'C';
    else if(props.balance <= 40 && props.balance > 20) grade = 'D';
    else if(props.balance <= 20 && props.balance > 10) grade = 'E';
    else if(props.balance <= -10 && props.balance > -35) grade = 'F';
    else if(props.balance <= -35) grade = 'G';
    return (
        <Paper>
            <Stage width={400} height={240} >
                {grades.map((grade, index ) => (
                    <Layer key={index}>
                        <Label x={startPosition[0] + (index*20)} y={startPosition[1] + (index * 28)}>
                            <Tag
                                fill={colors[index]}
                                pointerDirection='right'
                                pointerWidth={20}
                                pointerHeight={24}
                                lineJoin='round'
                                shadowColor='#000000'
                            />
                            <Text
                                width={90 + (20*index)}
                                text={grade}
                                align='right'
                                fontStyle='bold'
                                fontSize={14}
                                padding={5}
                                fill='white'
                            />
                        </Label>
                        <Text
                            y={5 + (28*index)}
                            x={8}
                            text={ranges[index]}
                            align='left'
                            fontSize={18}
                            padding={5}
                            fill='white'
                        />
                    </Layer>
                ))}
                <Layer>
                    <Line
                        x={270}
                        y={0}
                        points={[0, 0, 0, 280]}
                        stroke="black"
                    />
                </Layer>
                {grade != null ?
                    <Layer>
                        <Label x={300} y={startPosition[1] + (28 * grades.indexOf(grade))}>
                            <Tag
                                fill='#000000'
                                pointerDirection='left'
                                pointerWidth={20}
                                pointerHeight={24}
                                lineJoin='round'
                                shadowColor='#000000'
                            />
                            <Text
                                width={80}
                                text={grade}
                                align='left'
                                fontStyle='bold'
                                fontSize={14}
                                padding={5}
                                fill='white'
                            />
                        </Label>
                    </Layer>
                    :
                    <Layer></Layer>
                }
            </Stage>
        </Paper>
    );
}

class DetalleBalance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: null,
            dataAportes: {
                labels: ['Solares', 'Internos'],
                datasets: [
                    {
                        data: [0, 0],
                        backgroundColor: ['#F19C00', '#F16600'],
                        borderColor: ['#F19C00', '#F16600'],
                        label: 'Aportes'
                    }
                ]
            },
            dataPerdidas: {
                labels: ['Por Conducción', 'Por Ventilación'],
                datasets: [
                    {
                        data: [0, 0],
                        backgroundColor: ['#009688', '#1043A0'],
                        borderColor: ['#009688', '#1043A0'],
                        label: 'Perdidas'
                    }
                ]
            }
        };
        this.aporte_interno_objetivo = 0;
        this.aporte_solar_objetivo = 0;
        this.perdida_conduccion_objetivo = 0;
        this.perdida_ventilacion_objetivo = 0;
        this.aporte_solar = 0;
        this.perdida_ventilacion = 0;
        this.perdida_conduccion = 0;
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        if (e[0]._index === 0) {
            this.setState({clicked: this.aporte_solar})
        }
        if (e[0]._index === 1) {
            this.setState({clicked: this.aporte_interno})
        }
        if (e[0]._index === 2) {
            this.setState({clicked: this.perdida_conduccion})
        }
        if (e[0]._index === 3) {
            this.setState({clicked: this.perdida_ventilacion})
        }

    }

    componentDidMount() {
        this.setState({
           grafico_aporte: this.aporte,
           grafico_perdida: this.perdida,
        });
        this.options = {
            // maintainAspectRatio: false,
            // responsive: false,
            cutoutPercentage: 50,
            legend: {
                display: false,
            },
            tooltips: {
                callbacks: {
                    title: function (tooltipItem, data) {
                        return data['labels'][tooltipItem[0]['index']];
                    },
                    label: function (tooltipItem, data) {
                        return data['datasets'][0]['data'][tooltipItem['index']] + " Wh";
                    },
                    // afterLabel: function (tooltipItem, data) {
                    //     var dataset = data['datasets'][0];
                    //     var percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 100)
                    //     return '(' + percent + '%)';
                    // }
                },
                backgroundColor: '#FFF',
                titleFontSize: 16,
                titleFontColor: '#0066ff',
                bodyFontColor: '#000',
                bodyFontSize: 14,
                displayColors: false
            }
        };

    }

    componentDidUpdate(prevProps) {
        if (this.props.aporte_solar !== prevProps.aporte_solar) {
            this.setState({
                dataAportes: {
                    labels: ['Solares', 'Internos'],
                    datasets: [
                        {
                            data: [Math.round(this.props.aporte_solar * 1000), Math.round(this.aporte_interno_objetivo)], //el objetivo es el mismo
                            backgroundColor: ['#F19C00', '#F16600'],
                            borderColor: ['#F19C00', '#F16600'],
                            label: 'Aportes'
                        }
                    ]
                }
            });
            this.aporte_solar = this.props.aporte_solar;
        }
        if (this.props.aporte_interno !== prevProps.aporte_interno) {
            this.setState({
                dataAportes: {
                    labels: ['Solares', 'Internos'],
                    datasets: [
                        {
                            data: [Math.round(this.aporte_solar * 1000), Math.round(this.props.aporte_interno)],
                            backgroundColor: ['#F19C00', '#F16600'],
                            borderColor: ['#F19C00', '#F16600'],
                            label: 'Aportes'
                        }
                    ]
                }
            });
            this.aporte_interno_objetivo = this.props.aporte_interno;
        }
        if (this.props.perdida_conduccion !== prevProps.perdida_conduccion) {
            this.setState({
                dataPerdidas: {
                    labels: ['Por Conducción', 'Por Ventilación'],
                    datasets: [
                        {
                            data: [Math.round(this.props.perdida_conduccion), Math.round(this.perdida_ventilacion)],
                            backgroundColor: ['#009688', '#1043A0'],
                            borderColor: ['#009688', '#1043A0'],
                            label: 'Perdidas'
                        }
                    ]
                }
            });
            this.perdida_conduccion = this.props.perdida_conduccion;
        }
        if (this.props.perdida_ventilacion !== prevProps.perdida_ventilacion) {
            this.setState({
                dataPerdidas: {
                    labels: ['Por Conducción', 'Por Ventilación'],
                    datasets: [
                        {
                            data: [Math.round(this.perdida_conduccion), Math.round(this.props.perdida_ventilacion)],
                            backgroundColor: ['#009688', '#1043A0'],
                            borderColor: ['#009688', '#1043A0'],
                            label: 'Perdidas'
                        }
                    ]
                }
            });
            this.perdida_ventilacion = this.props.perdida_ventilacion;
        }
        if(this.props.perdida_conduccion_objetivo !== prevProps.perdida_conduccion_objetivo){
            this.perdida_conduccion_objetivo = this.props.perdida_conduccion_objetivo;
            let balanceObjetivo =  ((this.perdida_conduccion_objetivo + this.perdida_ventilacion_objetivo)
            -(this.aporte_solar_objetivo + this.aporte_interno_objetivo))/(1000*this.props.area);
            this.setState({balanceObjetivo: balanceObjetivo});
        }
        if(this.props.perdida_ventilacion_objetivo !== prevProps.perdida_ventilacion_objetivo){
            this.perdida_ventilacion_objetivo = this.props.perdida_ventilacion_objetivo;
            let balanceObjetivo =  ((this.perdida_conduccion_objetivo + this.perdida_ventilacion_objetivo)
                -(this.aporte_solar_objetivo + this.aporte_interno_objetivo))/(1000*this.props.area);
            this.setState({balanceObjetivo: balanceObjetivo});
        }
        if(this.props.aporte_solar_objetivo !== prevProps.aporte_solar_objetivo){
            this.aporte_solar_objetivo = this.props.aporte_solar_objetivo;
            let balanceObjetivo =  ((this.perdida_conduccion_objetivo + this.perdida_ventilacion_objetivo)
                -(this.aporte_solar_objetivo + this.aporte_interno_objetivo))/(1000*this.props.area);
            this.setState({balanceObjetivo: balanceObjetivo});
        }
    }

    render() {
        const {classes} = this.props;
        let balance = Math.round( ((this.state.dataPerdidas.datasets[0].data[0] + this.state.dataPerdidas.datasets[0].data[1]) -
            this.state.dataAportes.datasets[0].data[0] + this.state.dataAportes.datasets[0].data[1]) / (1000*this.props.area) )
        console.log("balance",balance);
        console.log("balance objetivo", this.state.balanceObjetivo);
        let ahorro = balance * 100 / this.state.balanceObjetivo;
        console.log("ahorro",ahorro);

        return (
            <Grid container spacing={16} className={classes.root} style={{
                margin: 0,
                width: '100%',
                padding: 16
            }}>
                <Grid item xs={12}>
                    <Paper>
                        <Grid container spacing={16} justify="center"
                              alignItems="center">
                            <Grid item xs={12}>
                                {this.props.area != null ? <Typography align="center" variant="title" style={{color: '#3a3b3d'}}>
                                        Balance Energético: {balance} KWh/m<sup>2</sup></Typography>
                                    : <Typography align="center" variant="title" style={{color: '#3a3b3d'}} >Balance Energético:</Typography>}
                            </Grid>
                            <Grid item xs={6}>
                                {this.props.area != null ? <Typography align="center">Area Vivienda : {this.props.area} m<sup>2</sup></Typography>
                                :  <Typography align="center">Área Vivienda:</Typography>}

                            </Grid>
                            <Grid item xs={6}>
                                {this.props.volumen != null ? <Typography align="center">Volumen Vivienda : {this.props.volumen} m<sup>3</sup></Typography>
                                    :  <Typography align="center">Volumen Vivienda:</Typography>}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={6} >
                    <Chart
                        data={this.state.dataAportes}
                        options={this.options}
                        height={160}
                        title={"Aportes"}
                    />
                </Grid>
                <Grid item xs={6} >
                    <Chart
                        data={this.state.dataPerdidas}
                        options={this.options}
                        height={160}
                        title={"Pérdidas"}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grades balance = {ahorro}/>
                </Grid>
            </Grid>
        );
    }
}

DetalleBalance.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(DetalleBalance);