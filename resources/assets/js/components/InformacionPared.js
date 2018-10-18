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
import IconButton from '@material-ui/core/IconButton';
import Grid from "@material-ui/core/Grid";
import SvgIcon from "@material-ui/core/SvgIcon/SvgIcon";

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
        marginLeft: '80%',
        '-mozTransform': 'rotate(90deg)',
        '-webkitTransform' : 'rotate(90deg)',
        '-msTransform' : 'rotate(90deg)',
        '-oTransform:' : 'rotate(90deg)',
        'transform:' : 'rotate(90deg)',
        '-msFilter' : 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)',
        whiteSpace: 'nowrap',
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
        height: 200,
        overflow: 'hidden',
        elevation:24,
        width: 0,
        minWidth: '100%',
    },
    paperAdd: {
        height: 200,
        overflow: 'hidden',
        elevation:24,
        width: 0,
        minWidth: '100%',
    },

});

function SunPathIcon() {
    return (
        <SvgIcon viewBox="0 0 64 64">
            <path d="M62 30H47.9a15.9 15.9 0 0 0-3.2-7.8l10-10a2 2 0 0 0-2.8-2.8l-10 10a15.9 15.9 0 0 0-7.9-3.3V2a2 2 0 0 0-4 0v14.2a15.9 15.9 0 0 0-7.8 3.2l-10-10a2 2 0 1 0-2.8 2.8l10 10a15.9 15.9 0 0 0-3.2 7.8H2a2 2 0 1 0 0 4h14.2a15.9 15.9 0 0 0 3.2 7.8l-10 10a2 2 0 1 0 2.8 2.8l10-10a15.9 15.9 0 0 0 7.8 3.3V62a2 2 0 0 0 4 0V47.9a15.9 15.9 0 0 0 7.8-3.2l10 10a2 2 0 1 0 2.8-2.8l-10-10a15.9 15.9 0 0 0 3.3-7.9H62a2 2 0 1 0 0-4z"
                  fill="#757575"></path>
        </SvgIcon>
    );
}


class InformacionPared extends Component {

    constructor(props) {
        super(props);

        this.state = {
            capas: [],
            single: null,
            material: 0,
            tipo: 0,
            espesor: 0,
            propiedad: 0,
            capaS : null,

        };
        this.vaciosArray = [];
        this.info_material = [];
        this.themes = [];
        axios.get("https://bioclimapp.host/api/info_materiales")
            .then(response => this.getJson(response));
        this.handleChange = this.handleChange.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
        this.handleClickBorrar = this.handleClickBorrar.bind(this);
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeCapa = this.handleChangeCapa.bind(this);
        this.clickCapa = this.clickCapa.bind(this);
    }

