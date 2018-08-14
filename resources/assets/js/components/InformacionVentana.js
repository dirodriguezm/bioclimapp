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

const ITEM_HEIGHT = 48;

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    root: {
        width: '100%',
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
            materiales: [],
            material: 0,
            tipo: 0,
            propiedad: 0,

        };
        this.info_material = [];
        axios.get("http://127.0.0.1:8000/api/info_ventanas")
            .then(response => this.getJson(response));
        this.handleChange = this.handleChange.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
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


    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        })
    }

    handleClickAgregar() {
        let materiales = this.state.materiales;
        materiales.push({
            material: this.state.material,
            tipo: this.state.tipo,
            propiedad: this.state.propiedad
        });
        this.setState({
            materiales: materiales,
        })

    }

    render() {
        const {classes, seleccionado} = this.props;
        const {material, tipo, espesor, propiedad} = this.state;
        console.log(this.info_material)

        return (
            <div>
                {seleccionado !== null && seleccionado.tipo === Morfologia.tipos.VENTANA ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                        >
                            {Morfologia.tipos_texto[seleccionado.tipo] + ' ' + seleccionado.id}
                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Materiales</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>


                                    <Grid item xs={12}>
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
                                    <Grid item xs={12}>
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
                                    <Grid item xs={12}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="U-ventana">U</InputLabel>
                                            <Select
                                                value={propiedad}
                                                onChange={this.handleChange}
                                                input={<Input name="propiedad" id="U-ventana"/>}
                                            >
                                                <MenuItem value={0}>
                                                    {this.info_material[material].tipos[tipo].propiedad.U}
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="FS-ventana">FS</InputLabel>
                                            <Select
                                                value={propiedad}
                                                onChange={this.handleChange}
                                                input={<Input name="propiedad" id="FS-ventana"/>}
                                            >
                                                <MenuItem value={0}>
                                                    {this.info_material[material].tipos[tipo].propiedad.FS}
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button variant="contained" color="secondary" className={classes.button}
                                                onClick={this.handleClickAgregar}
                                        >
                                            Guardar
                                        </Button>
                                    </Grid>


                                </Grid>


                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Dimensiones</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Typography>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus
                                    ex,
                                    sit amet blandit leo lobortis eget.
                                </Typography>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <Button variant="contained" color="secondary" className={classes.button}>
                            Borrar
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