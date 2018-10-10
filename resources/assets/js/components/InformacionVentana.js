import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Morfologia from "./Morfologia";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Button from "@material-ui/core/Button";
import axios from 'axios';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from '@material-ui/core/FormControl'
import Grid from "@material-ui/core/Grid";
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';

const ITEM_HEIGHT = 48;

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    root: {
        width: '100%',
    },
    titulo:{
        margin: theme.spacing.unit*2,
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 200,
        maxWidth: 220,
    },
    textField: {
        width: 100,
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },

});


class InformacionVentana extends Component {

    constructor(props) {
        super(props);
        this.state = {
            material: 0,
            tipo: 0,
            U: 0,
            FS: 0,
            marco: 0,
            tipo_marco: 0,
            U_marco: 0,
            FM: 0

        };
        this.info_material = [];
        this.info_marcos = [];
        axios.get("https://bioclimapp.host/api/info_ventanas")
            .then(response => this.getJson(response));
        axios.get("https://bioclimapp.host/api/info_marcos")
            .then(response => this.getJsonMarcos(response));
        this.difusa = this.props.comuna ? this.getFilteredRadiation(this.props.comuna.id,2,new Date().getMonth() + 1) : null;
        this.directa = this.props.comuna ? this.getFilteredRadiation(this.props.comuna.id,3,new Date().getMonth() + 1) : null;
        this.handleChange = this.handleChange.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
    }

    componentDidUpdate(prevProps,prevState,snapShot){
        if(this.props.comuna !== prevProps.comuna){
            this.getFilteredRadiation(this.props.comuna.id,2,new Date().getMonth()+1);
            this.getFilteredRadiation(this.props.comuna.id,3,new Date().getMonth()+1);
        }
    }

    getJson(response) {
        this.info_material = response.data.slice();
        for(let i = 0; i < this.info_material.length; i++){
            this.info_material[i].index = i;
            for(let j = 0; j < this.info_material[i].tipos.length ; j++){
                this.info_material[i].tipos[j].index = j;
                //PARA cuando las ventanas tengan mas propiedades
                /*for (let k = 0; k < this.info_material[i].tipos[j].propiedad.length; k++) {
                    this.info_material[i].tipos[j].propiedad[k].index = k;
                }*/
            }
        }
    }
    getJsonMarcos(response){
        this.info_marcos = response.data.slice();
        for(let i = 0; i < this.info_marcos.length; i++){
            this.info_marcos[i].index = i;
            if(this.info_marcos[i].hasOwnProperty('tipos')){
                for(let j = 0; j < this.info_marcos[i].tipos.length ; j++){
                    this.info_marcos[i].tipos[j].index = j;
                    //PARA cuando las ventanas tengan mas propiedades
                    /*for (let k = 0; k < this.info_material[i].tipos[j].propiedad.length; k++) {
                        this.info_material[i].tipos[j].propiedad[k].index = k;
                    }*/
                }
            }
        }
    }

