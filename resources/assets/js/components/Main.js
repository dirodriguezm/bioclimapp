import React, {Component} from 'react';
import TabPanel from "./TabPanel";
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
});

class Main extends Component {
    constructor(props) {
        super(props);
    }


    render() {


        return (
            <div></div>
        );
    }
}

export default withStyles(styles)(Main)
