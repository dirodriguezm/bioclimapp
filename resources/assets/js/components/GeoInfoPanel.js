import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, ListGroup, ListGroupItem } from 'reactstrap';
import GradePanel from "./GradePanel";
import axios from 'axios';
import {Bar} from 'react-chartjs-2';

export default class GeoInfoPanel extends Component{

  constructor(props){
    super(props);
    this.state = {
      comuna: props.comuna
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.comuna.nombre != this.state.comuna.nombre){
      axios.get('http://127.0.0.1:8000/api/temperaturas/' + nextProps.comuna.id)
      .then(response => {
        this.setState({
          comuna: nextProps.comuna,
          temps: response.data
        })
      })
    }

  }


  render(){
    let anual = null;
    if( this.state.temps){
      anual = this.state.temps.pop();
    }
    const data = {
      labels: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
      datasets: [
        {
          label: 'Temperatura promedio',
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          hoverBorderColor: 'rgba(255,99,132,1)',
          data: this.state.temps? this.state.temps.map(function(temp){
            return temp.valor;
          }) : null
        },
        {
          label: 'Anual',
          type: 'line',
          data: Array(12).fill(anual? anual.valor : null),
          fill: false,
          borderColor: '#EC932F',
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0
        }
      ]
    };

    return(
      <div>
      <Card>
        <CardBody>
          <CardTitle>Información Geográfica</CardTitle>
          {
            this.state.comuna.nombre?
            <div>
              <CardSubtitle>{"Comuna: " + this.state.comuna.nombre}</CardSubtitle>
              <Bar
                data={data}
                options={{
                  maintainAspectRatio: true,
                  responsive: true,
                  scales:{
                    yAxes: [{
                      scaleLabel: {
                        display: true,
                        labelString: '°C'
                      }
                    }],
                  }
                }}
              />

            </div>
            :
            <CardSubtitle>Selecciona una comuna</CardSubtitle>
          }

        </CardBody>
      </Card>
    </div>
    );
  }
}
