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
import Drawer from "@material-ui/core/Drawer";
import InformacionEstructura from './InformacionEstructura'
import DetalleBalance from "./DetalleBalance";
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';
import GeoInfoPanel from "./GeoInfoPanel";
import MapContainer from "./MapContainer";
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import PieChart from '@material-ui/icons/PieChart';
import Toolbar from "@material-ui/core/Toolbar/Toolbar";

function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 0}}>
            {props.children}
        </Typography>
    );
}

const drawerWidth = 500;
const drawerRightWidth = 500;

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};
const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    appBar: {
        position: 'absolute',
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    appBarShiftLeft: {
        marginLeft: drawerWidth,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 20,
    },
    drawerPaper: {
        position: 'relative',
        height: '100vh',
        width: drawerWidth,
    },
    drawerRightPaper:{
        position: 'relative',
        height: '90vh',
        width: drawerRightWidth
    },
    contentBarra: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        paddingTop: theme.spacing.unit * 9,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    contentInside: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    contentLeft: {
        marginLeft: -drawerWidth,
    },
    contentRight: {
        marginRight: -drawerRightWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    contentShiftLeft: {
        marginLeft: 0,
    },
    contentShiftRight: {
        marginRight: 0,
    },
    appFrame: {
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%',
    },
    frameTabs: {
        zIndex: 1,
        display: 'flex',
        width: '100%',
    },
    hide: {
        display: 'none',
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
            dimensiones: null,
            alturaPiso: null,
            openDashboard: false,
            drawer_localidad: true,
            sunPathClicked: false,
            paredCapaChange: false,
            rotando: false,
            casaPredefinida: -1,
            ventanas: []
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
        this.onAporteSolarChanged = this.onAporteSolarChanged.bind(this);
        this.handleDashboardOpen = this.handleDashboardOpen.bind(this);
        this.onSunPathClicked = this.onSunPathClicked.bind(this);
        this.onCapaChanged = this.onCapaChanged.bind(this);
        this.onCapaReady = this.onCapaReady.bind(this);
        this.onRotationClicked = this.onRotationClicked.bind(this);
        this.onCasaPredefinidaChanged = this.onCasaPredefinidaChanged.bind(this);
        this.onAlturaVentanaChanged = this.onAlturaVentanaChanged.bind(this);

    }

    handleDrawerOpen() {
        this.setState({openMorf: true});
    };

    handleDrawerClose() {
        this.setState({openMorf: false});
    };

    handleDashboardOpen(){
        if(this.state.openDashboard){
            let width = this.state.width;
            this.setState({width: width + drawerWidth });
        }
        else {
            let width = this.state.width;
            this.setState({width: width - drawerWidth });
        }
        this.setState({openDashboard: !this.state.openDashboard});
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
            sunPosition: mapState.sunPosition,
            sunPath: mapState.sunPath,
        });
    }

    onParedesChanged(paredes) {
        let paredes_calculadas = BalanceEnergetico.calcularRbParedes(paredes.slice(), this.state.latitud, this.state.longitud);
        this.setState({paredes: paredes_calculadas});

    }

    onVentanasChanged(ventanas){
        this.setState({ventanas: ventanas});
    }

    onCasaChanged(aporte_interno, perdida_ventilacion, perdida_conduccion,volumen, area){
        this.setState({aporte_interno: aporte_interno, perdida_ventilacion: perdida_ventilacion, perdida_conduccion: perdida_conduccion, volumen: volumen, area: area});
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
        let periodo = ventanas[0].parent.parent.parent.parent.parent.userData.periodo;
        let aporte_solar = BalanceEnergetico.calcularAporteSolar(periodo,ventanas,this.state.radiaciones.difusa[month].valor, this.state.radiaciones.directa[month].valor);
        this.setState({ventanas: ventanas, aporte_solar:aporte_solar});
    }

    onAporteSolarChanged(aporte_solar){
        this.setState({aporte_solar: aporte_solar});
    }

    //OJO, es objeto seleccionado desde morfologia
    onSeleccionadoMorfChanged(seleccionado) {
        this.setState({
            seleccionadoMorf: seleccionado,
            seleccionandoMorf: false,
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

    onDimensionChanged(elemento, width, height){
        this.setState({
            dimensiones: {
                elemento: elemento,
                width: width,
                height: height,
            }
        });
    }
    onAlturaVentanaChanged(ventana, altura){
        this.setState({
            alturaPiso: {
                ventana: ventana,
                altura: altura,
            }
        })
    }



    onCapaChanged(){
        this.setState({
            paredCapaChange: true,
        })
    }

    onCapaReady(){
        this.setState({
            paredCapaChange: false,
        })
    }

    onRadiationsChanged(global, direct, difuse){
        this.setState({radiaciones: {global: global, directa: direct, difusa: difuse}});
    }

    onSeleccionarLocalidad(){
        this.setState((state) => {
            return {drawer_localidad: !state.drawer_localidad}
        });
    }
    onSunPathClicked(){
        this.setState( (state) => {return {sunPathClicked: !state.sunPathClicked}});
    }

    onRotationClicked(rotando){
        this.setState({rotando: rotando});
    }
    onCasaPredefinidaChanged(casaPredefinida){
        this.setState({
            casaPredefinida : casaPredefinida,
        })
    }


    render() {
        const {classes, theme, sunPosition} = this.props;
        const {value, click2D, dibujandoMorf, seleccionandoMorf, borrandoMorf, width, height, openMorf, seleccionadoMorf, dimensiones, alturaPiso, paredCapaChange} = this.state;
        return (

            <div className={classes.appFrame} ref={(tab) => {
                this.tab = tab
            }} style={{margin:0, padding:0}}>
                <AppBar  className={classNames(classes.appBar, {
                    [classes.appBarShift]: this.state.openDashboard,
                    [classes.appBarShiftLeft]: this.state.openDashboard,
                })}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="Dashboard"
                            onClick={this.handleDashboardOpen}
                            className={classNames(classes.menuButton)}
                        >
                            <PieChart />
                        </IconButton>
                        <Tabs value={value} onChange={this.handleChange}  centered>
                            <Tab label="Emplazamiento"/>
                            <Tab label="Morfología"/>
                        </Tabs>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="persistent"
                    anchor={'left'}
                    open={this.state.openDashboard}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <DetalleBalance
                        aporte_solar={this.state.aporte_solar}
                        aporte_interno={this.state.aporte_interno}
                        perdida_conduccion={this.state.perdida_conduccion}
                        perdida_ventilacion={this.state.perdida_ventilacion}
                        volumen={this.state.volumen}
                        area={this.state.area}
                    />
                </Drawer>
                <SwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={this.state.value}
                    onChangeIndex={this.handleChangeIndex}
                    className={classNames(classes.content, classes.contentLeft, {
                        [classes.contentShift]: this.state.openDashboard,
                        [classes.contentShiftLeft]: this.state.openDashboard,
                    })}
                >
                    <div className={classes.frameTabs}>
                        <div className={classNames(classes.contentInside, classes.contentRight, {
                            [classes.contentShift]: this.state.drawer_localidad,
                            [classes.contentShiftRight]: this.state.drawer_localidad,
                        })}>
                            <TabContainer dir={theme.direction}>
                                {this.state.width ?
                                    <Context
                                        width={this.state.width}
                                        height={this.state.height}
                                        sunPosition={this.state.sunPosition}
                                        agregarContexto={this.state.agregarContexto}
                                        seleccionar={this.state.seleccionar}
                                        borrarContexto={this.state.borrarContexto}
                                        onFarChanged={this.onFarChanged}
                                        ventanas={this.state.ventanas}
                                    /> :
                                    <div></div>
                                }
                                <Paper className={classes.paper}>
                                    <BarraHerramientasContexto
                                        agregarContexto={this.agregarContexto}
                                        seleccionar={this.seleccionar}
                                        borrarContexto={this.borrarContexto}
                                        onSeleccionarLocalidad={this.onSeleccionarLocalidad}
                                    />
                                </Paper>
                            </TabContainer>
                        </div>
                        <Drawer
                            variant="persistent"
                            anchor={'right'}
                            open={this.state.drawer_localidad}
                            classes={{
                                paper: classes.drawerRightPaper,
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

                    <div className={classes.frameTabs}>
                        <div className={classNames(classes.contentInside, classes.contentRight, {
                            [classes.contentShift]: !openMorf,
                            [classes.contentShiftRight]: !openMorf,
                        })}>
                            <TabContainer dir={theme.direction}>
                                {this.state.width ?
                                    <Morfologia
                                        width={width}
                                        height={height}
                                        onParedesChanged={this.onParedesChanged}
                                        onSeleccionadoChanged={this.onSeleccionadoMorfChanged}
                                        sunPosition={this.state.sunPosition}
                                        sunPath={this.state.sunPath}
                                        click2D={click2D}
                                        dibujando={dibujandoMorf}
                                        seleccionando={seleccionandoMorf}
                                        borrando={borrandoMorf}
                                        onVentanasChanged={this.onVentanasChanged}
                                        dimensiones={dimensiones}
                                        alturaPiso={alturaPiso}
                                        paredes={this.props.paredes}
                                        comuna={this.state.comuna}
                                        onCasaChanged={this.onCasaChanged}
                                        onCapaReady={this.onCapaReady}
                                        paredCapaChange={paredCapaChange}
                                        seleccionadoMorf={seleccionadoMorf}
                                        sunPathClicked={this.state.sunPathClicked}
                                        rotando={this.state.rotando}
                                        casaPredefinida={this.state.casaPredefinida}
                                        onCasaPredefinidaChanged={this.onCasaPredefinidaChanged}
                                    />:
                                    <div></div>
                                }
                                <Paper className={classes.paper}>
                                    <BarraHerramientasMorfologia
                                        click2D={click2D}
                                        dibujando={dibujandoMorf}
                                        borrando={borrandoMorf}
                                        seleccionando={seleccionandoMorf}
                                        rotando={this.state.rotando}
                                        casaPredefinida={this.state.casaPredefinida}
                                        onPerspectiveChanged={this.onPerspectiveChanged}
                                        onSeleccionandoMorfChanged={this.onSeleccionandoMorfChanged}
                                        onBorrandoMorfChanged={this.onBorrandoMorfChanged}
                                        onDibujandoMorfChanged={this.onDibujandoMorfChanged}
                                        onSunPathClicked={this.onSunPathClicked}
                                        onRotationClicked={this.onRotationClicked}
                                        onCasaPredefinidaChanged={this.onCasaPredefinidaChanged}
                                    />
                                </Paper>
                            </TabContainer>
                        </div>
                        <Drawer
                            variant='persistent'
                            anchor='right'
                            open={openMorf}
                            hidden={!openMorf}
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                        >
                            <InformacionEstructura
                                seleccionado={seleccionadoMorf}
                                comuna={this.state.comuna}
                                ventanas={this.state.ventanas}
                                onAporteSolarChanged={this.onAporteSolarChanged}
                                onDimensionChanged={this.onDimensionChanged}
                                onAlturaVentanaChanged={this.onAlturaVentanaChanged}
                                onCapaChanged={this.onCapaChanged}
                            />
                        </Drawer>
                    </div>
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