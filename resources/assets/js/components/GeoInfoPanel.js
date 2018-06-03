import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, ListGroup, ListGroupItem } from 'reactstrap';
import GradePanel from "./GradePanel";
import axios from 'axios';
import fusioncharts from 'fusioncharts';
import charts from 'fusioncharts/fusioncharts.charts';
import ReactFC from 'react-fusioncharts';
import theme from 'fusioncharts/themes/fusioncharts.theme.carbon';
charts(FusionCharts);
theme(FusionCharts);

export default class GeoInfoPanel extends Component{

  constructor(props){
    super(props);
    this.state = {
      comuna: props.comuna,
      meses: []
    }
    this.getTemperatures = this.getTemperatures.bind(this);
    this.getMonthsNames = this.getMonthsNames.bind(this);
  }

  componentWillReceiveProps(nextProps){
    var temps = [];
    const pointer = this;
    axios.all([this.getTemperatures(nextProps.comuna), this.getMonthsNames()])
    .then(axios.spread(function (temps, months) {
      pointer.setState({
        comuna: nextProps.comuna,
        temps: temps.data,
        meses: months.data
      });
    }));
  }

  getTemperatures(comuna){
    return axios.get('http://127.0.0.1:8000/api/temperaturas/' + comuna.id);
  }

  getMonthsNames(){
    return axios.get('http://127.0.0.1:8000/api/meses');
  }





  render(){
    var data = [];
    if(this.state.temps != null){
      let i = 0;
      for (let temp of this.state.temps){
        data.push({label: this.state.meses[i].nombre, value: temp.valor});
        i++;
      }
      let mean_temp = data.pop();
      var chartConfigs = {
          type: "Column2D",
          className: "fc-column2d", // ReactJS attribute-name for DOM classes
          // "width": "500",
          // "height": "300",
          dataFormat: "JSON",
          dataSource: {
              chart:{
                caption: "Temperatura promedio mensual",
                xAxisName: "Mes",
                yAxisName: "°C",
                theme: 'carbon',
                paletteColors: '#0075c2',
              },
              data: data,
              trendlines: [
                  {
                      line: [
                          {
                              startvalue: mean_temp.value,
                              //color: "#000",
                              valueOnRight: "1",
                              displayvalue: mean_temp.label
                          }
                      ]
                  }
              ]
          }
      };
    }

    return(
      <div>
      <Card>
        <CardBody>
          <CardTitle>Información Geográfica</CardTitle>
          {
            this.state.comuna.nombre?
            <div>
              <CardSubtitle>{"Comuna: " + this.state.comuna.nombre}</CardSubtitle>
              <ReactFC {...chartConfigs} />
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
