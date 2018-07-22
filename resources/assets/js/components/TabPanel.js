import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import SwipeableViews from 'react-swipeable-views';
import Scene from './World';
import Context from './Context';
import BarraHerramientas from './BarraHerramientas';
import Paper from '@material-ui/core/Paper';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 0 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
});

class TabPanel extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      value: 0,
      click2D: false,
      dibujo: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
    this.onComunaChanged = this.onComunaChanged.bind(this);
    this.onParedesChanged = this.onParedesChanged.bind(this);
    this.onPerspectiveChanged = this.onPerspectiveChanged.bind(this);
    this.onDrawingChanged = this.onDrawingChanged.bind(this);
    this.calcularFAR = this.calcularFAR.bind(this);
  }

  componentDidMount(){
    this.setState({
      height:window.innerHeight - 150,
      width: this.tab.clientWidth
    });
  }

  handleChange(event,value){
    this.setState({
      value
    })
  }
  handleChangeIndex(index) {
    this.setState({ value: index });
  };

  onDrawingChanged(drawing){
      this.setState({
          dibujo: drawing
      })
  }

  onPerspectiveChanged(){
      this.setState(prevState => ({
        click2D: !prevState.click2D
      }));
  }

  onComunaChanged(comuna){
    this.props.onComunaChanged(comuna);
  }

  onParedesChanged(paredes){
    this.props.onParedesChanged(paredes);
  }

  calcularFAR(ventanas){
    this.setState({
      ventanas: ventanas
    })
  }

  render() {
    const { classes, theme } = this.props;
    const { value } = this.state;
    return (
      // <div ref={(tab) => { this.tab = tab }}>
      //   <Nav tabs>
      //     <NavItem>
      //       <NavLink
      //         className={classnames({ active: this.state.activeTab === '1' })}
      //         onClick={() => { this.toggle('1'); }}
      //       >
      //         Contexto
      //       </NavLink>
      //     </NavItem>
      //     <NavItem>
      //       <NavLink
      //         className={classnames({ active: this.state.activeTab === '2' })}
      //         onClick={() => { this.toggle('2'); }}
      //       >
      //         Morfología
      //       </NavLink>
      //     </NavItem>
      //
      //   </Nav>
      //   <TabContent activeTab={this.state.activeTab} ref={(tab) => { this.tab = tab }}>
      //     <TabPane tabId="1">
      //       {/* {this.state.width?
      //       <Scene width={this.state.width} height={this.state.height}/> :
      //       <div></div>
      //       } */}
      //     </TabPane>
      //     <TabPane tabId="2">
      //       {this.state.width?
      //         <Scene
      //           width={this.state.width}
      //           height={500}
      //           onParedesChanged={this.onParedesChanged}
      //         /> :
      //         <div></div>
      //       }
      //     </TabPane>
      //     <TabPane tabId="4">
      //       Por definir
      //     </TabPane>
      //   </TabContent>
      // </div>
      <div className={classes.root} ref={(tab) => { this.tab = tab }}>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange} fullWidth >
            <Tab label="Contexto" />
            <Tab label="Morfología" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          <TabContainer dir={theme.direction}>
            {this.state.width?
             <Context
               width={this.state.width}
               height={this.state.height}
               sunPosition={this.props.sunPosition}
               click2D={this.state.click2D}
               dibujo={this.state.dibujo}
               ventanas={this.state.ventanas}
             /> :
             <div></div>
            }
          </TabContainer>
          <TabContainer dir={theme.direction}>
            {this.state.width?
             <Scene
               width={this.state.width}
               height={this.state.height}
               onParedesChanged={this.onParedesChanged}
               sunPosition={this.props.sunPosition}
               click2D={this.state.click2D}
               dibujo={this.state.dibujo}

             /> :
             <div></div>
            }
          </TabContainer>

        </SwipeableViews>
            <Paper className={classes.paper}>
                <BarraHerramientas
                    click2D={false}
                    onPerspectiveChanged={this.onPerspectiveChanged}
                    dibujo={null}
                    onDrawingChanged={this.onDrawingChanged}
                    calcularFAR={this.calcularFAR}
                />
             </Paper>

      </div>
    );
  }
}

TabPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(TabPanel)