    getFilteredRadiation(comuna,tipo,mes){
        axios.get("https://bioclimapp.host/api/radiaciones/"+comuna+"/"+tipo+"/"+mes)
            .then(response => {
                tipo === 2 ? this.difusa = response.data.valor : null;
                tipo === 3 ? this.directa = response.data.valor : null;
            });
    }


    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
        //
    }

    handleClickAgregar() {
        let FM = this.info_marcos[this.state.marco].hasOwnProperty('tipos') ?
            this.info_marcos[this.state.marco].tipos[this.state.tipo_marco].propiedad.FS :
            this.info_marcos[this.state.marco].propiedades[0].FS;
        let FS = this.info_material[this.state.material].tipos[this.state.tipo].propiedad.FS;
        let Um = this.info_marcos[this.state.marco].hasOwnProperty('tipos') ?
            this.info_marcos[this.state.marco].tipos[this.state.tipo_marco].propiedad.U :
            this.info_marcos[this.state.marco].propiedades[0].U;
        this.props.seleccionado.fm = FM;
        this.props.seleccionado.fs = FS;
        this.props.um = Um;
        let periodo = this.props.ventanas[0].parent.parent.parent.parent.parent.userData.periodo;
        let aporte_solar = BalanceEnergetico.calcularAporteSolar(periodo,this.props.ventanas,this.difusa,this.directa);
        this.props.onAporteSolarChanged(aporte_solar);
    }



    render() {
        const {classes, seleccionado} = this.props;
        const {material, tipo, U, FS, marco, tipo_marco, U_marco, FM} = this.state;
        return (
            <div>
                {seleccionado !== null && seleccionado.userData.tipo === Morfologia.tipos.VENTANA ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            className={classes.titulo}
                        >
                            {'Configuracion '+ Morfologia.tipos_texto[seleccionado.userData.tipo] }
                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Material Ventana</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="material-ventana">Material</InputLabel>
                                            <Select
                                                value={material}
                                                onChange={this.handleChange}
                                                input={<Input name="material" id="material-ventana"/>}
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
                                            <InputLabel htmlFor="tipo-ventana">Tipo</InputLabel>
                                            <Select
                                                value={tipo}
                                                onChange={this.handleChange}
                                                input={<Input name="tipo" id="tipo-ventana"/>}
                                            >
                                                {this.info_material[material].tipos.map(tipo => (
                                                    <MenuItem value={tipo.index}>
                                                        {tipo.nombre}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="U-ventana">U</InputLabel>
                                            <Select
                                                value={U}
                                                onChange={this.handleChange}
                                                input={<Input name="U" id="U-ventana"/>}
                                            >
                                                <MenuItem value={0}>
                                                    {this.info_material[material].tipos[tipo].propiedad.U}
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="FS-ventana">FS</InputLabel>
                                            <Select
                                                value={FS}
                                                onChange={this.handleChange}
                                                input={<Input name="FS" id="FS-ventana"/>}
                                            >
                                                <MenuItem value={0}>
                                                    {this.info_material[material].tipos[tipo].propiedad.FS}
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>


                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Material Marco</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                {this.info_marcos[marco].hasOwnProperty('tipos') ?
                                    <Grid container spacing={8}>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="material-marco">Material</InputLabel>
                                                <Select
                                                    value={marco}
                                                    onChange={this.handleChange}
                                                    input={<Input name="marco" id="material-marco"/>}
                                                >
                                                    {this.info_marcos.map(marco => (
                                                        <MenuItem value={marco.index}>
                                                            {marco.material}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="tipo-marco">Tipo</InputLabel>
                                                <Select
                                                    value={tipo_marco}
                                                    onChange={this.handleChange}
                                                    input={<Input name="tipo_marco" id="tipo-marco"/>}
                                                >
                                                    {this.info_marcos[marco].tipos.map(tipo => (
                                                        <MenuItem value={tipo.index}>
                                                            {tipo.nombre}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="U-marco">U</InputLabel>
                                                <Select
                                                    value={U_marco}
                                                    onChange={this.handleChange}
                                                    input={<Input name="U_marco" id="U-marco"/>}
                                                >
                                                    <MenuItem value={0}>
                                                        {this.info_marcos[marco].tipos[tipo_marco].propiedad.U}
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="FM-marco">FM</InputLabel>
                                                <Select
                                                    value={FM}
                                                    onChange={this.handleChange}
                                                    input={<Input name="FM" id="FM-marco"/>}
                                                >
                                                    <MenuItem value={0}>
                                                        {this.info_marcos[marco].tipos[tipo_marco].propiedad.FS}
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    :
                                    <Grid container spacing={8}>
                                        <Grid item xs={12}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="material-marco">Material</InputLabel>
                                                <Select
                                                    value={marco}
                                                    onChange={this.handleChange}
                                                    input={<Input name="marco" id="material-marco"/>}
                                                >
                                                    {this.info_marcos.map(marco => (
                                                        <MenuItem value={marco.index}>
                                                            {marco.material}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="U-marco">U</InputLabel>
                                                <Select
                                                    value={U_marco}
                                                    onChange={this.handleChange}
                                                    input={<Input name="U_marco" id="U-marco"/>}
                                                >
                                                    {this.info_marcos[marco].propiedades.map(propiedad => (
                                                        <MenuItem value={0}>
                                                            {propiedad.U}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="FM-marco">FM</InputLabel>
                                                <Select
                                                    value={FM}
                                                    onChange={this.handleChange}
                                                    input={<Input name="FM" id="FM-marco"/>}
                                                >
                                                    {this.info_marcos[marco].propiedades.map(propiedad => (
                                                        <MenuItem value={0}>
                                                            {propiedad.FS}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                }
                            </ExpansionPanelDetails>
                        </ExpansionPanel>


                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Dimensiones</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={6}>
                                        Ancho: {seleccionado.geometry.boundingBox.max.x.toFixed(3)}
                                    </Grid>
                                    <Grid item xs={6}>
                                        Alto: {seleccionado.geometry.boundingBox.max.y.toFixed(3)}
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>FAR</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <FormControl className={classes.formControl}>
                                    <Typography>
                                        FAR de la ventana: {seleccionado.userData.far}
                                    </Typography>
                                    {seleccionado.userData.obstrucciones != null ? seleccionado.userData.obstrucciones.map((obstruccion,index) => (
                                        <ExpansionPanel>
                                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                                <Typography className={classes.heading}>Obstruccion: {index}</Typography>
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                                <Grid container spacing={40}>
                                                    <Grid item xs>
                                                        <Typography>FAR obstruccion: {obstruccion.far.toFixed(3)}</Typography>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Typography>Altura respecto a la ventana: {obstruccion.aDistance.toFixed(3)}</Typography>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Typography>Distancia respecto a la ventana: {obstruccion.bDistance.toFixed(3)}</Typography>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Typography>Ángulo(s) que obstruye:</Typography>
                                                        {obstruccion.betaAngle.map(angle => (
                                                            <Typography>{angle.toFixed(3)}</Typography>
                                                        ))}
                                                    </Grid>
                                                </Grid>
                                            </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                    )) : <div></div>}
                                </FormControl>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <Button variant="contained" color="secondary" className={classes.button}>
                            Borrar
                        </Button>
                        <Button variant="contained" color="secondary" className={classes.button}
                                onClick={this.handleClickAgregar}
                        >
                            Guardar
                        </Button>
                    </div>
                    :
                    <div/>
                }
            </div>
        );
    }
}

InformacionVentana.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccionado: PropTypes.object,
};

export default withStyles(styles)(InformacionVentana);