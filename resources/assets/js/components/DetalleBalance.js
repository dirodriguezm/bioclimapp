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
        this.options = {
            legend: {
                position:'right',
                labels: {
                    fontColor: '#212121',

                    generateLabels: function(chart){
                        var data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map(function(label, i) {
                                var meta = chart.getDatasetMeta(0);
                                var ds = data.datasets[0];
                                var arc = meta.data[i];
                                var custom = arc && arc.custom || {};
                                var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                                var arcOpts = chart.options.elements.arc;
                                var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                                var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                                var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                                // We get the value of the current label
                                var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];

                                return {
                                    // Instead of `text: label,`
                                    // We add the value to the string
                                    text: label + " : " + Math.round(value),
                                    fillStyle: fill,
                                    strokeStyle: stroke,
                                    lineWidth: bw,
                                    hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                                    index: i
                                };
                            });
                        } else {
                            return [];
                        }
                    }
                }
            },
        }
    }

    componentDidUpdate(prevProps){
        if(this.props.aporte_solar !== prevProps.aporte_solar || this.props.aporte_interno !== prevProps.aporte_interno) {
            this.setState({
                dataAportes : {
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
        if(this.props.perdida_conduccion !== prevProps.perdida_conduccion || this.props.perdida_ventilacion !== prevProps.perdida_ventilacion) {
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

    render(){
        const { classes } = this.props;

        return(
            <div className={classes.root}>
                <Typography variant="headline" gutterBottom className={classes.title}>
                    Balance Energético
                </Typography>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        {this.state.dataAportes != null ?
                            <Paper className={classes.paper}>
                                <Doughnut
                                    data={this.state.dataAportes}
                                    options={this.options}
                                />
                            </Paper>
                            :
                            <div/>
                        }
                    </Grid>
                    <Grid item xs={12}>
                        {this.state.dataPerdidas != null ?
                            <Paper className={classes.paper}>
                                <Doughnut
                                    data={this.state.dataPerdidas}
                                    options={this.options}
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