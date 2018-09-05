import React, { Component } from 'react';
import {Bar, Doughnut} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

class DetalleBalance extends Component{
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e){
        console.log(e);
    }

    render(){
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
                    data: [this.props.aportes_solares, this.props.aportes_internos, this.props.perdidas_conduccion, this.props.perdidas_ventilacion]
                },
            ]
        };
        const optionsTemp = {
            maintainAspectRatio: false,
            responsive: false,
            scales:{
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '°C'
                    },
                    ticks:{
                        beginAtZero:false,
                        stepSize: 5,
                        min: Math.min(this.props.perdidas_conduccion,this.props.perdidas_ventilacion) - 5,
                        max: Math.max(this.props.aportes_solares,this.props.aportes_internos) + 5
                    }
                }],
            }
        };

        return(
            <div>
                <Paper>
                    <Bar
                        height={300}
                        width={this.props.width}
                        data={data}
                        options={optionsTemp}
                        onClick={this.handleClick}
                    />
                </Paper>
                <Paper>

                </Paper>
            </div>
        );
    }
}

export default DetalleBalance