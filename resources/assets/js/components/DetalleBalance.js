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
        flexGrow: 1,
        background: '#F0F0F0'
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        background: '#fdfdfd'
    },
    title: {
        textAlign: 'center',
        color: 'black',
        padding: theme.spacing.unit,
    },
    button: {
        width: 64, height: 64,
        padding: 0,
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
        <Grid container spacing={8} direction="row"
              justify="center"
              alignItems="center">
            <Grid item xs={12}>
                <Typography variant="title" gutterBottom style={{color:'grey'}}>
                    % de influencia
                </Typography>
            </Grid>
            {props.data.labels.map((label, index) => (
                <Grid key={index} container spacing={8} direction="row"
                      justify="center"
                      alignItems="center">
                    <Grid item xs={4} >
                        <div style={{background: props.data.datasets[0].backgroundColor[index], width: 36, height:12}}></div>
                    </Grid>
                    <Grid item xs={8}>
                        {label} : {props.data.datasets[0].data[index] ? porcentaje[index] : 0}
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
}

function Chart(props){
    return (
        <Paper>
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Typography variant="title" style={{color: '#3a3b3d'}}>
                        {props.title}
                    </Typography>
                </Grid>
                <Grid item xs={8}>
                    <Doughnut
                        data={props.data}
                        options={props.options}
                        //width={1000}
                        height={props.height}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Legend data={props.data} />
                </Grid>
            </Grid>
        </Paper>
    );
}

function Grades(props){
    let grades = ['A','B','C','D','E','F','G'];
    let colors = ['#00b23b','#00ca2f','#91f300','#f3ff00','#fabf00','#ff4300','#ff0000'];
    let startPosition = [120,20];
    let ranges = ['< 10','10 - 30','30 - 50','50 - 70','70 - 90','90 - 110','> 110'];
    let grade = null;
    if(props.balance < 10) grade = 'A';
    else if(props.balance >= 10 && props.balance < 30) grade = 'B';
    else if(props.balance >= 30 && props.balance < 50) grade = 'C';
    else if(props.balance >= 50 && props.balance < 70) grade = 'D';
    else if(props.balance >= 70 && props.balance < 90) grade = 'E';
    else if(props.balance >= 90 && props.balance < 110) grade = 'F';
    else if(props.balance >= 110) grade = 'G';
    return (
        <Paper>
            <Stage width={500} height={250} >
                {grades.map((grade, index ) => (
                    <Layer key={index}>
                        <Label x={startPosition[0] + (index*20)} y={startPosition[1] + (index * 35)}>
                            <Tag
                                fill={colors[index]}
                                pointerDirection='right'
                                pointerWidth={20}
                                pointerHeight={28}
                                lineJoin='round'
                                shadowColor='#000000'
                            />
                            <Text
                                width={90 + (20*index)}
                                text={grade}
                                align='right'
                                fontStyle='bold'
                                fontSize={18}
                                padding={5}
                                fill='white'
                            />
                        </Label>
                        <Text
                            y={5 + (35*index)}
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
                        <Label x={300} y={startPosition[1] + (35 * grades.indexOf(grade))}>
                            <Tag
                                fill='#000000'
                                pointerDirection='left'
                                pointerWidth={20}
                                pointerHeight={28}
                                lineJoin='round'
                                shadowColor='#000000'
                            />
                            <Text
                                width={80}
                                text={grade}
                                align='left'
                                fontStyle='bold'
                                fontSize={18}
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
                labels: ['Aportes Solares', 'Aportes Internos'],
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
                labels: ['Pérdidas por Conducción', 'Pérdidas por Ventilación'],
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
            legendCallback: function (chart) {
                var ul = document.createElement('ul');
                var borderColor = chart.data.datasets[0].borderColor;
                chart.data.labels.forEach(function (label, index) {
                    ul.innerHTML += `
                        <li>
                        <span style=" display:inline-block; background-color: ${borderColor[index]}; width:36px; height:12px"></span>
                            ${label} : ${Math.round(chart.data.datasets[0].data[index])}
                        </li>`; // ^ ES6 Template String
                });
                return ul.outerHTML;
            },
            legend: {
                display: false,
            }
        };

    }

    componentDidUpdate(prevProps) {
        if (this.props.aporte_solar !== prevProps.aporte_solar || this.props.aporte_interno !== prevProps.aporte_interno) {
            console.log("Aporte solar", this.props.aporte_solar);
            this.setState({
                dataAportes: {
                    labels: ['Aportes Solares', 'Aportes Internos'],
                    datasets: [
                        {
                            data: [Math.round(this.props.aporte_solar * 1000), Math.round(this.props.aporte_interno)],
                            backgroundColor: ['#F19C00', '#F16600'],
                            borderColor: ['#F19C00', '#F16600'],
                            label: 'Aportes'
                        }
                    ]
                }
            });

        }
        if (this.props.perdida_conduccion !== prevProps.perdida_conduccion || this.props.perdida_ventilacion !== prevProps.perdida_ventilacion) {
            this.setState({
                dataPerdidas: {
                    labels: ['Pérdidas por Conducción', 'Pérdidas por Ventilación'],
                    datasets: [
                        {
                            data: [Math.round(this.props.perdida_conduccion), Math.round(this.props.perdida_ventilacion)],
                            backgroundColor: ['#009688', '#1043A0'],
                            borderColor: ['#009688', '#1043A0'],
                            label: 'Perdidas'
                        }
                    ]
                }
            });
        }

    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.root}>
                <Typography variant="headline" gutterBottom className={classes.title}>
                    Balance Energético
                </Typography>
                <Grid container spacing={32}>
                    <Grid item xs={12}>
                        <Paper>
                            <Grid container spacing={32}>
                                <Grid item xs={4}>
                                    {this.props.area != null ? <Typography>Balance:
                                            {Math.round( ((this.state.dataPerdidas.datasets[0].data[0] + this.state.dataPerdidas.datasets[0].data[1]) -
                                            this.state.dataAportes.datasets[0].data[0] + this.state.dataAportes.datasets[0].data[1]) / (1000*this.props.area) )} KWh/m<sup>2</sup></Typography>
                                        : "Balance:"}
                                </Grid>
                                <Grid item xs={4}>
                                    {this.props.area != null ? <Typography>Area Vivienda : {this.props.area} m<sup>2</sup></Typography>
                                    : "Área vivienda:"}

                                </Grid>
                                <Grid item xs={4}>
                                    {this.props.volumen != null ? <Typography>Volumen Vivienda : {this.props.volumen} m<sup>3</sup></Typography>
                                        : "Volumen vivienda:"}
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Chart
                            data={this.state.dataAportes}
                            options={this.options}
                            height={150}
                            title={"Aportes"}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Chart
                            data={this.state.dataPerdidas}
                            options={this.options}
                            height={150}
                            title={"Pérdidas"}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Grades balance = {20}/>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

DetalleBalance.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(DetalleBalance);