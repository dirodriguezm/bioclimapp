import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import SwipeableViews from 'react-swipeable-views';
import Morfologia from './Morfologia';
import Context from './Context';
import BarraHerramientasMorfologia from './BarraHerramientasMorfologia';
import BarraHerramientasContexto from './BarraHerramientasContexto';
import Paper from '@material-ui/core/Paper';
import IconButton from "@material-ui/core/IconButton";
import Slide from "@material-ui/core/Slide"
import Drawer from "@material-ui/core/Drawer";
import InformacionEstructura from './InformacionEstructura'
import Tooltip from "@material-ui/core/Tooltip";
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import DetalleBalance from "./DetalleBalance";
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';
import GeoInfoPanel from "./GeoInfoPanel";
import MapContainer from "./MapContainer";

function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 0}}>
            {props.children}
        </Typography>
    );
}

const drawerWidth = 500;

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};
const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
    contentBarra: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    contentRight: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginRight: -drawerWidth,
    },

    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    contentShiftRight: {
        marginRight: -drawerWidth,
    },
    appFrame: {
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%',
    },
});

class TabPanel extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            value: 0,
            click2D: false,
            dibujandoMorf: -1,
            borrandoMorf: false,
            seleccionandoMorf: false,
            sunPosition: null,
            seleccionadoMorf: null,
            openMorf: false,
            dimensionesPared: null,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeIndex = this.handleChangeIndex.bind(this);
        this.onParedesChanged = this.onParedesChanged.bind(this);
        this.onPerspectiveChanged = this.onPerspectiveChanged.bind(this);
        this.onSeleccionandoMorfChanged = this.onSeleccionandoMorfChanged.bind(this);
        this.onBorrandoMorfChanged = this.onBorrandoMorfChanged.bind(this);
        this.onDibujandoMorfChanged = this.onDibujandoMorfChanged.bind(this);
        this.agregarContexto = this.agregarContexto.bind(this);
        this.seleccionar = this.seleccionar.bind(this);
        this.borrarContexto = this.borrarContexto.bind(this);
        this.onFarChanged = this.onFarChanged.bind(this);
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.onSeleccionadoMorfChanged = this.onSeleccionadoMorfChanged.bind(this);
        this.onVentanasChanged = this.onVentanasChanged.bind(this);
        this.onDimensionChanged = this.onDimensionChanged.bind(this);
        this.onCasaChanged = this.onCasaChanged.bind(this);
        this.onRadiationsChanged = this.onRadiationsChanged.bind(this);
        this.onComunaChanged = this.onComunaChanged.bind(this);
        this.onSeleccionarLocalidad = this.onSeleccionarLocalidad.bind(this);
    }

    handleDrawerOpen() {
        this.setState({openMorf: true});
    };

    handleDrawerClose() {
        this.setState({openMorf: false});
    };

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

    onDrawingChanged(drawing) {
        this.setState({dibujo: drawing})
    }

    onPerspectiveChanged() {
        this.setState(prevState => ({
            click2D: !prevState.click2D
        }));
    }

    onComunaChanged(mapState) {
        this.setState({
            comuna: mapState.comuna,
            latitud: mapState.lat,
            longitud: mapState.lng,
            sunTimes: mapState.sunTimes,
            sunPosition: mapState.sunPosition,
        });
    }

    onParedesChanged(paredes) {
        this.props.onParedesChanged(paredes);
    }

    onVentanasChanged(ventanas){
        this.setState({ventanas: ventanas});
    }

    onCasaChanged(aporte_interno, perdida_ventilacion, perdida_conduccion){
        this.props.onCasaChanged(aporte_interno, perdida_ventilacion, perdida_conduccion);
    }

    agregarContexto() {
        this.setState({agregarContexto: true, seleccionar: false, borrarContexto: false});
    }

    seleccionar() {
        this.setState({seleccionar: true, agregarContexto: false, borrarContexto: false});
    }

    borrarContexto() {
        this.setState({borrarContexto: true, seleccionar: false, agregarContexto: false});
    }

    onFarChanged(ventanas) {
        let month = new Date().getMonth();
        let aporte_solar = BalanceEnergetico.calcularAporteSolar(ventanas,this.state.radiaciones.difusa[month].valor, this.state.radiaciones.directa[month].valor);
        console.log("APORTE SOLAR", aporte_solar);
        this.props.onAporteSolarChanged(aporte_solar);
        this.setState({ventanas: ventanas});
    }

    //OJO, es objeto seleccionado desde morfologia
    onSeleccionadoMorfChanged(seleccionado) {
        this.setState({
            seleccionadoMorf: seleccionado,
        });
        this.handleDrawerOpen();
    }

    onSeleccionandoMorfChanged(seleccionando) {
        this.setState({
            seleccionandoMorf: seleccionando
        });
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
        //TODO: borrar handle
        this.handleDrawerClose();
    }

    onDimensionChanged(pared, width, height){
        this.setState({
            dimensionesPared: {
                pared: pared,
                width: width,
                height: height
            }
        });
    }

    onRadiationsChanged(global, direct, difuse){
        this.setState({radiaciones: {global: global, directa: direct, difusa: difuse}});
    }

    onSeleccionarLocalidad(){
        this.setState({
            drawer_localidad: !this.state.drawer_localidad
        })
    }

    render() {
        const {classes, theme, sunPosition} = this.props;
        const {value, click2D, dibujandoMorf, seleccionandoMorf, borrandoMorf, width, height, openMorf, seleccionadoMorf, dimensionesPared} = this.state;

        return (

            <div className={classes.root} ref={(tab) => {
                this.tab = tab
            }}>
                <AppBar position="static">
                    <Tabs value={value} onChange={this.handleChange} fullWidth centered>
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
                        <div className={classes.appFrame}>

                            <main className={classNames(classes.contentRight)}>
                                {this.state.width ?
                                    <Context
                                        width={this.state.width}
                                        height={this.state.height}
                                        sunPosition={this.props.sunPosition}
                                        agregarContexto={this.state.agregarContexto}
                                        seleccionar={this.state.seleccionar}
                                        borrarContexto={this.state.borrarContexto}
                                        onFarChanged={this.onFarChanged}
                                        ventanas={this.state.ventanas}
                                    /> :
                                    <div></div>
                                }
                                <Paper className={classNames(classes.paper, classes.contentBarra, {
                                    [classes.contentShift]: this.state.drawer_localidad,
                                    [classes.contentShiftRight]: this.state.drawer_localidad,
                                })}>
                                    <BarraHerramientasContexto
                                        agregarContexto={this.agregarContexto}
                                        seleccionar={this.seleccionar}
                                        borrarContexto={this.borrarContexto}
                                        onSeleccionarLocalidad={this.onSeleccionarLocalidad}
                                    />
                                </Paper>
                            </main>
                            <Drawer
                                variant='persistent'
                                anchor="right"
                                open={this.state.drawer_localidad}
                                classes={{
                                    paper: classes.drawerPaper,
                                }}
                            >
                                <MapContainer
                                    lat={-36.82013519999999}
                                    lng={-73.0443904}
                                    zoom={12}
                                    markers={[]}
                                    onComunaChanged={this.onComunaChanged}
                                />
                                <GeoInfoPanel
                                    comuna={this.state.comuna}
                                    // width={this.props.width}
                                    // height={this.state.height}
                                    onRadiationsChanged={this.onRadiationsChanged}
                                />
                            </Drawer>

                        </div>
                    </TabContainer>

                    <TabContainer dir={theme.direction}>
                        <div className={classes.appFrame}>
                        <main className={classNames(classes.contentRight)}>
                            {this.state.width ?
                            <Morfologia
                                width={width}
                                height={height}
                                onParedesChanged={this.onParedesChanged}
                                onSeleccionadoChanged={this.onSeleccionadoMorfChanged}
                                sunPosition={this.state.sunPosition}
                                click2D={click2D}
                                dibujando={dibujandoMorf}
                                seleccionando={seleccionandoMorf}
                                borrando={borrandoMorf}
                                onVentanasChanged={this.onVentanasChanged}
                                dimensionesPared={dimensionesPared}
                                paredes={this.props.paredes}
                                comuna={this.state.comuna}
                                onCasaChanged={this.onCasaChanged}
                            /> :
                                <div></div>}
                            <Paper className={classNames(classes.paper, classes.contentBarra, {
                                [classes.contentShift]: openMorf,
                                [classes.contentShiftRight]: openMorf,
                            })}>
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
                        </main>

                            <Drawer
                                variant='persistent'
                                anchor="right"
                                open={openMorf}
                                classes={{
                                    paper: classes.drawerPaper,
                                }}
                            >
                                <InformacionEstructura
                                    seleccionado={seleccionadoMorf}
                                    comuna={this.state.comuna}
                                    ventanas={this.state.ventanas}
                                    onAporteSolarChanged={this.props.onAporteSolarChanged}
                                    onDimensionChanged={this.onDimensionChanged}
                                />
                            </Drawer>

                        </div>
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