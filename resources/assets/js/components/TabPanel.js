import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Tabs, Tab } from 'react-bootstrap';
import MapContainer from './MapContainer';
import Scene from './World';

export default class TabPanel extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      key: 1
    };
  }

  componentDidMount(){
    this.setState({
      height:this.tab.clientHeight,
      width: this.tab.clientWidth
    })
  }





  handleSelect(key) {
    //alert(`selected ${key}`);
    this.setState({ key });
  }

  render() {
    // const mapStyle = {
    //   width: '100vh',
    //   height: '50vh'
    // }

    return (
      <div ref={(tab) => { this.tab = tab }}>
        <Tabs
          activeKey={this.state.key}
          onSelect={this.handleSelect}
          id="tabs"
        >
          <Tab eventKey={1} title="Localidad">
            <MapContainer
              lat={-36.82013519999999}
              lng={-73.0443904}
              zoom={15}
              markers={[]}
            />
          </Tab>
          <Tab eventKey={2} title="Contexto">
            {this.state.width?
            <Scene width={this.state.width} height={this.state.height} /> :
            <div></div>
            }
          </Tab>
          <Tab eventKey={3} title="Morfología">
            {this.state.width?
            <Scene width={this.state.width} height={this.state.height} /> :
            <div></div>
            }

          </Tab>
          <Tab eventKey={4} title="Sistemas de Energía Renovable">
            Por definir
          </Tab>
        </Tabs>
      </div>
    );
  }
}
