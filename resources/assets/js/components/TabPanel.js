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
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
    this.onComunaChanged = this.onComunaChanged.bind(this);
    this.onParedesChanged = this.onParedesChanged.bind(this);
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

  onComunaChanged(comuna){
    this.props.onComunaChanged(comuna);
  }

  onParedesChanged(paredes){
    this.props.onParedesChanged(paredes);
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
             <Scene
               width={this.state.width}
               height={this.state.height}
               sunPosition={this.props.sunPosition}
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
             /> :
             <div></div>
            }
          </TabContainer>

        </SwipeableViews>
      </div>
    );
  }
}

TabPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(TabPanel)
