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

import classNames from 'classnames';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';

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
        minWidth: 120,
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },

});


class InformacionEstructura extends Component {

    constructor(props) {
        super(props);
        this.state = {
            materiales: [],
            single: null,
            material: 0,
            tipo: 0,
            espesor: 0,

        };
        this.info_material = [];
        axios.get("http://127.0.0.1:8000/api/info_materiales")
            .then(response => this.getJson(response));
        this.handleChange = this.handleChange.bind(this);
    }

    getJson(response) {
        this.info_material = response.data;
        for (let i = 0; i < this.info_material.length; i++) {
            this.info_material[i].index = i;
            if(this.info_material[i].hasOwnProperty('tipos')){
                for(let j = 0; j < this.info_material[i].tipos.length ; j++){
                    this.info_material[i].tipos[j].index = j;
                }
            }
        }
        console.log(this.info_material)
    }


    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        })
    }

    render() {
        const {classes, seleccionado} = this.props;
        const {material, tipo, espesor} = this.state;
        return (
            <div>
                {seleccionado !== null ?
                    <div className={classes.root}>
                        <Typography
                            variant={"display1"}
                        >
                            {Morfologia.tipos_texto[seleccionado.tipo] + ' ' + seleccionado.id}
                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Materiales</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <form className={classes.form} autoComplete="off">
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
                                    {this.info_material[material].hasOwnProperty('tipos') ?
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
                                        :
                                        <div/>
                                    }

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

                                    

                                </form>
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
                    </div> :
                    <div></div>
                }
            </div>
        );

    }
}

InformacionEstructura.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccionado: PropTypes.object,
};

export default withStyles(styles)(InformacionEstructura);