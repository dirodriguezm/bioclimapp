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
import Grid from "@material-ui/core/Grid";
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


class InformacionPuerta extends Component {

    constructor(props) {
        super(props);

        this.state = {
            capa: {},

        };
        this.info_material = [];
        axios.get("https://bioclimapp.host/api/info_materiales")
            .then(response => this.getJson(response));
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeMaterial = this.handleChangeMaterial.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.seleccionado !== prevProps.seleccionado && this.props.seleccionado.userData.tipo === Morfologia.tipos.PUERTA) {

            if (this.props !== null) {
                let capa = this.props.seleccionado.userData.info_material;

                this.setState({
                    capa: capa,
                });


            }
        }
    }

    getJson(response) {

        this.info_material = response.data.slice();
        for (let i = 0; i < this.info_material.length; i++) {
            this.info_material[i].index = i;


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

    handleChangeMaterial(event){
        let capa = this.state.capa;

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
            capa.espesor =  event.target.value/1000;
        }

        this.setState({
            capa: capa,
        });

        //TODO: crear onMaterialChanged
        this.props.onCapaChanged();
    }

    handleChangeDimension(event) {
        let puerta = this.props.seleccionado;
        let height = puerta.userData.height, width = puerta.userData.width;
        if (event.target.name === 'altura') {
            if(parseInt(event.target.value) >= height){
                height += 0.1;
            }else{
                height -= 0.1;
            }
        } else {
            if(parseInt(event.target.value) >= width){
                width += 0.1;
            }else{
                width -= 0.1;
            }
        }
        this.props.onDimensionChanged(puerta, width, height);
    }

    render() {
        const {classes, seleccionado} = this.props;
        const {capa} = this.state;

        let height, width;
        if(seleccionado !== null){
            height = seleccionado.userData.height;
            width = seleccionado.userData.width;
        }
        let material, tipo, espesor, propiedad;

        if(Object.keys(capa).length > 0){
            material = capa.material;
            tipo = capa.tipo;
            espesor = capa.espesor;
            propiedad = capa.propiedad;
        }

        let hasTipos;

        if (seleccionado !== null && this.info_material.length > 0 && seleccionado.userData.tipo === Morfologia.tipos.PUERTA && Object.keys(capa).length > 0) {
            hasTipos = this.info_material[material].hasOwnProperty('tipos');
        } else {
            hasTipos = null;
        }
        return (
            <div>
                {seleccionado !== null && seleccionado.userData.tipo === Morfologia.tipos.PUERTA && Object.keys(capa).length > 0 ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            className={classes.titulo}
                        >
                            {'Configuracion '+ Morfologia.tipos_texto[seleccionado.userData.tipo] }
                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Materiales</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid container spacing={8}>
                                        {hasTipos ?
                                            <Grid container spacing={0} style={{
                                                marginBottom : 4,
                                                marginLeft : 4,
                                                marginRight : 4,}}>
                                                <Grid item xs={6}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="material-simple">Material puerta</InputLabel>
                                                        <Select
                                                            value={material}
                                                            onChange={this.handleChangeMaterial}
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
                                                            onChange={this.handleChangeMaterial}
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
                                                    <InputLabel htmlFor="material-simple">Material</InputLabel>
                                                    <Select
                                                        value={material}
                                                        onChange={this.handleChangeMaterial}
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
                                                        onChange={this.handleChangeMaterial}
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
                                                        onChange={this.handleChangeMaterial}
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
                                                        onChange={this.handleChangeMaterial}
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
                                                        onChange={this.handleChangeMaterial}
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
                                                    onChange={this.handleChangeMaterial}
                                                    type="number"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>

                                    </Grid>
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

InformacionPuerta.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccionado: PropTypes.object,
    onDimensionChanged: PropTypes.func,
}

export default withStyles(styles)(InformacionPuerta);