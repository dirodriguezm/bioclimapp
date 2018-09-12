import React, { Component } from 'react';
import {Bar, Doughnut} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
    root: {
        flexGrow: 1,
        background: '#212121'
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        background: '#37474F'
    },
    title: {
        textAlign: 'center',
        color: 'white',
        padding: theme.spacing.unit,
    }
});

class DetalleBalance extends Component{
    constructor(props){
        super(props);
        this.state = {
            clicked: null,
            aporte_solar : 0,
            aporte_interno : 0,
            perdida_conduccion : 0,
            perdida_ventilacion : 0,
        };

        this.data_componentes = [];
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e){
        if(e[0]._index === 0){
            this.setState({clicked: this.aporte_solar})
        }
        if(e[0]._index === 1){
            this.setState({clicked: this.aporte_interno})
        }
        if(e[0]._index === 2){
            this.setState({clicked: this.perdida_conduccion})
        }
        if(e[0]._index === 3){
            this.setState({clicked: this.perdida_ventilacion})
        }

    }

    componentDidMount(){

    }

    componentDidUpdate(prevProps){

        console.log("PROPS", this.props);
        // this.options = {
        //     maintainAspectRatio: false,
        //     responsive: false,
        //     scales:{
        //         yAxes: [{
        //             scaleLabel: {
        //                 display: true,
        //                 labelString: '°C'
        //             },
        //             ticks:{
        //                 beginAtZero:false,
        //                 stepSize: 5,
        //                 // min: Math.min(this.props.perdidas_conduccion,this.props.perdidas_ventilacion) - 5,
        //                 // max: Math.max(this.props.aportes_solares,this.props.aportes_internos) + 5
        //             }
        //         }],
        //     }
        // };
    }

    render(){
        const { classes } = this.props;

        const data = {
            labels: ['Aportes Solares','Aportes Internos','Pérdidas por Conducción','Pérdidas por Ventilación'],
            datasets: [
                {
                    label: 'Balance Energético',
                    backgroundColor: 'rgba(48,63,159,0.5)',
                    borderColor: 'rgba(48,63,159,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(48,63,159,0.8)',
                    hoverBorderColor: 'rgba(48,63,159,1)',
                    data: [this.props.aporte_solar*100000, this.props.aporte_interno,
                        -this.props.perdida_conduccion, -this.props.perdida_ventilacion]
                },
            ]
        };
        const dataAportes = {
            labels: ['Aportes Solares','Aportes Internos'],
            datasets: [
                {
                    data: [this.props.aporte_solar * 10000, this.props.aporte_interno],
                    backgroundColor:['#3F51B5','#673AB7'],
                    borderColor: ['#7E57C2','#5C6BC0'],
                    label: 'Aportes'
                }
            ]
        };
        const dataPerdidas = {
            labels: ['Pérdidas por Conducción','Pérdidas por Ventilación'],
            datasets: [
                {
                    data: [this.props.perdida_conduccion, this.props.perdida_ventilacion],
                    backgroundColor:['#E91E63','#9C27B0'],
                    borderColor: ['#EC407A','#AB47BC'],
                    label: 'Perdidas'
                }
            ]
        };
        const options = {
            legend: {
                labels: {
                    fontColor: '#F5F5F5'
                }
            },
        }

        return(
            <div className={classes.root}>
                <Typography variant="title" gutterBottom className={classes.title}>
                    Balance Energético
                </Typography>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        {this.props.aporte_solar != null || this.props.aporte_interno != null ?
                            <Paper className={classes.paper}>
                                <Doughnut
                                    data={dataAportes}
                                    options={options}
                                />
                            </Paper>
                            :
                            <div/>
                        }
                    </Grid>
                    <Grid item xs={12}>
                        {this.props.perdida_conduccion != null || this.props.perdida_ventilacion != null ?
                            <Paper className={classes.paper}>
                                <Doughnut
                                    data={dataPerdidas}
                                    options={options}
                                />
                            </Paper>
                            :
                            <div/>
                        }

                    </Grid>
                </Grid>
            </div>
        );
    }
}
DetalleBalance.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles) (DetalleBalance);