    componentDidUpdate(prevProps) {
        //console.log("selec pared",this.props.seleccionado);
        if (this.props.seleccionado !== prevProps.seleccionado) {
            if(this.props.seleccionado !== null  && this.props.seleccionado.userData.tipo === Morfologia.tipos.PARED ){
                let capas = this.props.seleccionado.userData.capas;
                for (let i = 0; i < capas.length; i++) {
                    capas[i].index = i;
                }

                let capasVacias = 9 - capas.length - 1;
                this.vaciosArray = [];
                for(let i = 0 ; i < capasVacias ; i++){
                    this.vaciosArray.push(i);
                }

                this.setState({
                    capas: capas,
                    capaS: null,
                });
                if(this.props.seleccionado.userData.separacion === Morfologia.separacion.EXTERIOR && this.props.seleccionado.userData.hasOwnProperty('omegas')) {
                    this.info_rb = <div/>;
                    if (this.props.seleccionado.userData.omegas.wm.desde != null && this.props.seleccionado.userData.omegas.wt.desde == null) {
                        this.info_rb = <Grid container spacing={8} justify="center">
                            <Grid item xs={12} style={{textAlign:'center'}}>Información Solar</Grid>
                            <Grid item xs={6} container spacing={0}>
                                <Grid item xs={12} >Hoy el muro recibe sol</Grid>
                                <Grid item xs={12}>
                                    Desde: {this.props.seleccionado.userData.omegas.wm.desde.toLocaleTimeString()}
                                </Grid>
                                <Grid item xs={12}>
                                    Hasta: {this.props.seleccionado.userData.omegas.wm.hasta.toLocaleTimeString()}
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                RB: {this.props.seleccionado.userData.omegas.rb}
                            </Grid>
                        </Grid>
                    }
                    else if (this.props.seleccionado.userData.omegas.wm.desde == null && this.props.seleccionado.userData.omegas.wt.desde != null) {
                        this.info_rb = <Grid container spacing={8} justify="center">
                            <Grid item xs={12} style={{textAlign:'center'}}>Información Solar</Grid>
                            <Grid item xs={6} container spacing={0}>
                                <Grid item xs={12} >Hoy el muro recibe sol</Grid>
                                <Grid item xs={12}>
                                    Desde: {this.props.seleccionado.userData.omegas.wt.desde.toLocaleTimeString()}
                                </Grid>
                                <Grid item xs={12}>
                                    Hasta: {this.props.seleccionado.userData.omegas.wt.hasta.toLocaleTimeString()}
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                RB: {this.props.seleccionado.userData.omegas.rb}
                            </Grid>
                        </Grid>
                    }
                    else if (this.props.seleccionado.userData.omegas.wm.desde != null && this.props.seleccionado.userData.omegas.wt.desde != null) {
                        this.info_rb = <Grid container spacing={8} justify="center">
                            <Grid item xs={12} style={{textAlign:'center'}}>Información Solar</Grid>
                            <Grid item xs={6} container spacing={0}>
                                <Grid item xs={12} >Hoy el muro recibe sol</Grid>
                                <Grid item xs={6}>
                                    Desde: {this.props.seleccionado.userData.omegas.wm.desde.toLocaleTimeString()}
                                </Grid>
                                <Grid item xs={6}>
                                    Hasta: {this.props.seleccionado.userData.omegas.wm.hasta.toLocaleTimeString()}
                                </Grid>
                                <Grid item xs={12} >Y luego</Grid>
                                <Grid item xs={6}>
                                    desde: {this.props.seleccionado.userData.omegas.wt.desde.toLocaleTimeString()}
                                </Grid>
                                <Grid item xs={6}>
                                    hasta: {this.props.seleccionado.userData.omegas.wt.hasta.toLocaleTimeString()}
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                RB: {this.props.seleccionado.userData.omegas.rb}
                            </Grid>
                        </Grid>
                    }
                    else {
                        this.info_rb = <Grid container spacing={8} justify="center">
                            <Grid item xs={12} style={{textAlign:'center'}}>Información Solar</Grid>
                            <Grid item xs={6} container spacing={0}>
                                <Grid item xs={12} >Hoy el muro no recibe sol</Grid>
                            </Grid>
                            <Grid item xs={6}>
                                RB: {this.props.seleccionado.userData.omegas.rb}
                            </Grid>
                        </Grid>
                    }
                }
            }
        }
    }


