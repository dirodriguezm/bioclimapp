import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button } from 'reactstrap';
export default class GradePanel extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div>
      <Card>
        {/* <CardImg top width="100%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180" alt="Card image cap" /> */}
        <CardBody>
          <CardTitle>Calificación</CardTitle>
          <CardText>{this.props.grade}</CardText>
        </CardBody>
      </Card>
    </div>
    );
  }
}
