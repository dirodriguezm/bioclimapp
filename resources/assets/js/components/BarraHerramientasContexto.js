import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Delete from '@material-ui/icons/Delete';
import AddCircle from '@material-ui/icons/AddCircle';
import Map from '@material-ui/icons/Map';
import SvgIcon from '@material-ui/core/SvgIcon';
import Tooltip from '@material-ui/core/Tooltip';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
    avatar: {
        margin: 10,
    },
    root: {
        display: 'flex',
    },
    paper: {
        marginRight: theme.spacing.unit * 2,
    },
    popperClose: {
        pointerEvents: 'none',
    },
});

function CursorIcon(props) {
    return (
        <SvgIcon>
            <path
                d="M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z"/>
        </SvgIcon>
    );
};

function MapIcon(props) {
    return (
        <SvgIcon viewBox="0 0 64 64">
            <path fill="#757575"
                  d="M52 32a10 10 0 0 0-10 10c0 9 10 20 10 20s10-11 10-20a10 10 0 0 0-10-10zm0 12a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"
                  data-name="layer2"></path>
            <path d="M16 10.7L2 2v42.1l14 8.7V10.7zm18-7.6l-14 7.7v42.1l14-7.7V3.1zM38 42a14 14 0 0 1 14-14l2 .2V11.9L38 3.1"
                  fill="#757575" data-name="layer1"></path>
        </SvgIcon>
    );
};

class BarraHerramientasContexto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seleccionar: false,
            agregar: false,
        };
        this.handleSeleccionar = this.handleSeleccionar.bind(this);
        this.handleAgregar = this.handleAgregar.bind(this);
        this.handleBorrar = this.handleBorrar.bind(this);
        this.handleSeleccionarLocalidad = this.handleSeleccionarLocalidad.bind(this);
    }

    handleSeleccionar(event) {
        //this.setState({seleccionar: true});
        this.props.seleccionar();
    }

    handleAgregar(event) {
        //this.setState({agregar: true});
        this.props.agregarContexto();
    }

    handleBorrar(event){
        //this.setState({borrar: true});
        this.props.borrarContexto();
    }

    handleSeleccionarLocalidad(){
        this.props.onSeleccionarLocalidad();
    }

    render() {
        const {classes,width} = this.props;

        const cuartoWidth = width/4+'px';
        return (
            <div style={{
                display: 'table',
                marginLeft: 'auto',
                marginRight:'auto',
            }}>
            <div className={classes.root} align="center">

                <Tooltip title="Seleccionar obstrucción">
                    <IconButton className={classes.button} aria-label="Seleccionar"
                                onClick={this.handleSeleccionar}>
                        <CursorIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Agregar obstrucción">
                    <IconButton
                        className={classes.button}
                        aria-label="Agregar"
                        onClick={this.handleAgregar}
                    >
                        <AddCircle/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Borrar obstrucción">
                    <IconButton
                        className={classes.button}
                        aria-label="Borrar"
                        onClick={this.handleBorrar}
                    >
                        <Delete/>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Seleccionar localidad" style={{
                }}>
                    <IconButton className={classes.button} aria-label="Undo" onClick={this.handleSeleccionarLocalidad}>
                        <MapIcon/>
                    </IconButton>
                </Tooltip>
            </div></div>

        );
    }
}

BarraHerramientasContexto.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(BarraHerramientasContexto);
