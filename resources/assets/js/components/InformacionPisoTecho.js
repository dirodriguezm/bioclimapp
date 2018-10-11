import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Morfologia from "./Morfologia";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import axios from 'axios';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import { createMuiTheme } from '@material-ui/core/styles';

import Add from '@material-ui/icons/Add';
import Clear from '@material-ui/icons/Clear';
import AddToPhotos from '@material-ui/icons/AddToPhotos'
import IconButton from '@material-ui/core/IconButton';
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent/CardContent";

const ITEM_HEIGHT = 48;

const styles = theme => ({
    titulo:{
        margin: theme.spacing.unit*2,
    },

    button: {
        margin: theme.spacing.unit,
        width: 32, height: 32,
    },
    root: {
        width: '100%',
    },
    formControl: {
        width: '100%',
        'box-sizing': 'border-box',
    },
    textField: {
        width: 100,
    },
    textRotation: {
        marginLeft: '75%',
        '-mozTransform': 'rotate(90deg)',
        '-webkitTransform' : 'rotate(90deg)',
        '-msTransform' : 'rotate(90deg)',
        '-oTransform:' : 'rotate(90deg)',
        'transform:' : 'rotate(90deg)',
        '-msFilter' : 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)',
        whiteSpace: 'nowrap',
        left: '50%',
        height: 0,
        width: 0,
        '-webkitUserSelect' : 'none',
        '-khtmlUserSelect' : 'none',
        '-mozUserSelect' : 'none',
        '-msUserSelect' : 'none',
        '-userSelect' : 'none',

},
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    paper: {
        height: 250,
        flexDirection: 'column',
        textAlign: 'center',
        overflow: 'hidden',
        elevation:24
    },
    paperAdd: {
        height: 250,
        overflow: 'hidden',
        elevation:24
    },

});


class InformacionPisoTecho extends Component {