    hexToRGB(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
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

    handleChangeCapa(event){
        let capas = this.state.capas;
        let capa = capas[this.state.capaS];

        capa[event.target.name] = event.target.value;

        if(event.target.name === 'material'){
            if(this.info_material[event.target.value].hasOwnProperty('tipos')){
                capa.tipo = 0;
                capa.propiedad = 0;
            }else{
                capa.propiedad = 0;
            }
        }

        if(event.target.name === 'tipo'){
            capa.tipo = 0;
            capa.propiedad = 0;

        }

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

        this.props.onCapaChanged();

        this.setState({
            capas: capas,
        })
    }

    handleChangeDimension(event) {
        let pared = this.props.seleccionado;
        let height= pared.userData.height, width = pared.userData.width;
        if (event.target.name === 'altura') {
            if(parseInt(event.target.value) >= height){
                height += 0.1;
            }else{
                height -= 0.1;
            }
        } else {
            if(parseInt(event.target.value) >= width){
                width += 1;
            }else{
                width -= 1;
            }
        }
        this.props.onDimensionChanged(pared, width, height);
    }

    handleClickBorrar(event) {
        let capas = this.state.capas;
        capas.splice(event.target.value, 1);


        for (let i = 0; i < capas.length; i++) {
            capas[i].index = i;
        }

        let capasVacias = 9 - capas.length - 1;
        this.vaciosArray = [];
        for(let i = 0 ; i < capasVacias ; i++){
            this.vaciosArray.push(i);
        }

        if(this.state.capaS === event.target.value){
            this.setState({
                capaS: null,
            })
        }

        this.props.onCapaChanged();

        this.setState({
            capas: capas,
        })
    }

    clickCapa(event) {
        let capaS = parseInt(event.target.attributes.value.value );
        if(this.state.capas[capaS] !== undefined){
            this.setState({
                capaS: parseInt(event.target.attributes.value.value),
            });
        }else{
            this.setState({
                capaS: null,
            });
        }

    }

    handleClickAgregar() {
        let capas = this.state.capas;
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
        this.vaciosArray = [];
        for(let i = 0 ; i < capasVacias ; i++){
            this.vaciosArray.push(i);
        }

        this.setState({
            capaS: capas.length-1,
        });


        this.setState({
            capas: capas,
        });

        this.props.onCapaChanged();

    }

    render() {
        const {classes, seleccionado} = this.props;
        const {capas, capaS} = this.state;

        let height, width;
        if(seleccionado !== null){
            height = seleccionado.userData.height;
            width = seleccionado.userData.width;
        }

        let material ,tipo ,espesor ,propiedad ;

        if(capaS !== null){
            material = capas[capaS].material;
            tipo = capas[capaS].tipo;
            espesor = capas[capaS].espesor;
            propiedad = capas[capaS].propiedad;
        }

        let hasTipos;

        if (seleccionado !== null && this.info_material.length > 0 && seleccionado.userData.tipo === Morfologia.tipos.PARED && capaS !== null) {
            hasTipos = this.info_material[material].hasOwnProperty('tipos');
        } else {
            hasTipos = null;
        }
        return (
            <div>
                {seleccionado !== null && seleccionado.userData.tipo === Morfologia.tipos.PARED ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            className={classes.titulo}
                            align={"center"}
                        >
                            {'Configuracion '+ Morfologia.tipos_texto[seleccionado.userData.tipo] }
                        </Typography>
                        {seleccionado.userData.separacion === Morfologia.separacion.EXTERIOR &&
                        <Paper style={{padding:20, margin:0}}>{this.info_rb}</Paper>
                        }

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Capas</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={0}>
                                            {capas.map(capa => (
                                                <Grid item xs>
                                                    {capaS === capa.index ?
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.colorSelected[0]}}
                                                               value={capa.index}
                                                               onClick={this.clickCapa}
                                                               elevation={0}
                                                        >
                                                            <IconButton style={{color: this.colorSelected[1],
                                                                    margin: 0,
                                                                    position: 'relative',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, 0%)',}}
                                                                        className={classes.button}
                                                                        value={capa.index}
                                                                        onClick={this.handleClickBorrar}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.info_material[capa.material].hasOwnProperty('tipos') ?
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.colorSelected[1]}}
                                                                        value={capa.index}
                                                                        onClick={this.clickCapa}>
                                                                        {this.info_material[capa.material].material + this.info_material[capa.material].tipos[capa.tipo].nombre}
                                                                    </Typography>
                                                                </div>
                                                                :
                                                                <Typography
                                                                    className={classes.textRotation}
                                                                    style={{color: this.colorSelected[1]}}
                                                                    value={capa.index}
                                                                    onClick={this.clickCapa}>
                                                                    {this.info_material[capa.material].material}
                                                                </Typography>
                                                            }
                                                        </Paper> :
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.info_material[capa.material].color
                                                               }}
                                                               value={capa.index}
                                                               onClick={this.clickCapa}
                                                                elevation={10}
                                                        >
                                                            <IconButton
                                                                style={{color: this.info_material[capa.material].textColor,
                                                                    margin: 0,
                                                                    position: 'relative',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, 0%)',
                                                                   }}
                                                                        className={classes.button}
                                                                        value={capa.index}
                                                                        onClick={this.handleClickBorrar}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.info_material[capa.material].hasOwnProperty('tipos') ?
                                                                <div >
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.info_material[capa.material].textColor}}
                                                                        value={capa.index}
                                                                        onClick={this.clickCapa}>
                                                                        {this.info_material[capa.material].material + this.info_material[capa.material].tipos[capa.tipo].nombre}
                                                                    </Typography>

                                                                </div>
                                                                :
                                                                <div >
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.info_material[capa.material].textColor}}
                                                                        value={capa.index}
                                                                        onClick={this.clickCapa}>
                                                                        {this.info_material[capa.material].material}
                                                                    </Typography>
                                                                </div>
                                                            }
                                                        </Paper>
                                                    }
                                                </Grid>
                                            ), this)}

                                            {9 - capas.length - 1 >= 0 ?
                                                <Grid item xs>
                                                    <Paper className={classes.paperAdd}>
                                                        <IconButton
                                                            style={{margin: 0,
                                                                position: 'relative',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',}}
                                                            className={classes.button}
                                                            onClick={this.handleClickAgregar}>
                                                            <Add/>
                                                        </IconButton>
                                                    </Paper>
                                                </Grid> : <div></div>
                                            }

                                            {this.vaciosArray.map(vacio => (
                                                <Grid item xs>
                                                    <Paper className={classes.paper}>
                                                    </Paper>
                                                </Grid>
                                            ), this)}

                                        </Grid>

                                    </Grid>

                                    {capaS !== null ?
                                        <Grid container spacing={8}>
                                            {hasTipos ?
                                                <Grid container spacing={0} style={{
                                                    marginTop : 12,
                                                    marginBottom : 4,
                                                    marginLeft : 4,
                                                    marginRight : 4,}}>
                                                    <Grid item xs={6}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="material-simple">Material capa seleccionada</InputLabel>
                                                            <Select
                                                                value={material}
                                                                onChange={this.handleChangeCapa}
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
                                                                value={tipo}
                                                                onChange={this.handleChangeCapa}
                                                                input={<Input name="tipo" id="tipo-simple"/>}
                                                            >
                                                                {this.info_material[material].tipos.map(tipo => (
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
                                                        <InputLabel htmlFor="material-simple">Material capa seleccionada</InputLabel>
                                                        <Select
                                                            value={material}
                                                            onChange={this.handleChangeCapa}
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
                                            {hasTipos ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[material].tipos[tipo].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad !== -1 ? propiedades.densidad
                                                                    : "No tiene"}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>  : <div/>
                                            }

                                            {hasTipos ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[material].tipos[tipo].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.conductividad}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }
                                            {!hasTipos?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[material].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad !== -1 ? propiedades.densidad
                                                                        : "No tiene"}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>  : <div/>
                                            }

                                            {!hasTipos ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[material].propiedades.map(propiedades => (
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
                                                        value={1000*espesor}
                                                        onChange={this.handleChangeCapa}
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

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Dimensiones</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>

                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Altura (m)"
                                                name="altura"
                                                value={height}
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

InformacionPared.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccionado: PropTypes.object,
    onDimensionChanged: PropTypes.func,
    onCapaChanged: PropTypes.func,
};

export default withStyles(styles)(InformacionPared);