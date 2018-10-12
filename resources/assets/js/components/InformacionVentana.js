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
import TextField from "@material-ui/core/TextField/TextField";

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
        width: '100%',
        'box-sizing': 'border-box',
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
            info_material_ventana: {},
            info_material_marco: {},
            /*material: 0,
            tipo: 0,
            U: 0,
            FS: 0,
            marco: 0,
            tipo_marco: 0,
            U_marco: 0,
            FM: 0,
            height: 0,
            width: 0,*/

        };
        this.info_material = [];
        this.info_marco = [];
        axios.get("https://bioclimapp.host/api/info_ventanas")
            .then(response => this.getJson(response));
        axios.get("https://bioclimapp.host/api/info_marcos")
            .then(response => this.getJsonMarcos(response));
        this.difusa = this.props.comuna ? this.getFilteredRadiation(this.props.comuna.id,2,new Date().getMonth() + 1) : null;
        this.directa = this.props.comuna ? this.getFilteredRadiation(this.props.comuna.id,3,new Date().getMonth() + 1) : null;
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeAlturaPiso = this.handleChangeAlturaPiso.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
        this.handleChangeMarco = this.handleChangeMarco.bind(this);
        this.handleChangeMaterial = this.handleChangeMaterial.bind(this);
    }

    componentDidUpdate(prevProps,prevState,snapShot){
        if(this.props.comuna !== prevProps.comuna){
            this.getFilteredRadiation(this.props.comuna.id,2,new Date().getMonth()+1);
            this.getFilteredRadiation(this.props.comuna.id,3,new Date().getMonth()+1);
        }
        if (this.props.seleccionado !== prevProps.seleccionado && this.props.seleccionado.userData.tipo === Morfologia.tipos.VENTANA) {
            if (this.props !== null) {

                let info_material_ventana = this.props.seleccionado.userData.info_material;
                let info_material_marco = this.props.seleccionado.userData.info_marco;

                this.setState({
                    info_material_ventana: info_material_ventana,
                    info_material_marco: info_material_marco,
                    /*height: this.props.seleccionado.userData.height,
                    width: this.props.seleccionado.userData.width,*/
                });


            }
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

    handleChangeMaterial(event){
        let info_material_ventana = this.state.info_material_ventana;

        if(event.target.name === 'material'){
            info_material_ventana.tipo = 0;
        }

        info_material_ventana[event.target.name] = event.target.value;


        info_material_ventana.fs = this.info_material[info_material_ventana.material].tipos[info_material_ventana.tipo].propiedad.FS;
        info_material_ventana.u = this.info_material[info_material_ventana.material].tipos[info_material_ventana.tipo].propiedad.U;

        this.setState({
            info_material_ventana: info_material_ventana,
        });

        this.props.onCapaChanged();


    }

    handleChangeMarco(event){
        let info_material_marco = this.state.info_material_marco;

        if(event.target.name === 'material'){
            info_material_marco.tipo = 0;
        }

        info_material_marco[event.target.name] = event.target.value;

        info_material_marco.fs =  this.info_marcos[info_material_marco.material].hasOwnProperty('tipos') ?
            this.info_marcos[info_material_marco.material].tipos[info_material_marco.tipo].propiedad.FS :
            this.info_marcos[info_material_marco.material].propiedades[0].FS;

        info_material_marco.u = this.info_marcos[info_material_marco.material].hasOwnProperty('tipos') ?
            this.info_marcos[info_material_marco.material].tipos[info_material_marco.tipo].propiedad.U :
            this.info_marcos[info_material_marco.material].propiedades[0].U;

        this.setState({
            info_material_marco: info_material_marco,
        });

        this.props.onCapaChanged();

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
    handleChangeDimension(event) {
        let ventana = this.props.seleccionado;
        let height = ventana.userData.height, width = ventana.userData.width;
        if (event.target.name === 'altura') {
            if(parseInt(event.target.value) >= height){
                height += 0.1;
            }else{
                height -= 0.1;
            }

            //this.props.onDimensionChanged(puerta, width, height);
        } else {
            if(parseInt(event.target.value) >= width){
                width += 0.1;
            }else{
                width -= 0.1;
            }
        }
        this.props.onDimensionChanged(ventana, width, height);
    }

    handleChangeAlturaPiso(event){
        let ventana = this.props.seleccionado;
        let altura = ventana.position.y;
        if(parseInt(event.target.value) >= altura){
            altura += 0.1;
        }else{
            altura -= 0.1;
        }
        this.props.onAlturaVentanaChanged(ventana, altura);
    }



    render() {
        const {classes, seleccionado} = this.props;

        const {info_material_marco, info_material_ventana} = this.state;

        let height, width, alturaPiso;
        let marco,tipo_marco,u_marco,fm;

        if(seleccionado !== null && seleccionado.userData.tipo === Morfologia.tipos.VENTANA
            && Object.keys(info_material_ventana).length > 0
            && Object.keys(info_material_marco).length){
            height = seleccionado.userData.height;
            width = seleccionado.userData.width;
            alturaPiso = seleccionado.position.y;

            var {material, tipo, fs, u} = info_material_ventana;

            marco = info_material_marco.material;
            tipo_marco = info_material_marco.tipo;
            u_marco = info_material_marco.u;
            fm = info_material_marco.fs;
        }

        //console.log(material,info_material_ventana);


        return (
            <div>
                {seleccionado !== null && seleccionado.userData.tipo === Morfologia.tipos.VENTANA  && this.info_material.length > 0 && Object.keys(info_material_ventana).length > 0
                && Object.keys(info_material_marco).length?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            className={classes.titulo}
                        >
                            {'Configuracion '+ Morfologia.tipos_texto[seleccionado.userData.tipo] }
                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Material ventana</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="material-ventana">Nombre material</InputLabel>
                                            <Select
                                                value={material}
                                                onChange={this.handleChangeMaterial}
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
                                                onChange={this.handleChangeMaterial}
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
                                            <TextField
                                                disabled
                                                label={"Transmitancia Térmica"}
                                                value={u}
                                            />
                                            {/*<InputLabel htmlFor="U-ventana">Transmitancia térmica</InputLabel>
                                            <Select
                                                value={u}
                                                onChange={this.handleChangeMaterial}
                                                input={<Input name="u" id="U-ventana"/>}
                                            >
                                                <MenuItem value={0}>
                                                    {this.info_material[material].tipos[tipo].propiedad.U}
                                                </MenuItem>
                                            </Select>*/}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                disabled
                                                label={"Factor Solar"}
                                                value={fs}
                                            />
                                            {/*<InputLabel htmlFor="FS-ventana">Factor solar</InputLabel>
                                            <Select
                                                value={fs}
                                                onChange={this.handleChangeMaterial}
                                                input={<Input name="fs" id="FS-ventana"/>}
                                            >
                                                <MenuItem value={0}>
                                                    {this.info_material[material].tipos[tipo].propiedad.FS}
                                                </MenuItem>
                                            </Select>*/}
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
                                                <InputLabel htmlFor="material-marco">Nombre material</InputLabel>
                                                <Select
                                                    value={marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="material" id="material-marco"/>}
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
                                                <InputLabel htmlFor="tipo-marco">Tipo de material</InputLabel>
                                                <Select
                                                    value={tipo_marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="tipo" id="tipo-marco"/>}
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
                                                <TextField
                                                    disabled
                                                    label={"Transmitancia Térmica"}
                                                    value={u_marco}
                                                />
                                                {/*<InputLabel htmlFor="U-marco">Transmitancia térmica</InputLabel>
                                                <Select
                                                    value={u_marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="u" id="U-marco"/>}
                                                >
                                                    <MenuItem value={0}>
                                                        {this.info_marcos[marco].tipos[tipo_marco].propiedad.U}
                                                    </MenuItem>
                                                </Select>*/}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>

                                                <TextField
                                                    disabled
                                                    label={"Factor Solar"}
                                                    value={fm}
                                                />

                                                {/*<InputLabel htmlFor="FM-marco">Factor solar</InputLabel>
                                                <Select
                                                    value={fm}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="fm" id="FM-marco"/>}
                                                >
                                                    <MenuItem value={0}>
                                                        {this.info_marcos[marco].tipos[tipo_marco].propiedad.FS}
                                                    </MenuItem>
                                                </Select>*/}
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    :
                                    <Grid container spacing={8}>
                                        <Grid item xs={12}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="material-marco">Nombre material</InputLabel>
                                                <Select
                                                    value={marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="material" id="material-marco"/>}
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
                                                <TextField
                                                    disabled
                                                    label={"Transmitancia Térmica"}
                                                    value={u_marco}
                                                />
                                                {/*<InputLabel htmlFor="U-marco">Transmitancia térmica</InputLabel>
                                                <Select
                                                    value={U_marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="u" id="U-marco"/>}
                                                >
                                                    {this.info_marcos[marco].propiedades.map(propiedad => (
                                                        <MenuItem value={0}>
                                                            {propiedad.U}
                                                        </MenuItem>
                                                    ))}
                                                </Select>*/}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <TextField
                                                    disabled
                                                    label={"Factor solar"}
                                                    value={fm}
                                                />
                                                {/*<InputLabel htmlFor="FM-marco">Factor solar</InputLabel>
                                                <Select
                                                    value={FM}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="fm" id="FM-marco"/>}
                                                >
                                                    {this.info_marcos[marco].propiedades.map(propiedad => (
                                                        <MenuItem value={0}>
                                                            {propiedad.FS}
                                                        </MenuItem>
                                                    ))}
                                                </Select>*/}
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                }
                            </ExpansionPanelDetails>
                        </ExpansionPanel>


                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Configuración dimensiones</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>

                                    <Grid item xs={4}>
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
                                    <Grid item xs={4}>
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
                                    <Grid item xs={4}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Altura al Piso (m)"
                                                value={alturaPiso}
                                                type="number"
                                                onChange={this.handleChangeAlturaPiso}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
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
    onAlturaVentanaChanged: PropTypes.func,
    onDimensionChanged: PropTypes.func,
};

export default withStyles(styles)(InformacionVentana);