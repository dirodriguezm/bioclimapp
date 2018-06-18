import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MapContainer from './MapContainer';
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import Scene from './World';

export default class TabPanel extends Component {
  constructor(props, context) {
    super(props, context);
    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1'
    };
    this.onComunaChanged = this.onComunaChanged.bind(this);
    this.onParedesChanged = this.onParedesChanged.bind(this);
  }

  componentDidMount(){
    this.setState({
      height:this.tab.clientHeight,
      width: this.tab.clientWidth
    });
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  onComunaChanged(comuna){
    this.props.onComunaChanged(comuna);
  }

  onParedesChanged(paredes){
    this.props.onParedesChanged(paredes);
  }

  render() {
    // const mapStyle = {
    //   width: '100vh',
    //   height: '50vh'
    // }

    return (
      <div ref={(tab) => { this.tab = tab }}>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Localidad
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Contexto
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '3' })}
              onClick={() => { this.toggle('3'); }}
            >
              Morfología
            </NavLink>
          </NavItem>
          {/* <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '4' })}
              onClick={() => { this.toggle('4'); }}
            >
              Sistemas de Energía Renovable
            </NavLink>
          </NavItem> */}
        </Nav>
        <TabContent activeTab={this.state.activeTab} ref={(tab) => { this.tab = tab }}>
          <TabPane tabId="1">
            <MapContainer
              lat={-36.82013519999999}
              lng={-73.0443904}
              zoom={15}
              markers={[]}
              onComunaChanged={this.onComunaChanged}
            />
          </TabPane>
          <TabPane tabId="2">
            {/* {this.state.width?
            <Scene width={this.state.width} height={this.state.height}/> :
            <div></div>
            } */}
          </TabPane>
          <TabPane tabId="3">
            {this.state.width?
              <Scene
                width={this.state.width}
                height={this.state.height}
                onParedesChanged={this.onParedesChanged}
              /> :
              <div></div>
            }
          </TabPane>
          <TabPane tabId="4">
            Por definir
          </TabPane>
        </TabContent>
      </div>
    );
  }
}
