import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {withStyles} from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Undo from "@material-ui/icons/Undo";
import Redo from "@material-ui/icons/Redo";
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';



const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    typography: {
        padding: theme.spacing.unit * 2,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 100,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
});

class InfoObstruccion extends Component{
    constructor(props){
        super(props);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.timer = null;
        // this.state ={
        //     altura: this.props.selectedObstruction.geometry.parameters.height,
        //     longitud: this.props.selectedObstruction.geometry.parameters.width,
        // }
        // 
    }

    // componentDidUpdate(prevProps,prevState, snapshot){
    //     
    //     
    //     if(this.props !== prevProps){
    //         this.setState({
    //             altura: this.props.selectedObstruction.geometry.parameters.height,
    //             longitud: this.props.selectedObstruction.geometry.parameters.width,
    //         });
    //     }
    // }

    handleMouseDown(sentido){
        let rotationFunction = this.props.handleRotation;
        this.timer = setInterval(function(){rotationFunction(sentido);}, 100);

    }
    handleMouseUp(event){
        clearInterval(this.timer);
    }
    handleClick(sentido){
        this.props.handleRotation(sentido);
    }

    handleChange(event){
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.props.handleChange(name,value);
    }

    render(){
        //
        const {classes} = this.props;
        return(
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Grid container spacing={0}>
                        <Grid item xs={6}>
                            <TextField
                                name="altura"
                                type="number"
                                label="Altura"
                                className={classes.textField}
                                value={this.props.selectedObstruction.geometry.parameters.height}
                                onChange={this.handleChange}
                            />
                            <Typography className={classes.typography}>Rotar</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid item xs={12}>
                                <TextField
                                    name="longitud"
                                    type="number"
                                    label="Longitud"
                                    className={classes.textField}
                                    value={this.props.selectedObstruction.geometry.parameters.width}
                                    onChange={this.handleChange}
                                />
                            </Grid>


                            <Tooltip title="Horario">
                                <IconButton
                                    className={classes.button}
                                    aria-label="Redo"
                                    onMouseDown={this.handleMouseDown.bind(this,1)}
                                    onMouseUp={this.handleMouseUp}
                                    onClick={this.handleClick.bind(this,1)}
                                >
                                    <Redo/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Antihorario">
                                <IconButton
                                    className={classes.button}
                                    aria-label="Undo"
                                    onMouseDown={this.handleMouseDown.bind(this,-1)}
                                    onMouseUp={this.handleMouseUp}
                                    onClick={this.handleClick.bind(this,-1)}
                                >
                                    <Undo/>
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Paper>

            </div>
        )
    }
}

InfoObstruccion.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(InfoObstruccion);