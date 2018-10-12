import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import InformacionPared from './InformacionPared'
import InformacionVentana from './InformacionVentana'
import InformacionPuerta from "./InformacionPuerta";
import InformacionPisoTecho from "./InformacionPisoTecho";

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


class InformacionEstructura extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        const {classes, seleccionado, onDimensionChanged, onCapaChanged,onAlturaVentanaChanged} = this.props;


        return (
            <div>
                <InformacionPared
                    seleccionado={seleccionado}
                    onDimensionChanged={onDimensionChanged}
                    onCapaChanged={onCapaChanged}

                />

                <InformacionVentana
                    seleccionado={seleccionado}
                    onDimensionChanged={onDimensionChanged}
                    onAlturaVentanaChanged={onAlturaVentanaChanged}
                    comuna={this.props.comuna}
                    onAporteSolarChanged={this.props.onAporteSolarChanged}
                    onCapaChanged={onCapaChanged}

                />

                <InformacionPuerta
                    seleccionado={seleccionado}
                    onDimensionChanged={onDimensionChanged}
                    onCapaChanged={onCapaChanged}

                />

                <InformacionPisoTecho
                    onDimensionChanged={onDimensionChanged}
                    seleccionado={seleccionado}
                    onCapaChanged={onCapaChanged}
                />

            </div>
        );

    }
}

InformacionEstructura.propTypes = {
    classes: PropTypes.object.isRequired,
    onDimensionChanged: PropTypes.func,
    onAlturaVentanaChanged: PropTypes.func,
    onCapaChanged: PropTypes.func,
    seleccionado: PropTypes.object,
};

export default withStyles(styles)(InformacionEstructura);