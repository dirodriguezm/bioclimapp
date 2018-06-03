import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TabPanel from "./TabPanel";
import GradePanel from "./GradePanel";
import GeoInfoPanel from "./GeoInfoPanel";
import { Container, Row, Col } from 'reactstrap';

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comuna: "",
      grade: "",
    };
    this.onComunaChanged = this.onComunaChanged.bind(this);
  }

  /*componentDidMount() is a lifecycle method
   * that gets called after the component is rendered
   */
  componentDidMount() {

  }

  onComunaChanged(comuna){
    this.setState({
      comuna: comuna
    });
  }
  onGradeChanged(grade){
    this.setState({
      grade: grade
    });
  }

  render() {

      return (
          <Container fluid>
            <Row >
              <Col xs="8"><TabPanel onComunaChanged={this.onComunaChanged}/></Col>
              <Col xs="4">
                <Row>
                  <Col xs="5">
                    <GradePanel grade="NOTA"/>
                  </Col>
                </Row>
                <Row>
                  <Col xs="10">
                    <GeoInfoPanel comuna={this.state.comuna}/>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col xs="8">
                PANEL HERRAMIENTAS
              </Col>
            </Row>
          </Container>
      );
  }
}

if (document.getElementById('root')) {
    ReactDOM.render(<Main />, document.getElementById('root'));
}
