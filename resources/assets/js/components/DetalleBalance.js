import React, { Component } from 'react';
import {Bar, Doughnut} from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

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
                    data: [this.props.aporte_solar, this.props.aporte_interno,
                        -this.props.perdida_conduccion, -this.props.perdida_ventilacion]
                },
            ]
        };

        // if(this.props.aporte_solar != null){
        //     let i = 0;
        //     for(let key in this.props.aporte_solar){
        //         if(i === 0) {i++; continue};
        //         this.componentes_aporte_solar.push(key);
        //         this.values.push(this.props.aporte_solar[key]);
        //         i++;
        //     }
        // }
        //
        // const data_aportes_solares = {
        //     labels: componentes_aporte_solar,
        //     datasets: [{
        //         data: values,
        //     }]
        // };

        return(
            <div>
                <Paper>
                    {/*<Bar*/}
                        {/*height={this.props.height}*/}
                        {/*width={this.props.width}*/}
                        {/*data={data}*/}
                        {/*options={this.options}*/}
                        {/*onElementsClick={this.handleClick}*/}
                    {/*/>*/}
                    <Doughnut
                        data={data}
                        height={this.props.height}
                        width={this.props.width}
                    />
                </Paper>
                {/*<Paper>*/}
                    {/*{*/}
                        {/*this.state.clicked != null &&*/}
                        {/*<div>*/}
                            {/*<Typography>{Object.keys(this.state.clicked)[0]}</Typography>*/}

                        {/*</div>*/}
                    {/*}*/}

                {/*</Paper>*/}
            </div>
        );
    }
}

export default DetalleBalance