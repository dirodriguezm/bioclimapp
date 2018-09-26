import React, {Component} from 'react';
import {Bar, Doughnut} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {Parser as HtmlToReactParser} from 'html-to-react';
import Button from "@material-ui/core/Button/Button";

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
        <div>
            <Typography variant="title" gutterBottom style={{color:'grey'}}>
                % de influencia
            </Typography>
            {props.data.labels.map((label, index) => (
                <Grid key={index} container spacing={8}>
                    <Grid item xs={4}>
                        <div style={{background: props.data.datasets[0].backgroundColor[index], padding: 0, width: 36, height:12}}></div>
                        {/*<div style={{color: props.data.datasets[0].backgroundColor[index]}}></div>*/}
                    </Grid>
                    <Grid item xs={8}>
                        {label} : {props.data.datasets[0].data[index] ? porcentaje[index] : 0}
                    </Grid>
                </Grid>
            ))}
        </div>
    );
}

function Chart(props){
    return (
        <Paper>
            <Grid container spacing={24}>
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
                    <Grid item xs={12}>
                        <Chart
                            data={this.state.dataAportes}
                            options={this.options}
                            height={200}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Chart
                            data={this.state.dataPerdidas}
                            options={this.options}
                            height={200}
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