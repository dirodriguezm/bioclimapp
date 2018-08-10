import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Delete from '@material-ui/icons/Delete';
import AddCircle from '@material-ui/icons/AddCircle'
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
    }

    handleSeleccionar(event) {
        this.setState({seleccionar: true});
        this.props.seleccionar();
    }

    handleAgregar(event) {
        this.setState({agregar: true});
        this.props.agregarContexto();
    }

    handleBorrar(event){
        this.setState({borrar: true});
        this.props.borrarContexto();
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.root} align="center">
                <Tooltip title="Deshacer">
                    <IconButton className={classes.button} aria-label="Undo">
                        <Undo/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Rehacer">
                    <IconButton className={classes.button} aria-label="Redo">
                        <Redo/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Seleccionar">
                    <IconButton className={classes.button} aria-label="Seleccionar"
                                onClick={this.handleSeleccionar}>
                        <CursorIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Agregar">
                    <IconButton
                        className={classes.button}
                        aria-label="Agregar"
                        onClick={this.handleAgregar}
                    >
                        <AddCircle/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Borrar">
                    <IconButton
                        className={classes.button}
                        aria-label="Borrar"
                        onClick={this.handleBorrar}
                    >
                        <Delete/>
                    </IconButton>
                </Tooltip>
            </div>

        );
    }
}

BarraHerramientasContexto.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(BarraHerramientasContexto);
