import React, {Component} from 'react';
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
import PieChart from '@material-ui/icons/PieChart';
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import InfoVariablesInternas from "./InfoVariablesInternas";

function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 0}}>
            {props.children}
        </Typography>
    );
}

const drawerWidth = 500;
const drawerRightWidth = 400;
const heightBar = 80;
const heightBarra = 70;

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};
const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    appBar: {
        height: heightBar+'px',
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
    appBarShiftRight: {
        marginRight: drawerWidth,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
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
        display: 'flex',
        overflow: 'auto',
        position: 'relative',
        height: 0,
        minHeight: `calc(100% - ${heightBarra}px)`,
        width: drawerRightWidth,
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
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
        height: `calc(100% - ${heightBar}px)`,
        marginTop: heightBar,
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
        height: '100vh'
    },
    frameTabs: {
        zIndex: 1,
        display: 'flex',
        width: '100%',
    },
    hide: {
        display: 'none',
    },
    paper: {
        height: heightBarra,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        background: '#fdfdfd',
    },
    visible: {
        display: 'visible',
    },
    hidden: {
        display: 'none',
    },
    grow: {
        flexGrow: 1,
    }
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
            drawer_localidad: false,
            sunPathClicked: false,
            paredCapaChange: false,
            rotando: false,
            casaPredefinida: -1,
            ventanas: [],
            personas: 5,
            iluminacion: 3,
            temperatura: 14,
            aire: 3,
            rotated: false,
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
        this.handleChangeVariable = this.handleChangeVariable.bind(this);
        this.onAlturaVentanaChanged = this.onAlturaVentanaChanged.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.onRotationChanged = this.onRotationChanged.bind(this);
        this.onRef = this.onRef.bind(this);

    }

    handleDrawerOpen(){
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
            height: this.tab.clientHeight,
            width: this.tab.clientWidth,
        });

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
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

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    onComunaChanged(mapState) {
        this.setState({
            comuna: mapState.comuna,
            latitud: mapState.lat,
            longitud: mapState.lng,
            sunPosition: mapState.sunPosition,
            sunPath: mapState.sunPath,
        });
        if(this.state.paredes != null){
            let paredes_calculadas = BalanceEnergetico.calcularRbParedes(this.state.paredes.slice(), this.state.latitud, this.state.longitud);
            this.setState({paredes: paredes_calculadas});
        }
    }

    onParedesChanged(paredes) {
        let paredes_calculadas = BalanceEnergetico.calcularRbParedes(paredes.slice(), this.state.latitud, this.state.longitud);
        this.setState({paredes: paredes_calculadas});

    }

    onVentanasChanged(ventanas){
        this.setState({ventanas: ventanas});
    }

    onCasaChanged(aporte_interno, perdida_ventilacion,perdida_ventilacion_objetivo, perdida_conduccion,perdida_conduccion_objetivo,volumen, area){
        this.setState({
            aporte_interno: aporte_interno,
            perdida_ventilacion: perdida_ventilacion,
            perdida_ventilacion_objetivo: perdida_ventilacion_objetivo,
            perdida_conduccion: perdida_conduccion,
            perdida_conduccion_objetivo: perdida_conduccion_objetivo,
            volumen: volumen,
            area: area,
        });
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
        if(ventanas.length > 0){
            let month = new Date().getMonth();
            let periodo = ventanas[0].parent.parent.parent.parent.parent.userData.periodo;
            let aporte_solar = BalanceEnergetico.calcularAporteSolar(periodo,ventanas,this.state.radiaciones.difusa[month].valor, this.state.radiaciones.directa[month].valor);
            this.setState({ventanas: ventanas, aporte_solar:aporte_solar.normal, aporte_solar_objetivo: aporte_solar.objetivo});
        }else{
            this.setState({ventanas: ventanas, aporte_solar:0, aporte_solar_objetivo: 0});
        }

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



    onCapaChanged(elemento){
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
            return {drawer_localidad: !state.drawer_localidad, mapDrawer: true}
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
        });
        this.contexto.resetObstrucciones();
        console.log("SE LLAMA");
    }

    handleChangeVariable(prop,value){
        this.setState({[prop]: value});
    };

    onRotationChanged(){
        this.setState({rotated: true});
    }
    onRef(ref){
        this.contexto = ref;
    }



    render() {
        const {classes, theme} = this.props;
        const {value, click2D, dibujandoMorf, seleccionandoMorf, borrandoMorf, width, height, openMorf, seleccionadoMorf, dimensiones, alturaPiso, paredCapaChange} = this.state;
        const heightContent = height-heightBarra;
        console.log("height",height);
        console.log("heightMorfologia",height - (heightBar+heightBarra));
        return (

            <div className={classes.appFrame} ref={(tab) => {
                this.tab = tab
            }} style={{margin:0, padding:0}}>
                <AppBar  className={classNames(classes.appBar, {
                    [classes.appBarShift]: this.state.openDashboard ,
                    [classes.appBarShiftLeft]: this.state.openDashboard,
                })}

                >
                    <Toolbar className={classes.toolbar}>
                        <IconButton
                            color="inherit"
                            aria-label="Dashboard"
                            onClick={this.handleDashboardOpen}
                            className={classNames(classes.menuButton)}
                        >
                            <PieChart />
                        </IconButton>
                        <Tabs value={value} onChange={this.handleChange}  centered>
                            <Tab label="Morfología"/>
                            <Tab label="Emplazamiento"/>
                            <Tab label="Variables Internas"/>
                        </Tabs>
                        <div style={{
                            marginLeft: 'auto',}}>
                            <Typography variant="button" color="inherit"  >
                                Diseño bioclimático de viviendas
                            </Typography>
                            <Typography style={{
                                fontSize: 'x-small',}}align={'center'} variant="button" color="inherit"  >
                                Por
                            </Typography>
                            <Typography style={{
                                fontSize: 'x-small',}}align={'center'} variant="button" color="inherit"  >
                                Matias Medina y Diego Rodriguez
                            </Typography>
                        </div>
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
                        aporte_solar_objetivo={this.state.aporte_solar_objetivo}
                        aporte_interno={this.state.aporte_interno}
                        perdida_conduccion={this.state.perdida_conduccion}
                        perdida_conduccion_objetivo={this.state.perdida_conduccion_objetivo}
                        perdida_ventilacion={this.state.perdida_ventilacion}
                        perdida_ventilacion_objetivo={this.state.perdida_ventilacion_objetivo}
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
                            [classes.contentShift]: !openMorf,
                            [classes.contentShiftRight]: !openMorf,
                        })}>
                            <TabContainer dir={theme.direction}>
                                {this.state.width ?
                                    <Morfologia
                                        width={width}
                                        height={height - (heightBar+heightBarra)}
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
                                        personas={this.state.personas}
                                        iluminacion={this.state.iluminacion}
                                        temperatura={this.state.temperatura}
                                        aire={this.state.aire}
                                        onRotationChanged={this.onRotationChanged}
                                    />:
                                    <div></div>
                                }
                                <Paper className={classes.paper} >
                                    <BarraHerramientasMorfologia
                                        width={this.state.width}
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

                            style={{visibility: openMorf ? 'visible' : 'hidden'}}
                            classes={{
                                paper: classes.drawerRightPaper,
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
                    <div className={classes.frameTabs}>
                        <div className={classNames(classes.contentInside, classes.contentRight, {
                            [classes.contentShift]: !this.state.drawer_localidad ,
                            [classes.contentShiftRight]: !this.state.drawer_localidad ,

                        })}>
                            <TabContainer dir={theme.direction}>
                                {this.state.width ?
                                    <Context
                                        width={this.state.width}
                                        height={height - (heightBar+heightBarra)}
                                        sunPosition={this.state.sunPosition}
                                        agregarContexto={this.state.agregarContexto}
                                        seleccionar={this.state.seleccionar}
                                        borrarContexto={this.state.borrarContexto}
                                        onFarChanged={this.onFarChanged}
                                        ventanas={this.state.ventanas}
                                        rotated={this.state.rotated}
                                        onRef={this.onRef}
                                    /> :
                                    <div></div>
                                }
                                <Paper className={classes.paper}>
                                    <BarraHerramientasContexto
                                        width={this.state.width}
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
                            style={{visibility: this.state.drawer_localidad ? 'visible' : 'hidden'}}

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
                                temperatura={this.state.temperatura}
                                onRadiationsChanged={this.onRadiationsChanged}
                            />
                        </Drawer>
                    </div>


                    <TabContainer  dir={theme.direction}>
                        <InfoVariablesInternas
                            handleChange={this.handleChangeVariable}
                            handleClose={this.handleCloseVarDash}
                        />
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