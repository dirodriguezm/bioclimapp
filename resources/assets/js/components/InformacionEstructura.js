import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import InformacionPared from './InformacionPared'
import InformacionVentana from './InformacionVentana'

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
        const {classes, seleccionado} = this.props;


        return (
            <div>
                <InformacionPared
                    seleccionado={seleccionado}
                />

                <InformacionVentana
                    seleccionado={seleccionado}
                />
            </div>
        );

    }
}

InformacionEstructura.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccionado: PropTypes.object,
};

export default withStyles(styles)(InformacionEstructura);