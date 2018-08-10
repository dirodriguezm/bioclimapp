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


import classNames from 'classnames';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from "@material-ui/core/InputLabel";

const ITEM_HEIGHT = 48;

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    avatar: {
        margin: 10,
    },
    root: {
        width: '100%',
    },
    paper: {
        marginRight: theme.spacing.unit * 2,
    },
    popperClose: {
        pointerEvents: 'none',
    },
    input: {
        display: 'flex',
        padding: 0,
    },
    valueContainer: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        fontSize: 16,
    },
    noOptionsMessage: {
        fontSize: 16,
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },

});





class InformacionEstructura extends Component {

    constructor(props) {
        super(props);
        this.state = {
            materiales: [],
            single: null,
            material: null,

        };
        this.info_material = [];
        axios.get("http://127.0.0.1:8000/api/info_materiales")
            .then( response => this.getJson(response));
        this.handleChange = this.handleChange.bind(this);
    }

    getJson(response){
        this.info_material = response.data;
        console.log(this.info_material)
    }

    handleChange(value) {
        this.setState({
            single: value,
        });
    };

    handleChangeSel(value) {
        this.setState({
            material: value,
        })
    }

    render() {
        const {classes, seleccionado} = this.props;
        const {single} = this.state;
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
                                <InputLabel htmlFor="age-simple">Age</InputLabel>
                                <Select
                                    value={this.state.age}
                                    onChange={this.handleChange}
                                    inputProps={{
                                        name: 'age',
                                        id: 'age-simple',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>

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