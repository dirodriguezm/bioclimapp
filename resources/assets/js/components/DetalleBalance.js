import React, {Component} from 'react';
import {Bar, Doughnut} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Text, Label, Tag } from 'react-konva';
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
    return (
        <Stage width={500} height={250} >
            <Layer>
                <Label x={120} y={20}>
                    <Tag
                        fill= '#00b23b'
                        pointerDirection= 'right'
                        pointerWidth={20}
                        pointerHeight={28}
                        lineJoin= 'round'
                        shadowColor= '#00b23b'
                    />
                    <Text
                        width={90}
                        text='A'
                        align='right'
                        fontStyle="bold"
                        fontSize={18}
                        padding={5}
                        fill='white'
                    />
                </Label>
                <Text
                    y={5}
                    x={8}
                    text='< 10'
                    align='left'
                    fontSize={18}
                    padding={5}
                    fill='white'
                />
                <Label x={140} y={55}>
                    <Tag
                        fill= '#00ca2f'
                        pointerDirection= 'right'
                        pointerWidth={20}
                        pointerHeight={28}
                        lineJoin= 'round'
                        shadowColor= '#00ca2f'
                    />
                    <Text
                        width={110}
                        text='B'
                        align='right'
                        fontStyle="bold"
                        fontSize={18}
                        padding={5}
                        fill='white'
                    />
                </Label>
                <Text
                    y={40}
                    x={8}
                    text='10 - 30'
                    align='left'
                    fontSize={18}
                    padding={5}
                    fill='white'
                />
                <Label x={160} y={90}>
                    <Tag
                        fill= '#91f300'
                        pointerDirection= 'right'
                        pointerWidth={20}
                        pointerHeight={28}
                        lineJoin= 'round'
                        shadowColor= '#91f300'
                    />
                    <Text
                        width={130}
                        text='C'
                        align='right'
                        fontStyle="bold"
                        fontSize={18}
                        padding={5}
                        fill='white'
                    />
                </Label>
                <Text
                    y={75}
                    x={8}
                    text='30 - 50'
                    align='left'
                    fontSize={18}
                    padding={5}
                    fill='white'
                />
                <Label x={180} y={125}>
                    <Tag
                        fill= '#f3ff00'
                        pointerDirection= 'right'
                        pointerWidth={20}
                        pointerHeight={28}
                        lineJoin= 'round'
                        shadowColor= '#f3ff00'
                    />
                    <Text
                        width={150}
                        text='D'
                        align='right'
                        fontStyle="bold"
                        fontSize={18}
                        padding={5}
                        fill='white'
                    />
                </Label>
                <Text
                    y={110}
                    x={8}
                    text='50 - 70'
                    align='left'
                    fontSize={18}
                    padding={5}
                    fill='white'
                />
                <Label x={200} y={160}>
                    <Tag
                        fill= '#fabf00'
                        pointerDirection= 'right'
                        pointerWidth={20}
                        pointerHeight={28}
                        lineJoin= 'round'
                        shadowColor= '#fabf00'
                    />
                    <Text
                        width={170}
                        text='E'
                        align='right'
                        fontStyle="bold"
                        fontSize={18}
                        padding={5}
                        fill='white'
                    />
                </Label>
                <Text
                    y={145}
                    x={8}
                    text='70 - 90'
                    align='left'
                    fontSize={18}
                    padding={5}
                    fill='white'
                />
                <Label x={220} y={195}>
                    <Tag
                        fill= '#ff4300'
                        pointerDirection= 'right'
                        pointerWidth={20}
                        pointerHeight={28}
                        lineJoin= 'round'
                        shadowColor= '#ff4300'
                    />
                    <Text
                        width={190}
                        text='F'
                        align='right'
                        fontStyle="bold"
                        fontSize={18}
                        padding={5}
                        fill='white'
                    />
                </Label>
                <Text
                    y={180}
                    x={8}
                    text='90 - 110'
                    align='left'
                    fontSize={18}
                    padding={5}
                    fill='white'
                />
                <Label x={240} y={230}>
                    <Tag
                        fill= '#ff0000'
                        pointerDirection= 'right'
                        pointerWidth={20}
                        pointerHeight={28}
                        lineJoin= 'round'
                        shadowColor= '#ff0000'
                    />
                    <Text
                        width={210}
                        text='G'
                        align='right'
                        fontStyle="bold"
                        fontSize={18}
                        padding={5}
                        fill='white'
                    />
                </Label>
                <Text
                    y={215}
                    x={8}
                    text='> 110'
                    align='left'
                    fontSize={18}
                    padding={5}
                    fill='white'
                />
            </Layer>
        </Stage>
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
            this.setState({
                dataAportes: {
                    labels: ['Aportes Solares', 'Aportes Internos'],
                    datasets: [
                        {
                            data: [this.props.aporte_solar * 10000, this.props.aporte_interno],
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
                            data: [this.props.perdida_conduccion, this.props.perdida_ventilacion],
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
                    {/*<Grid item xs={12}>
                        <Grades/>
                    </Grid>*/}
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
                </Grid>
            </div>
        );
    }
}

DetalleBalance.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(DetalleBalance);