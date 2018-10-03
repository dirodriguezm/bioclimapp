import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Morfologia from "./Morfologia";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Button from "@material-ui/core/Button";
import axios from 'axios';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
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
        margin: theme.spacing.unit,
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
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    paper: {
        height: 300,
        flexDirection: 'column',
        textAlign: 'center',
        overflow: 'hidden',
    },
    paperAdd: {
        height: 300,
        overflow: 'hidden',
    },

});


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
        axios.get("http://127.0.0.1:8000/api/info_materiales")
            .then(response => this.getJson(response));
        this.handleChange = this.handleChange.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
        this.handleClickBorrar = this.handleClickBorrar.bind(this);
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeCapa = this.handleChangeCapa.bind(this);
        this.clickCapa = this.clickCapa.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.seleccionado !== prevProps.seleccionado && this.props.seleccionado.userData.tipo === Morfologia.tipos.PARED) {
            if (this.props !== null) {
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
                    height: this.props.seleccionado.userData.height,
                    width: this.props.seleccionado.userData.width,
                });
                this.info_rb = <div/>;
                if (this.props.seleccionado.userData.omegas.wm.desde != null && this.props.seleccionado.userData.omegas.wt.desde == null) {
                    this.info_rb = <div>
                        <ExpansionPanelDetails>
                            La pared recibe sol
                            desde: {this.props.seleccionado.userData.omegas.wm.desde.toLocaleTimeString()}
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            Hasta: {this.props.seleccionado.userData.omegas.wm.hasta.toLocaleTimeString()}
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            RB: {this.props.seleccionado.userData.rb}
                        </ExpansionPanelDetails>
                    </div>
                }
                else if (this.props.seleccionado.userData.omegas.wm.desde == null && this.props.seleccionado.userData.omegas.wt.desde != null) {
                    this.info_rb = <div>
                        <ExpansionPanelDetails>
                            La pared recibe sol
                            desde: {this.props.seleccionado.userData.omegas.wt.desde.toLocaleTimeString()}
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            Hasta: {this.props.seleccionado.userData.omegas.wt.hasta.toLocaleTimeString()}
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            RB: {this.props.seleccionado.userData.rb}
                        </ExpansionPanelDetails>
                    </div>
                }
                else if (this.props.seleccionado.userData.omegas.wm.desde != null && this.props.seleccionado.userData.omegas.wt.desde != null) {
                    this.info_rb = <div>
                        <ExpansionPanelDetails>
                            La pared recibe sol
                            desde: {this.props.seleccionado.userData.omegas.wm.desde.toLocaleTimeString()}
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            Hasta: {this.props.seleccionado.userData.omegas.wm.hasta.toLocaleTimeString()}
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            Y luego desde: {this.props.seleccionado.userData.omegas.wt.desde.toLocaleTimeString()}
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            Hasta: {this.props.seleccionado.userData.omegas.wt.hasta.toLocaleTimeString()}
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            RB: {this.props.seleccionado.userData.rb}
                        </ExpansionPanelDetails>
                    </div>
                }
                else {
                    this.info_rb = <div>
                        <ExpansionPanelDetails>
                            La pared no recibe sol.
                        </ExpansionPanelDetails>
                        <ExpansionPanelDetails>
                            RB: {this.props.seleccionado.userData.rb}
                        </ExpansionPanelDetails>
                    </div>

                }

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
            this.info_material[i].colorSelected = theme.palette.primary.dark;

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
    }


    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    handleChangeCapa(event){
        let capas = this.state.capas;
        let capa = capas[this.state.capaS];

        if(event.target.name === 'material'){
            if(this.info_material[event.target.value].hasOwnProperty('tipos')){
                capa.tipo = 0;
            }
        }

        if(event.target.name === 'propiedad'){
            let conductividad;
            if(this.info_material[capa.material].hasOwnProperty('tipos')){
                conductividad = this.info_material[capa.material].propiedades[capa.propiedad].conductividad;
            }else{
                conductividad = this.info_material[capa.material].tipo[capa.tipo].propiedades[capa.propiedad].conductividad;
            }
            capa.conductividad = conductividad;
        }

        capa[event.target.name] = event.target.value;

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
        let height, width;
        if (event.target.name === 'altura') {
            height = parseInt(event.target.value);
            width = this.props.seleccionado.userData.width;
            this.props.onDimensionChanged(pared, width, height);
        } else {
            height = this.props.seleccionado.userData.height;
            width = parseInt(event.target.value);
            this.props.onDimensionChanged(pared, width, height);
        }
        this.setState({
            height: height,
            width: width,
        });
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
        })

        this.props.onCapaChanged();

    }

    render() {
        const {classes, seleccionado} = this.props;
        const {capas, height, width, capaS} = this.state;

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
                        >
                            {'Configuracion '+ Morfologia.tipos_texto[seleccionado.userData.tipo] }
                        </Typography>

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
                                                               style={{backgroundColor: this.info_material[capa.material].colorSelected}}
                                                               value={capa.index}
                                                               onClick={this.clickCapa}>
                                                            <IconButton style={{color: this.info_material[capa.material].textColor}}
                                                                        className={classes.button}
                                                                        value={capa.index}
                                                                        onClick={this.handleClickBorrar}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.info_material[capa.material].hasOwnProperty('tipos') ?
                                                                <div>
                                                                    {(this.info_material[capa.material].material + this.info_material[capa.material].tipos[capa.tipo].nombre).split('').map(char =>
                                                                        <Typography value={capa.index} style={{color: this.info_material[capa.material].textColor}}>{char}</Typography>)}
                                                                </div>
                                                                :
                                                                <div>
                                                                    {this.info_material[capa.material].material.split('').map(char =>
                                                                        <Typography value={capa.index} style={{color: this.info_material[capa.material].textColor}}>{char}</Typography>)}
                                                                </div>
                                                            }
                                                        </Paper> :
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.info_material[capa.material].color}}
                                                               value={capa.index}
                                                               onClick={this.clickCapa}>
                                                            <IconButton style={{color: this.info_material[capa.material].textColor}}
                                                                        className={classes.button}
                                                                        value={capa.index}
                                                                        onClick={this.handleClickBorrar}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.info_material[capa.material].hasOwnProperty('tipos') ?
                                                                <div>
                                                                    {(this.info_material[capa.material].material + this.info_material[capa.material].tipos[capa.tipo].nombre).split('').map(char =>
                                                                        <Typography value={capa.index} style={{color: this.info_material[capa.material].textColor}}>{char}</Typography>)}
                                                                </div>
                                                                :
                                                                <div>
                                                                    {this.info_material[capa.material].material.split('').map(char =>
                                                                        <Typography value={capa.index} style={{color: this.info_material[capa.material].textColor}}>{char}</Typography>)}
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
                                        <Grid item xs={12}>
                                            <Grid item xs={12}>
                                                <FormControl className={classes.formControl}>
                                                    <InputLabel htmlFor="material-simple">Material</InputLabel>
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
                                            {hasTipos ?
                                                <Grid item xs={12}>
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
                                                </Grid> : <div/>
                                            }
                                            {hasTipos ?
                                                <Grid item xs={12}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[material].tipos[tipo].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>  : <div/>
                                            }

                                            {hasTipos ?
                                                <Grid item xs={12}>
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
                                            {!hasTipos ?
                                                <Grid item xs={12}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.info_material[material].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>  : <div/>
                                            }

                                            {!hasTipos ?
                                                <Grid item xs={12}>
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
                                            <Grid item xs={12}>
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
                                                        margin="normal"
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

                                    <Grid item xs={12}>
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
                                                margin="normal"
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
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
                                                margin="normal"
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Radiación Solar</Typography>
                            </ExpansionPanelSummary>
                            {this.info_rb}

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