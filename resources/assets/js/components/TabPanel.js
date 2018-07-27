import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import SwipeableViews from 'react-swipeable-views';
import Morfologia from './Morfologia';
import BarraHerramientasMorfologia from './BarraHerramientasMorfologia';
import BarraHerramientasContexto from './BarraHerramientasContexto';
import Paper from '@material-ui/core/Paper';


function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 0}}>
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
            dibujandoMorf: -1,
            borrandoMorf : false,
            seleccionandoMorf : false,
            sunPosition : props.sunPosition,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeIndex = this.handleChangeIndex.bind(this);
        this.onParedesChanged = this.onParedesChanged.bind(this);
        this.onPerspectiveChanged = this.onPerspectiveChanged.bind(this);
        this.onSeleccionandoMorfChanged = this.onSeleccionandoMorfChanged.bind(this);
        this.onBorrandoMorfChanged = this.onBorrandoMorfChanged.bind(this);
        this.onDibujandoMorfChanged = this.onDibujandoMorfChanged.bind(this);
        this.agregarContexto = this.agregarContexto.bind(this);

    }

    componentDidMount() {
        this.setState({
            height: window.innerHeight - 150,
            width: this.tab.clientWidth
        });
    }

    handleChange(event, value) {
        this.setState({
            value
        })
    }

    handleChangeIndex(index) {
        this.setState({value: index});
    };

    onParedesChanged(paredes) {
        this.props.onParedesChanged(paredes);
    }

    agregarContexto() {
        this.setState({agregarContexto: true})
    }

    onPerspectiveChanged(){
        this.setState(prevState => ({
            click2D: !prevState.click2D
        }));
    }
    onSeleccionandoMorfChanged(seleccionando) {
        this.setState({
            seleccionandoMorf: seleccionando});
    }

    onDibujandoMorfChanged(dibujando) {
        this.setState({
            dibujandoMorf: dibujando,
        });
    }

    onBorrandoMorfChanged(borrando) {
        this.setState({
            borrandoMorf: borrando,
        });
    }


    render() {
        const {classes, theme, sunPosition} = this.props;
        const {value, click2D, dibujandoMorf, borrandoMorf, seleccionandoMorf, width, height} = this.state;
        return (

            <div className={classes.root} ref={(tab) => {
                this.tab = tab
            }}>
                <AppBar position="static">
                    <Tabs value={value} onChange={this.handleChange} fullWidth>
                        <Tab label="Contexto"/>
                        <Tab label="Morfología"/>
                    </Tabs>
                </AppBar>
                <SwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={this.state.value}
                    onChangeIndex={this.handleChangeIndex}
                >
                    <TabContainer dir={theme.direction}>
                        {/*{this.state.width ?
                            <Context
                                width={this.state.width}
                                height={this.state.height}
                                sunPosition={this.props.sunPosition}
                                //ventanas={this.state.ventanas}
                                agregarContexto={this.state.agregarContexto}
                            /> :
                            <div></div>
                        }*/}
                        <Paper className={classes.paper}>
                            <BarraHerramientasContexto
                                agregarContexto={this.agregarContexto}
                            />
                        </Paper>
                    </TabContainer>
                    <TabContainer dir={theme.direction} >
                        {this.state.width ?
                            <Morfologia
                                width={width}
                                height={height}
                                onParedesChanged={this.onParedesChanged}
                                sunPosition={sunPosition}
                                click2D={click2D}
                                dibujando={dibujandoMorf}
                                seleccionando={seleccionandoMorf}
                                borrando={borrandoMorf}

                            /> :
                            <div></div>
                        }
                        <Paper className={classes.paper}>
                            <BarraHerramientasMorfologia
                                click2D={click2D}
                                dibujando={dibujandoMorf}
                                borrando={borrandoMorf}
                                seleccionando={seleccionandoMorf}
                                onPerspectiveChanged={this.onPerspectiveChanged}
                                onSeleccionandoMorfChanged={this.onSeleccionandoMorfChanged}
                                onBorrandoMorfChanged={this.onBorrandoMorfChanged}
                                onDibujandoMorfChanged={this.onDibujandoMorfChanged}
                            />
                        </Paper>


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

export default withStyles(styles, {withTheme: true})(TabPanel)
