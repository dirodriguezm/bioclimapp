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
import FormControl from '@material-ui/core/FormControl'
    ;
import Clear from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent/CardContent";

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


class InformacionPared extends Component {

    constructor(props) {
        super(props);
        this.state = {
            materiales: [],
            single: null,
            material: 0,
            tipo: 0,
            espesor: 0,
            propiedad: 0,

        };
        this.info_material = [];
        axios.get("http://127.0.0.1:8000/api/info_materiales")
            .then(response => this.getJson(response));
        this.handleChange = this.handleChange.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
    }

    getJson(response) {
        this.info_material = response.data.slice();
        for (let i = 0; i < this.info_material.length; i++) {
            this.info_material[i].index = i;
            if (this.info_material[i].hasOwnProperty('tipos')) {
                for (let j = 0; j < this.info_material[i].tipos.length; j++) {
                    this.info_material[i].tipos[j].index = j;
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
        })
    }

    handleClickAgregar() {
        let materiales = this.state.materiales;
        materiales.push({
            material: this.state.material,
            tipo: this.state.tipo,
            espesor: this.state.espesor,
            propiedad: this.state.propiedad
        });
        this.setState({
            materiales: materiales,
        })

    }

    render() {
        const {classes, seleccionado} = this.props;
        const {material, tipo, espesor, propiedad, materiales} = this.state;
        let hasTipos;

        if (seleccionado !== null && this.info_material.length > 0 && seleccionado.tipo === Morfologia.tipos.PARED) {
            hasTipos = this.info_material[material].hasOwnProperty('tipos');
        } else {
            hasTipos = null;
        }

        return (
            <div>
                {seleccionado !== null && seleccionado.tipo === Morfologia.tipos.PARED ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                        >
                            {Morfologia.tipos_texto[seleccionado.tipo] + ' ' + seleccionado.id}
                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Capas</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={12}>
                                        {materiales.length === 0 ?
                                            <Typography
                                                variant={"subheading"}
                                            >
                                                {"No hay capas"}
                                            </Typography>
                                            :
                                            <List>
                                                {materiales.map(material => (
                                                    <ListItem>
                                                        <ExpansionPanel>
                                                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                                                <Typography className={classes.heading}>
                                                                    {this.info_material[material.material].material}
                                                                </Typography>
                                                            </ExpansionPanelSummary>
                                                            <ExpansionPanelDetails>
                                                                <Grid container spacing={8}>
                                                                    {this.info_material[material.material].hasOwnProperty('tipos') ?
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                label="Tipo"
                                                                                defaultValue={this.info_material[material.material].tipos[material.tipo].nombre}
                                                                                className={classes.textField}
                                                                                margin="normal"
                                                                                InputProps={{
                                                                                    readOnly: true,
                                                                                }}
                                                                            />
                                                                        </Grid>
                                                                        :
                                                                        <div/>
                                                                    }
                                                                    {this.info_material[material.material].hasOwnProperty('tipos') ?
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                label="Densidad"
                                                                                defaultValue={this.info_material[material.material].tipos[material.tipo].propiedad.densidad}
                                                                                className={classes.textField}
                                                                                margin="normal"
                                                                                InputProps={{
                                                                                    readOnly: true,
                                                                                }}
                                                                            />
                                                                        </Grid>
                                                                        :
                                                                        <div/>
                                                                    }
                                                                    {this.info_material[material.material].hasOwnProperty('tipos') ?
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                label="Conductividad"
                                                                                defaultValue={this.info_material[material.material].tipos[material.tipo].propiedad.conductividad}
                                                                                className={classes.textField}
                                                                                margin="normal"
                                                                                InputProps={{
                                                                                    readOnly: true,
                                                                                }}
                                                                            />
                                                                        </Grid>
                                                                        :
                                                                        <div/>
                                                                    }
                                                                    {!this.info_material[material.material].hasOwnProperty('tipos') ?
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                label="Densidad"
                                                                                defaultValue={this.info_material[material.material].propiedades[material.propiedad].densidad}
                                                                                className={classes.textField}
                                                                                margin="normal"
                                                                                InputProps={{
                                                                                    readOnly: true,
                                                                                }}
                                                                            />
                                                                        </Grid>
                                                                        :
                                                                        <div/>
                                                                    }
                                                                    {!this.info_material[material.material].hasOwnProperty('tipos') ?
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                label="Conductividad"
                                                                                defaultValue={this.info_material[material.material].propiedades[material.propiedad].conductividad}
                                                                                className={classes.textField}
                                                                                margin="normal"
                                                                                InputProps={{
                                                                                    readOnly: true,
                                                                                }}
                                                                            />
                                                                        </Grid>
                                                                        :
                                                                        <div/>
                                                                    }
                                                                    <Grid item xs={12}>
                                                                        <TextField
                                                                            label="Espesor (mm)"
                                                                            defaultValue={material.espesor}
                                                                            className={classes.textField}
                                                                            margin="normal"
                                                                            InputProps={{
                                                                                readOnly: true,
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                </Grid>

                                                            </ExpansionPanelDetails>
                                                            <ExpansionPanelActions>
                                                                <Button size="small" color="primary">
                                                                    Borrar
                                                                </Button>
                                                            </ExpansionPanelActions>

                                                        </ExpansionPanel>
                                                    </ListItem>
                                                ), this)}
                                            </List>
                                        }

                                    </Grid>


                                    <Grid item xs={12}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="material-simple">Material</InputLabel>
                                            <Select
                                                value={material}
                                                onChange={this.handleChange}
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
                                                    onChange={this.handleChange}
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
                                                <InputLabel htmlFor="densidad-simple">Densidad</InputLabel>
                                                <Select
                                                    value={propiedad}
                                                    onChange={this.handleChange}
                                                    input={<Input name="propiedad" id="densidad-simple"/>}
                                                >
                                                    <MenuItem value={0}>
                                                        {this.info_material[material].tipos[tipo].propiedad.densidad}
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid> : <div/>
                                    }
                                    {hasTipos ?
                                        <Grid item xs={12}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                <Select
                                                    value={propiedad}
                                                    onChange={this.handleChange}
                                                    input={<Input name="propiedad" id="conductividad-simple"/>}
                                                >
                                                    <MenuItem value={0}>
                                                        {this.info_material[material].tipos[tipo].propiedad.conductividad}
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid> : <div/>
                                    }
                                    {!hasTipos ?
                                        <Grid item xs={12}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="densidad-simple">Densidad</InputLabel>
                                                <Select
                                                    value={propiedad}
                                                    onChange={this.handleChange}
                                                    input={<Input name="propiedad" id="densidad-simple"/>}
                                                >
                                                    {this.info_material[material].propiedades.map(propiedades => (
                                                        <MenuItem value={propiedades.index}>
                                                            {propiedades.densidad}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid> : <div/>
                                    }

                                    {!hasTipos ?
                                        <Grid item xs={12}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                <Select
                                                    value={propiedad}
                                                    onChange={this.handleChange}
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
                                                value={espesor}
                                                onChange={this.handleChange}
                                                type="number"
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                margin="normal"
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button variant="contained" color="secondary" className={classes.button}
                                                onClick={this.handleClickAgregar}
                                        >
                                            Agregar
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
                                    dimensiones
                                </Typography>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Dimensiones</Typography>
                            </ExpansionPanelSummary>
                            {seleccionado.omegas.wm.desde != null ?
                                <ExpansionPanelDetails>
                                    La pared recibe sol
                                    desde: {seleccionado.omegas.wm.desde.getHours()}:{seleccionado.omegas.wm.desde.getMinutes()}
                                </ExpansionPanelDetails> : <ExpansionPanelDetails>Desde: -</ExpansionPanelDetails>
                            }
                            {seleccionado.omegas.wm.hasta!= null ?
                                <ExpansionPanelDetails>
                                    Hasta: {seleccionado.omegas.wm.hasta.getHours()}:{seleccionado.omegas.wm.hasta.getMinutes()}
                                </ExpansionPanelDetails> : <ExpansionPanelDetails>Hasta: -</ExpansionPanelDetails>
                            }
                            {seleccionado.omegas.wt.desde != null ?
                                <ExpansionPanelDetails>
                                    Y
                                    desde: {seleccionado.omegas.wt.desde.getHours()}:{seleccionado.omegas.wt.desde.getMinutes()}
                                </ExpansionPanelDetails> : <ExpansionPanelDetails>Desde: -</ExpansionPanelDetails>
                            }
                            {seleccionado.omegas.wt.hasta!= null ?
                                <ExpansionPanelDetails>
                                    Hasta: {seleccionado.omegas.wt.hasta.getHours()}:{seleccionado.omegas.wt.hasta.getMinutes()}
                                </ExpansionPanelDetails> : <ExpansionPanelDetails>Hasta: -</ExpansionPanelDetails>
                            }
                            <ExpansionPanelDetails>
                                RB: {seleccionado.rb}
                            </ExpansionPanelDetails> : <ExpansionPanelDetails>Hasta: -</ExpansionPanelDetails>

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

InformacionPared.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccionado: PropTypes.object,
};

export default withStyles(styles)(InformacionPared);