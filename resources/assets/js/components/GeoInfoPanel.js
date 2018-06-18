import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card, CardImg, CardText, CardBody,
         CardTitle, CardSubtitle, ListGroup, ListGroupItem,
         Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import axios from 'axios';
import {Bar} from 'react-chartjs-2';

export default class GeoInfoPanel extends Component{

  constructor(props){
    super(props);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.state = {
      comuna: props.comuna,
      dropdownOpen: false,
      selectedItem: "Temperatura",
      width: props.width,
    }
  }

  toggleDropdown(){
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  selectItem(e){
    this.setState({
      selectedItem: e.currentTarget.textContent
    });
  }

  componentDidMount(){
    //console.log("GEO WIDTH",this.state.width);
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.omegas != null ){
      this.setState({
        omegas:nextProps.omegas,
      })
    }
    if(nextProps.rb != null){
      this.setState({
        rb: nextProps.rb
      })
    }
    if(nextProps.comuna.nombre != this.state.comuna.nombre){
      let pointer = this;
      axios.all([this.getTemperaturesById(nextProps.comuna.id), this.getGlobalRadiationById(nextProps.comuna.id)])
      .then(axios.spread(function (temps, rads) {
        pointer.setState({
          comuna: nextProps.comuna,
          temps: temps.data,
          rads: rads.data,
          width: nextProps.width,
        })
      }));
    }

  }

  getTemperaturesById(id){
    return axios.get('http://127.0.0.1:8000/api/temperaturas/' + id);
  }
  getGlobalRadiationById(id){
    return axios.get('http://127.0.0.1:8000/api/radiaciones/' + id);
  }


  render(){
    let tempAnual = null;
    let radAnual = null;
    if( this.state.temps){
      let tempsCopy = Object.assign([], this.state.temps);
      let radsCopy = Object.assign([], this.state.rads);
      tempAnual = tempsCopy.pop();
      radAnual = radsCopy.pop();
    }
    const dataTemp = {
      labels: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
      datasets: [
        {
          label: 'Temperatura promedio',
          backgroundColor: 'rgba(247,201,17,0.2)',
          borderColor: 'rgba(247,201,17,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(247,201,17,0.5)',
          hoverBorderColor: 'rgba(247,201,17,1)',
          data: this.state.temps? this.state.temps.map(function(temp){
            return temp.valor;
          }) : null
        },
        {
          label: 'Anual',
          type: 'line',
          data: Array(12).fill(tempAnual? tempAnual.valor : null),
          fill: false,
          borderColor: '#EC932F',
          backgroundColor: "#EC932F",
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0
        }
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
            beginAtZero:true,
            stepSize: 5,
            min:0,
            max:25
          }
        }],
      }
    }

    const dataRad = {
      labels: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
      datasets: [
        {
          label: 'Radiación global promedio',
          backgroundColor: 'rgba(247,201,17,0.2)',
          borderColor: 'rgba(247,201,17,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(247,201,17,0.5)',
          hoverBorderColor: 'rgba(247,201,17,1)',
          data: this.state.rads? this.state.rads.map(function(rad){
            return rad.valor;
          }) : null
        },
        {
          label: 'Anual',
          type: 'line',
          data: Array(12).fill(radAnual? radAnual.valor/12 : null),
          fill: false,
          borderColor: '#EC932F',
          backgroundColor: "#EC932F",
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0
        }
      ]
    }

    const optionsRad = {
      maintainAspectRatio: false,
      responsive: false,
      scales:{
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Kw/m^2',
          },
          ticks:{
            beginAtZero:true,
            stepSize: 50,
            min:0,
            max:350
          }
        }],
      }
    }



    return(
      <div>
      <Card>
        {
          this.state.comuna.nombre?
          <div>
            <CardBody>
              <CardTitle>Información Geográfica</CardTitle>
              <CardSubtitle>{"Comuna: " + this.state.comuna.nombre}</CardSubtitle>
              <br></br>
              <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} size="sm">
                <DropdownToggle caret>
                  {this.state.selectedItem}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Gráficos</DropdownItem>
                  <DropdownItem onClick={this.selectItem}>Temperatura</DropdownItem>
                  <DropdownItem onClick={this.selectItem}>Radiación</DropdownItem>
                  {/* <DropdownItem divider />
                  <DropdownItem>Another Action</DropdownItem> */}
                </DropdownMenu>
              </Dropdown>
              { this.state.selectedItem.localeCompare("Temperatura") == 0 &&
                <Bar
                height={200}
                width={this.state.width- 30}
                data={dataTemp}
                options={optionsTemp}
              />
              }
              { this.state.selectedItem.localeCompare("Radiación") == 0 &&
                <Bar
                  height={200}
                  width={this.state.width - 30}
                  data={dataRad}
                  options={optionsRad}
                />
              }
              {this.state.omegas != null  &&
                <CardText>
                  La pared recibe sol desde: {this.state.omegas.wm.desde.getHours()}:{this.state.omegas.wm.desde.getMinutes()}
                  <br></br>
                  Hasta: {this.state.omegas.wm.hasta.getHours()}:{this.state.omegas.wm.hasta.getMinutes()}
                  <br></br>
                  Y desde: {this.state.omegas.wt.desde.getHours()}:{this.state.omegas.wt.desde.getMinutes()}
                  <br></br>
                  Hasta {this.state.omegas.wt.hasta.getHours()}:{this.state.omegas.wt.hasta.getMinutes()}
                  <br></br>
                  Radiación de la pared: {this.state.rb}
                </CardText>
              }


            </CardBody>

          </div>
          :
          <CardBody>
            <CardTitle>Información Geográfica</CardTitle>
            <CardSubtitle>Selecciona una comuna</CardSubtitle>
          </CardBody>
        }
      </Card>
    </div>
    );
  }


}