    constructor(props) {
        super(props);

        this.state = {
            capasPiso: [],
            capasTecho: [],
            capaSeleccionadaPiso : null,
            capaSeleccionadaTecho : null,
        };
        this.vaciosArrayPiso = [];
        this.vaciosArrayTecho = [];
        this.info_material = [];
        this.themes = [];
        axios.get("https://bioclimapp.host/api/info_materiales")
            .then(response => this.getJson(response));
        this.handleChange = this.handleChange.bind(this);
        this.handleClickAgregarPiso = this.handleClickAgregarPiso.bind(this);
        this.handleClickAgregarTecho = this.handleClickAgregarTecho.bind(this);
        this.handleClickBorrarPiso = this.handleClickBorrarPiso.bind(this);
        this.handleClickBorrarTecho = this.handleClickBorrarTecho.bind(this);
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeCapaPiso = this.handleChangeCapaPiso.bind(this);
        this.handleChangeCapaTecho = this.handleChangeCapaTecho.bind(this);
        this.clickCapaPiso = this.clickCapaPiso.bind(this);
        this.clickCapaTecho = this.clickCapaTecho.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.seleccionado !== prevProps.seleccionado && this.props.seleccionado.userData.tipo === Morfologia.tipos.PISO) {
            if (this.props !== null) {
                let seleccionados;
                if(this.props.seleccionado.userData.techo !== undefined){
                    seleccionados = [this.props.seleccionado, this.props.seleccionado.userData.techo];
                }else{
                    seleccionados = [this.props.seleccionado];
                }
                for(let seleccionado of seleccionados){
                    let capas = seleccionado.userData.capas;
                    for (let i = 0; i < capas.length; i++) {
                        capas[i].index = i;
                    }

                    let capasVacias = 9 - capas.length - 1;
                    this['vaciosArray'+Morfologia.tipos_texto[seleccionado.userData.tipo]] = [];
                    for(let i = 0 ; i < capasVacias ; i++){
                        this['vaciosArray'+Morfologia.tipos_texto[seleccionado.userData.tipo]].push(i);
                    }
                    
                    let nombreCapa = 'capas'+Morfologia.tipos_texto[seleccionado.userData.tipo];
                    let nombreCapaS = 'capaSeleccionada'+Morfologia.tipos_texto[seleccionado.userData.tipo];
                    
                    this.setState({
                        [nombreCapa]: capas,
                        [nombreCapaS]: null,
                    });
                }
                this.setState({
                    width: this.props.seleccionado.userData.width,
                    depth: this.props.seleccionado.userData.depth,
                })
            }
        }

    }
    getJson(response) {

        this.info_material = response.data.slice();
        for (let i = 0; i < this.info_material.length; i++) {
            this.info_material[i].index = i;

            var theme = createMuiTheme({
                palette: {
                    primary: {
                        main: this.info_material[i].color,
                    },
                },
            });
            this.info_material[i].textColor = theme.palette.primary.contrastText;


            if (this.info_material[i].hasOwnProperty('tipos')) {
                for (let j = 0; j < this.info_material[i].tipos.length; j++) {
                    this.info_material[i].tipos[j].index = j;
                    for (let k = 0; k < this.info_material[i].tipos[j].propiedades.length; k++) {
                        this.info_material[i].tipos[j].propiedades[k].index = k;
                    }
                }
            } else {
                for (let k = 0; k < this.info_material[i].propiedades.length; k++) {
                    this.info_material[i].propiedades[k].index = k;
                }
            }
        }
        var theme = createMuiTheme({
            palette: {
                primary: {
                    main: "#fc0f4f",
                },
            },
        });
        this.colorSelected = [theme.palette.primary.main,theme.palette.primary.contrastText];
        this.colorSelected = [theme.palette.primary.main,theme.palette.primary.contrastText];
    }


    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    handleChangeCapaPiso(event){
        let capas = this.state.capasPiso;
        let capa = capas[this.state.capaSeleccionadaPiso];

        if(event.target.name === 'material'){
            if(this.info_material[event.target.value].hasOwnProperty('tipos')){
                capa.tipo = 0;
                capa.propiedad = 0;
            }else{
                capa.propiedad = 0;
            }
        }

        if(event.target.name === 'tipo'){
            capa.propiedad = 0;

        }

        capa[event.target.name] = event.target.value;

        let conductividad;

        if(this.info_material[capa.material].hasOwnProperty('tipos')){
            conductividad = this.info_material[capa.material].tipos[capa.tipo].propiedades[capa.propiedad].conductividad;
        }else{
            conductividad = this.info_material[capa.material].propiedades[capa.propiedad].conductividad;

        }
        capa.conductividad = conductividad;

        if(event.target.name === 'espesor'){
            capa.espesor = event.target.value/1000;
        }

        //TODO: metodos para cambiar la capa
        //this.props.onCapaChanged();

        this.setState({
            capasPiso: capas,
        })
    }

    handleChangeCapaTecho(event){
        let capas = this.state.capasTecho;
        let capa = capas[this.state.capaSeleccionadaTecho];

        if(event.target.name === 'material'){
            if(this.info_material[event.target.value].hasOwnProperty('tipos')){
                capa.tipo = 0;
                capa.propiedad = 0;
            }else{
                capa.propiedad = 0;
            }
        }

        if(event.target.name === 'tipo'){
            capa.propiedad = 0;

        }

        capa[event.target.name] = event.target.value;

        let conductividad;

        if(this.info_material[capa.material].hasOwnProperty('tipos')){
            conductividad = this.info_material[capa.material].tipos[capa.tipo].propiedades[capa.propiedad].conductividad;
        }else{
            conductividad = this.info_material[capa.material].propiedades[capa.propiedad].conductividad;

        }
        capa.conductividad = conductividad;

        if(event.target.name === 'espesor'){
            capa.espesor = event.target.value/1000;
        }

        //TODO: metodos para cambiar la capa
        //this.props.onCapaChanged();

        this.setState({
            capasTecho: capas,
        })
    }

    handleChangeDimension(event) {
        let piso = this.props.seleccionado;
        let depth = piso.userData.depth, width = piso.userData.width;
        if (event.target.name === 'profundidad') {
            if(parseInt(event.target.value) >= depth){
                depth += 1;
            }else{
                depth -= 1;
            }
        } else {
            if(parseInt(event.target.value) >= width){
                width += 1;
            }else{
                width -= 1;
            }
        }
        this.props.onDimensionChanged(piso, width, depth);
    }

    handleClickBorrarPiso(event) {
        let capas = this.state.capasPiso;
        capas.splice(event.target.value, 1);


        for (let i = 0; i < capas.length; i++) {
            capas[i].index = i;
        }

        let capasVacias = 9 - capas.length - 1;
        this.vaciosArrayPiso = [];
        for(let i = 0 ; i < capasVacias ; i++){
            this.vaciosArrayPiso.push(i);
        }

        if(this.state.capaSeleccionadaPiso === event.target.value){
            this.setState({
                capaSeleccionadaPiso: null,
            })
        }

        //this.props.onCapaChanged();

        this.setState({
            capasPiso: capas,
        })
    }

    handleClickBorrarTecho(event) {
        let capas = this.state.capasTecho;
        capas.splice(event.target.value, 1);


        for (let i = 0; i < capas.length; i++) {
            capas[i].index = i;
        }

        let capasVacias = 9 - capas.length - 1;
        this.vaciosArrayTecho = [];
        for(let i = 0 ; i < capasVacias ; i++){
            this.vaciosArrayTecho.push(i);
        }

        if(this.state.capaSeleccionadaTecho === event.target.value){
            this.setState({
                capaSeleccionadaTecho: null,
            })
        }

        //this.props.onCapaChanged();

        this.setState({
            capasTecho: capas,
        })
    }

    clickCapaPiso(event) {
        let capaSeleccionadaPiso = parseInt(event.target.attributes.value.value );
        if(this.state.capasPiso[capaSeleccionadaPiso] !== undefined){
            this.setState({
                capaSeleccionadaPiso: capaSeleccionadaPiso,
            });
        }else{
            this.setState({
                capaSeleccionadaPiso: null,
            });
        }
    }

    clickCapaTecho(event) {
        let capaSeleccionadaTecho = parseInt(event.target.attributes.value.value );
        if(this.state.capasTecho[capaSeleccionadaTecho] !== undefined){
            this.setState({
                capaSeleccionadaTecho: capaSeleccionadaTecho,
            });
        }else{
            this.setState({
                capaSeleccionadaTecho: null,
            });
        }
    }

    handleClickAgregarPiso() {
        let capas = this.state.capasPiso;
        capas.push({
            material: 0,
            tipo: null,
            espesor: 0.01,
            propiedad: 0,
            conductividad: this.info_material[0].propiedades[0].conductividad,
        });

        for (let i = 0; i < capas.length; i++) {
            capas[i].index = i;
        }

        let capasVacias = 9 - capas.length - 1;
        this.vaciosArrayPiso = [];
        for(let i = 0 ; i < capasVacias ; i++){
            this.vaciosArrayPiso.push(i);
        }

        this.setState({
            capaSeleccionadaPiso: capas.length-1,
        });


        this.setState({
            capasPiso: capas,
        })

        //this.props.onCapaChanged();

    }

    handleClickAgregarTecho() {
        let capas = this.state.capasTecho;
        capas.push({
            material: 0,
            tipo: null,
            espesor: 0.01,
            propiedad: 0,
            conductividad: this.info_material[0].propiedades[0].conductividad,
        });

        for (let i = 0; i < capas.length; i++) {
            capas[i].index = i;
        }

        let capasVacias = 9 - capas.length - 1;
        this.vaciosArrayTecho = [];
        for(let i = 0 ; i < capasVacias ; i++){
            this.vaciosArrayTecho.push(i);
        }

        this.setState({
            capaSeleccionadaTecho: capas.length-1,
        });


        this.setState({
            capasTecho: capas,
        })

        //this.props.onCapaChanged();

    }

    render() {
        
        const {classes, seleccionado} = this.props;
        let pisoSeleccionado = seleccionado;
        let techoSeleccionado;
        let depth, width;
        if(pisoSeleccionado !== null && pisoSeleccionado.userData.tipo === Morfologia.tipos.PISO){
            techoSeleccionado = seleccionado.userData.techo;
            depth = pisoSeleccionado.userData.depth;
            width = pisoSeleccionado.userData.width;
        }else{
            techoSeleccionado = null;
        }
        const {capasPiso, capasTecho, capaSeleccionadaPiso, capaSeleccionadaTecho} = this.state;

        let materialPiso ,tipoPiso ,espesorPiso ,propiedadPiso ;
        let materialTecho ,tipoTecho ,espesorTecho ,propiedadTecho ;

        if(capaSeleccionadaPiso !== null){
            materialPiso = capasPiso[capaSeleccionadaPiso].material;
            tipoPiso = capasPiso[capaSeleccionadaPiso].tipo;
            espesorPiso = capasPiso[capaSeleccionadaPiso].espesor;
            propiedadPiso = capasPiso[capaSeleccionadaPiso].propiedad;
        }

        if(capaSeleccionadaTecho !== null){
            materialTecho = capasTecho[capaSeleccionadaTecho].material;
            tipoTecho = capasTecho[capaSeleccionadaTecho].tipo;
            espesorTecho = capasTecho[capaSeleccionadaTecho].espesor;
            propiedadTecho = capasTecho[capaSeleccionadaTecho].propiedad;
        }

        let hasTiposPiso;
        let hasTiposTecho;

        if (pisoSeleccionado !== null && this.info_material.length > 0 && pisoSeleccionado.userData.tipo === Morfologia.tipos.PISO && capaSeleccionadaPiso !== null) {
            hasTiposPiso = this.info_material[materialPiso].hasOwnProperty('tipos');
        } else {
            hasTiposPiso = null;
        }

        if (techoSeleccionado !== null && this.info_material.length > 0 && capaSeleccionadaTecho !== null) {
            hasTiposTecho = this.info_material[materialTecho].hasOwnProperty('tipos');
        } else {
            hasTiposTecho = null;
        }

        return (
            <div>
                {pisoSeleccionado !== null && pisoSeleccionado.userData.tipo === Morfologia.tipos.PISO ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            className={classes.titulo}
                        >
                            {techoSeleccionado !== undefined ?
                                <div>{'Configuracion '+ Morfologia.tipos_texto[pisoSeleccionado.userData.tipo]
                                +' y '+ Morfologia.tipos_texto[techoSeleccionado.userData.tipo]

                                }</div>
                                :
                                <div>{'Configuracion '+ Morfologia.tipos_texto[pisoSeleccionado.userData.tipo]}</div>
                            }

                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Capas piso</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={0}>
                                            {capasPiso.map(capa => (
                                                <Grid item xs>
                                                    {capaSeleccionadaPiso === capa.index ?
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.colorSelected[0]}}
                                                               value={capa.index}
                                                               onClick={this.clickCapaPiso}
                                                               elevation={0}
                                                        >
                                                            <IconButton style={{color: this.colorSelected[1]}}
                                                                        className={classes.button}
                                                                        value={capa.index}
                                                                        onClick={this.handleClickBorrarPiso}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.info_material[capa.material].hasOwnProperty('tipos') ?
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.colorSelected[1]}}
                                                                        value={capa.index}
                                                                        onClick={this.clickCapaPiso}>
                                                                        {this.info_material[capa.material].material + this.info_material[capa.material].tipos[capa.tipo].nombre}
                                                                    </Typography>
                                                                </div>
                                                                :
                                                                <Typography
                                                                    className={classes.textRotation}
                                                                    style={{color: this.colorSelected[1]}}
                                                                    value={capa.index}
                                                                    onClick={this.clickCapaPiso}>
                                                                    {this.info_material[capa.material].material}
                                                                </Typography>
                                                            }
                                                        </Paper> :
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.info_material[capa.material].color}}
                                                               value={capa.index}
                                                               onClick={this.clickCapaPiso}
                                                                elevation={10}
                                                        >
                                                            <IconButton style={{color: this.info_material[capa.material].textColor}}
                                                                        className={classes.button}
                                                                        value={capa.index}
                                                                        onClick={this.handleClickBorrarPiso}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.info_material[capa.material].hasOwnProperty('tipos') ?
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.info_material[capa.material].textColor}}
                                                                        value={capa.index}
                                                                        onClick={this.clickCapaPiso}>
                                                                        {this.info_material[capa.material].material + this.info_material[capa.material].tipos[capa.tipo].nombre}
                                                                    </Typography>

                                                                </div>
                                                                :
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.info_material[capa.material].textColor}}
                                                                        value={capa.index}
                                                                        onClick={this.clickCapaPiso}>
                                                                        {this.info_material[capa.material].material}
                                                                    </Typography>
                                                                </div>
                                                            }
                                                        </Paper>
                                                    }
                                                </Grid>
                                            ), this)}

                                            {9 - capasPiso.length - 1 >= 0 ?
                                                <Grid item xs>
                                                    <Paper className={classes.paperAdd}>
                                                        <IconButton
                                                            style={{margin: 0,
                                                                position: 'relative',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',}}
                                                            className={classes.button}
                                                            onClick={this.handleClickAgregarPiso}>
                                                            <Add/>
                                                        </IconButton>
                                                    </Paper>
                                                </Grid> : <div></div>
                                            }

                                            {this.vaciosArrayPiso.map(vacio => (
                                                <Grid item xs>
                                                    <Paper className={classes.paper}>
                                                    </Paper>
                                                </Grid>
                                            ), this)}

                                        </Grid>

                                    </Grid>

                                    {capaSeleccionadaPiso !== null ?
                                        <Grid container spacing={8}>
                                            {hasTiposPiso ?
                                                <Grid container spacing={0} style={{
                                                    marginTop : 12,
                                                    marginBottom : 4,
                                                    marginLeft : 4,
                                                    marginRight : 4,}}>
                                                    <Grid item xs={6}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="material-simple">Material</InputLabel>
                                                            <Select
                                                                value={materialPiso}
                                                                onChange={this.handleChangeCapaPiso}
                                                                input={<Input name="material" id="material-simple"/>}
                                                            >
                                                                {this.info_material.map(material => (
                                                                    <MenuItem value={material.index}>
                                                                        {material.material}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="tipo-simple">Tipo</InputLabel>
                                                            <Select
                                                                value={tipoPiso}
                                                                onChange={this.handleChangeCapaPiso}
                                                                input={<Input name="tipo" id="tipo-simple"/>}
                                                            >
                                                                {this.info_material[materialPiso].tipos.map(tipo => (
                                                                    <MenuItem value={tipo.index}>
                                                                        {tipo.nombre}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                                 : <Grid item xs={12} style={{
                                                     marginTop : 8,
                                                }}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="material-simple">Material</InputLabel>
                                                        <Select
                                                            value={materialPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="material" id="material-simple"/>}
                                                        >
                                                            {this.info_material.map(material => (
                                                                <MenuItem value={material.index}>
                                                                    {material.material}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            }
                                            {hasTiposPiso ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedadPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[materialPiso].tipos[tipoPiso].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad !== -1 ? propiedades.densidad
                                                                    : "No tiene"}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>  : <div/>
                                            }

                                            {hasTiposPiso ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                        <Select
                                                            value={propiedadPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[materialPiso].tipos[tipoPiso].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.conductividad}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }
                                            {!hasTiposPiso?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedadPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[materialPiso].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad !== -1 ? propiedades.densidad
                                                                        : "No tiene"}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>  : <div/>
                                            }

                                            {!hasTiposPiso ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                        <Select
                                                            value={propiedadPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[materialPiso].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.conductividad}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }
                                            <Grid item xs={4}>
                                                <FormControl className={classes.formControl}>
                                                    <TextField
                                                        label="Espesor (mm)"
                                                        name="espesor"
                                                        value={1000*espesorPiso}
                                                        onChange={this.handleChangeCapaPiso}
                                                        type="number"
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                </FormControl>
                                            </Grid>

                                        </Grid> : <div/>
                                    }
                                    </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        {techoSeleccionado !== undefined  ?
                            <ExpansionPanel>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography className={classes.heading}>Capas techo</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Grid container spacing={8}>
                                        <Grid item xs={12}>
                                            <Grid container spacing={0}>
                                                {capasTecho.map(capa => (
                                                    <Grid item xs>
                                                        {capaSeleccionadaTecho === capa.index ?
                                                            <Paper className={classes.paper}
                                                                   style={{backgroundColor: this.colorSelected[0]}}
                                                                   value={capa.index}
                                                                   onClick={this.clickCapaTecho}
                                                                   elevation={0}
                                                            >
                                                                <IconButton style={{color: this.colorSelected[1]}}
                                                                            className={classes.button}
                                                                            value={capa.index}
                                                                            onClick={this.handleClickBorrarTecho}

                                                                >
                                                                    <Clear/>
                                                                </IconButton>
                                                                {this.info_material[capa.material].hasOwnProperty('tipos') ?
                                                                    <div>
                                                                        <Typography
                                                                            className={classes.textRotation}
                                                                            style={{color: this.colorSelected[1]}}
                                                                            value={capa.index}
                                                                            onClick={this.clickCapaTecho}>
                                                                            {this.info_material[capa.material].material + this.info_material[capa.material].tipos[capa.tipo].nombre}
                                                                        </Typography>
                                                                    </div>
                                                                    :
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.colorSelected[1]}}
                                                                        value={capa.index}
                                                                        onClick={this.clickCapaTecho}>
                                                                        {this.info_material[capa.material].material}
                                                                    </Typography>
                                                                }
                                                            </Paper> :
                                                            <Paper className={classes.paper}
                                                                   style={{backgroundColor: this.info_material[capa.material].color}}
                                                                   value={capa.index}
                                                                   onClick={this.clickCapaTecho}
                                                                   elevation={10}
                                                            >
                                                                <IconButton style={{color: this.info_material[capa.material].textColor}}
                                                                            className={classes.button}
                                                                            value={capa.index}
                                                                            onClick={this.handleClickBorrarTecho}

                                                                >
                                                                    <Clear/>
                                                                </IconButton>
                                                                {this.info_material[capa.material].hasOwnProperty('tipos') ?
                                                                    <div>
                                                                        <Typography
                                                                            className={classes.textRotation}
                                                                            style={{color: this.info_material[capa.material].textColor}}
                                                                            value={capa.index}
                                                                            onClick={this.clickCapaTecho}>
                                                                            {this.info_material[capa.material].material + this.info_material[capa.material].tipos[capa.tipo].nombre}
                                                                        </Typography>

                                                                    </div>
                                                                    :
                                                                    <div>
                                                                        <Typography
                                                                            className={classes.textRotation}
                                                                            style={{color: this.info_material[capa.material].textColor}}
                                                                            value={capa.index}
                                                                            onClick={this.clickCapaTecho}>
                                                                            {this.info_material[capa.material].material}
                                                                        </Typography>
                                                                    </div>
                                                                }
                                                            </Paper>
                                                        }
                                                    </Grid>
                                                ), this)}

                                                {9 - capasTecho.length - 1 >= 0 ?
                                                    <Grid item xs>
                                                        <Paper className={classes.paperAdd}>
                                                            <IconButton
                                                                style={{margin: 0,
                                                                    position: 'relative',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',}}
                                                                className={classes.button}
                                                                onClick={this.handleClickAgregarTecho}>
                                                                <Add/>
                                                            </IconButton>
                                                        </Paper>
                                                    </Grid> : <div></div>
                                                }

                                                {this.vaciosArrayTecho.map(vacio => (
                                                    <Grid item xs>
                                                        <Paper className={classes.paper}>
                                                        </Paper>
                                                    </Grid>
                                                ), this)}

                                            </Grid>

                                        </Grid>

                                        {capaSeleccionadaTecho !== null ?
                                            <Grid container spacing={8}>
                                                {hasTiposTecho ?
                                                    <Grid container spacing={0} style={{
                                                        marginTop : 12,
                                                        marginBottom : 4,
                                                        marginLeft : 4,
                                                        marginRight : 4,}}>
                                                        <Grid item xs={6}>
                                                            <FormControl className={classes.formControl}>
                                                                <InputLabel htmlFor="material-simple">Material</InputLabel>
                                                                <Select
                                                                    value={materialTecho}
                                                                    onChange={this.handleChangeCapaTecho}
                                                                    input={<Input name="material" id="material-simple"/>}
                                                                >
                                                                    {this.info_material.map(material => (
                                                                        <MenuItem value={material.index}>
                                                                            {material.material}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <FormControl className={classes.formControl}>
                                                                <InputLabel htmlFor="tipo-simple">Tipo</InputLabel>
                                                                <Select
                                                                    value={tipoTecho}
                                                                    onChange={this.handleChangeCapaTecho}
                                                                    input={<Input name="tipo" id="tipo-simple"/>}
                                                                >
                                                                    {this.info_material[materialTecho].tipos.map(tipo => (
                                                                        <MenuItem value={tipo.index}>
                                                                            {tipo.nombre}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                    </Grid>
                                                    : <Grid item xs={12} style={{
                                                        marginTop : 8,
                                                    }}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="material-simple">Material</InputLabel>
                                                            <Select
                                                                value={materialTecho}
                                                                onChange={this.handleChangeCapaTecho}
                                                                input={<Input name="material" id="material-simple"/>}
                                                            >
                                                                {this.info_material.map(material => (
                                                                    <MenuItem value={material.index}>
                                                                        {material.material}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                }
                                                {hasTiposTecho ?
                                                    <Grid item xs={4}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                            <Select
                                                                value={propiedadTecho}
                                                                onChange={this.handleChangeCapaTecho}
                                                                input={<Input name="propiedad" id="conductividad-simple"/>}
                                                            >
                                                                {this.info_material[materialTecho].tipos[tipoTecho].propiedades.map(propiedades => (
                                                                    <MenuItem value={propiedades.index}>
                                                                        {propiedades.densidad !== -1 ? propiedades.densidad
                                                                            : "No tiene"}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>  : <div/>
                                                }

                                                {hasTiposTecho ?
                                                    <Grid item xs={4}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                            <Select
                                                                value={propiedadTecho}
                                                                onChange={this.handleChangeCapaTecho}
                                                                input={<Input name="propiedad" id="conductividad-simple"/>}
                                                            >
                                                                {this.info_material[materialTecho].tipos[tipoTecho].propiedades.map(propiedades => (
                                                                    <MenuItem value={propiedades.index}>
                                                                        {propiedades.conductividad}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid> : <div/>
                                                }
                                                {!hasTiposTecho?
                                                    <Grid item xs={4}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                            <Select
                                                                value={propiedadTecho}
                                                                onChange={this.handleChangeCapaTecho}
                                                                input={<Input name="propiedad" id="conductividad-simple"/>}
                                                            >
                                                                {this.info_material[materialTecho].propiedades.map(propiedades => (
                                                                    <MenuItem value={propiedades.index}>
                                                                        {propiedades.densidad !== -1 ? propiedades.densidad
                                                                            : "No tiene"}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>  : <div/>
                                                }

                                                {!hasTiposTecho ?
                                                    <Grid item xs={4}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                            <Select
                                                                value={propiedadTecho}
                                                                onChange={this.handleChangeCapaTecho}
                                                                input={<Input name="propiedad" id="conductividad-simple"/>}
                                                            >
                                                                {this.info_material[materialTecho].propiedades.map(propiedades => (
                                                                    <MenuItem value={propiedades.index}>
                                                                        {propiedades.conductividad}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid> : <div/>
                                                }
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <TextField
                                                            label="Espesor (mm)"
                                                            name="espesor"
                                                            value={1000*espesorTecho}
                                                            onChange={this.handleChangeCapaTecho}
                                                            type="number"
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                        />
                                                    </FormControl>
                                                </Grid>

                                            </Grid> : <div/>
                                        }
                                    </Grid>

                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            :
                            <div/>
                        }

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Dimensiones</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Profundidad (m)"
                                                name="profundidad"
                                                value={depth}
                                                type="number"
                                                onChange={this.handleChangeDimension}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Ancho (m)"
                                                name="ancho"
                                                value={width}
                                                type="number"
                                                onChange={this.handleChangeDimension}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                    </div>
                    :
                    <div/>
                }
            </div>
        );
    }
}

InformacionPisoTecho.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccionado: PropTypes.object,
    onDimensionChanged: PropTypes.func,/*
    onCapaChanged: PropTypes.func,*/
};

export default withStyles(styles)(InformacionPisoTecho);