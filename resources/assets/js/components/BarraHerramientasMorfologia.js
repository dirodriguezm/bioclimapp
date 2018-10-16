import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Delete from '@material-ui/icons/Delete';
import AddCircle from '@material-ui/icons/AddCircle'
import SvgIcon from '@material-ui/core/SvgIcon';
import Tooltip from '@material-ui/core/Tooltip';
import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
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

function WallIcon() {
    return (
        <SvgIcon>
            <path
                d="M3,16H12V21H3V16M2,10H8V15H2V10M9,10H15V15H9V10M16,10H22V15H16V10M13,16H21V21H13V16M3,4H11V9H3V4M12,4H21V9H12V4Z"/>
        </SvgIcon>
    );
}

function DoorIcon() {
    return (
        <SvgIcon>
            <path d="M8,3C6.89,3 6,3.89 6,5V21H18V5C18,3.89 17.11,3 16,3H8M8,5H16V19H8V5M13,11V13H15V11H13Z"/>
        </SvgIcon>
    );
}

function WindowIcon(props) {
    return (
        <SvgIcon {...props}
                 viewBox="0 0 512 512"
                 height="512mm"
                 width="512mm"
        >
            <path d="M3.862,35.182h17.922V512H146.93v-17.591c0-4.937-0.05-9.744-0.147-14.433h218.433c-0.095,4.689-0.147,9.496-0.147,14.433
                V512h125.146V35.182h17.922V0H3.862V35.182z M293.992,35.182c-0.263,50.122,0.296,125.044,52.217,214.245h-72.617V35.182H293.992z
                 M273.592,284.609h95.359c9.131,12.825,19.363,25.896,30.844,39.188c-11.551,17.407-27.499,53.045-32.871,120.997h-93.332V284.609
                z M218.009,35.182h20.401v214.245h-72.617C217.713,160.226,218.271,85.304,218.009,35.182z M143.051,284.609h95.359v160.185
                h-93.332c-5.371-67.952-21.319-103.59-32.871-120.997C123.688,310.505,133.92,297.434,143.051,284.609z"/>

        </SvgIcon>
    );
}


function FloorIcon(props) {
    return (
        <SvgIcon {...props}
                 viewBox="0 0 140.591 140.591"
                 height="140.591mm"
                 width="140.591mm"
        >
            <path d="M138.091,140.591H2.5c-1.381,0-2.5-1.119-2.5-2.5V2.5C0,1.119,1.119,0,2.5,0h135.591
                c1.381,0,2.5,1.119,2.5,2.5v135.591C140.591,139.472,139.472,140.591,138.091,140.591z M105.118,135.591h30.473v-30.473
                l-28.266,28.266c-0.004,0.004-0.008,0.009-0.013,0.013c-0.004,0.004-0.009,0.009-0.013,0.013L105.118,135.591z M66.202,135.591
                h31.846l3.962-3.962l-15.923-15.923L66.202,135.591z M29.869,135.591h29.262l43.462-43.462L87.962,77.498l-46.149,46.149l0,0
                L29.869,135.591z M5,135.591h17.798l13.712-13.712l-15.362-15.362L5,122.665V135.591z M89.622,112.17l15.923,15.923l30.046-30.046
                V66.202l-27.695,27.695l0,0L89.622,112.17z M24.684,102.981l15.361,15.362l76.673-76.673l-15.362-15.362L71.297,56.368
                c-0.003,0.002-0.005,0.004-0.007,0.006L24.684,102.981z M5,82.009v33.584l14.354-14.355c0.009-0.008,0.017-0.017,0.025-0.025
                c0.008-0.009,0.017-0.017,0.025-0.025l46.582-46.583L49.545,38.164L5,82.009z M91.497,73.962l14.631,14.631l29.39-29.389
                c0.024-0.024,0.049-0.048,0.073-0.071V29.868L91.497,73.962z M5,41.208v33.785l19.798-19.487L7.833,38.54L5,41.208z M11.474,35.11
                l16.888,16.888l47.58-46.832H43.265L11.474,35.11z M53.108,34.656L69.522,51.07L115.593,5H83.238L53.108,34.656z M104.891,22.773
                l15.362,15.362l15.338-15.338V5h-12.927L104.891,22.773z M5,5v29.34l0.935-0.88c0.053-0.064,0.108-0.125,0.168-0.185
                c0.096-0.096,0.198-0.183,0.305-0.26L36.148,5H5z"/>

        </SvgIcon>
    );
}

function IconThreeD(props) {
    return (
        <SvgIcon {...props}
                 viewBox="0 0 58.415039 37.107819"
                 height="37.107819mm"
                 width="58.415039mm">
            <g transform="translate(-75.633031,-57.989119)">
                <g transform="translate(-23.821359,-13.574074)">
                    <path
                        d="M 130.26181,108.17491 V 72.059287 h 11.1125 q 4.7625,0 8.50801,2.158008 3.77031,2.133203 5.87871,6.101953 2.1084,3.943945 2.1084,8.979297 v 1.661914 q 0,5.035351 -2.08359,8.954492 -2.05879,3.919139 -5.82911,6.077149 -3.77031,2.15801 -8.508,2.18281 z m 7.44141,-30.088084 v 24.110154 h 3.59668 q 4.36562,0 6.67246,-2.852537 2.30683,-2.852539 2.35644,-8.160742 V 89.27374 q 0,-5.506641 -2.28203,-8.334375 -2.28203,-2.852539 -6.67246,-2.852539 z m -30.08809,8.855273 h 3.81992 q 2.72852,0 4.04317,-1.364257 1.31465,-1.364258 1.31465,-3.621485 0,-2.182812 -1.31465,-3.398242 -1.28985,-1.21543 -3.57188,-1.21543 -2.05879,0 -3.44785,1.141016 -1.38906,1.116211 -1.38906,2.926953 h -7.168556 q 0,-2.827734 1.513086,-5.060156 1.53789,-2.257227 4.26641,-3.522266 2.75332,-1.265039 6.05234,-1.265039 5.72988,0 8.9793,2.753321 3.24941,2.728515 3.24941,7.540624 0,2.480469 -1.51309,4.564063 -1.51308,2.083594 -3.96875,3.199805 3.05098,1.091406 4.53926,3.274218 1.51309,2.182813 1.51309,5.159375 0,4.812111 -3.52227,7.714261 -3.49746,2.90215 -9.27695,2.90215 -5.40742,0 -8.85527,-2.85254 -3.42305,-2.85254 -3.42305,-7.540629 h 7.16855 q 0,2.033989 1.51309,3.323829 1.53789,1.28984 3.77031,1.28984 2.55489,0 3.99356,-1.33945 1.46347,-1.36426 1.46347,-3.59668 0,-5.407421 -5.95312,-5.407421 h -3.79512 z"
                    />
                </g>
            </g>
        </SvgIcon>
    );
}

function IconTwoD(props) {
    return (
        <SvgIcon {...props}
                 viewBox="0 0 58.266216 36.611725"
                 height="36.611725mm"
                 width="58.266216mm">
            <g
                transform="translate(-66.872842,-90.461997)">
                <path
                    d="m 79.424022,90.461997 c -2.43086,0 -4.60541,0.520898 -6.52364,1.562695 -1.91823,1.02526 -3.40651,2.447396 -4.46484,4.266407 -1.0418,1.81901 -1.5627,3.828191 -1.5627,6.027541 h 7.19336 c 0,-1.81901 0.46302,-3.282489 1.38907,-4.390432 0.94257,-1.124479 2.22415,-1.686719 3.84472,-1.686719 1.50482,0 2.66237,0.463021 3.47266,1.389063 0.81029,0.909505 1.21543,2.166276 1.21543,3.770308 0,1.17409 -0.38861,2.41433 -1.16582,3.72071 -0.76068,1.30638 -1.94304,2.836 -3.54707,4.58886 l -11.68301,12.45196 v 4.91133 h 24.75508 v -5.7795 h -15.52774 l 8.21036,-8.65683 c 2.24895,-2.46393 3.83645,-4.62194 4.7625,-6.47403 0.92604,-1.85208 1.38906,-3.67109 1.38906,-5.45703 0,-3.257679 -1.03353,-5.779489 -3.10059,-7.565427 -2.05052,-1.785938 -4.93613,-2.678906 -8.65683,-2.678906 z m 18.10742,0.496094 v 36.115629 h 11.186908 c 3.15846,-0.0165 5.99447,-0.74414 8.50801,-2.18282 2.51355,-1.43866 4.45658,-3.46438 5.8291,-6.07714 1.38906,-2.61277 2.0836,-5.5976 2.0836,-8.9545 v -1.66191 c 0,-3.3569 -0.7028,-6.35 -2.1084,-8.979298 -1.4056,-2.645833 -3.36517,-4.679818 -5.87871,-6.101953 -2.49701,-1.438672 -5.33301,-2.158008 -8.50801,-2.158008 z m 7.441398,6.027539 h 3.6711 c 2.92695,0 5.15111,0.950846 6.67246,2.852539 1.52135,1.885161 2.28203,4.663281 2.28203,8.334371 v 1.90997 c -0.0331,3.5388 -0.81856,6.25904 -2.35644,8.16074 -1.5379,1.90169 -3.76205,2.85254 -6.67247,2.85254 h -3.59668 z"
                />
            </g>
        </SvgIcon>
    );
}

function SimpleIcon(props) {
    return (
        <SvgIcon {...props}
                 viewBox="0 0 5.2916698 4.4979162"
                 height="4.4979162mm"
                 width="5.2916698mm">
            <g
                transform="translate(299.73512,64.326339)">
                <path
                    d="m -297.61845,-59.828423 v -1.5875 h 1.05833 v 1.5875 h 1.32292 v -2.116666 h 0.79375 l -2.64584,-2.38125 -2.64583,2.38125 h 0.79375 v 2.116666 z"
                />
            </g>
        </SvgIcon>
    );
}

function DoubleIcon(props) {
    return (
        <SvgIcon {...props}
                 viewBox="0 0 8.46667 4.4979172"
                 height="4.4979172mm"
                 width="8.46667mm">
            <g
                transform="translate(299.73512,64.326339)">
                <path
                    transform="matrix(0.26458333,0,0,0.26458333,-299.73512,-64.326339)"
                    d="M 10 0 L 0 9 L 3 9 L 3 17 L 8 17 L 8 11 L 12 11 L 12 17 L 15 17 L 17 17 L 20 17 L 20 11 L 24 11 L 24 17 L 29 17 L 29 9 L 32 9 L 22 0 L 16 5.4003906 L 10 0 z "
                />
            </g>
        </SvgIcon>
    );
}

function SimpleTwoFloorIcon(props) {
    return (
        <SvgIcon {...props}
                 viewBox="0 0 5.2916665 6.614583"
                 height="6.614583mm"
                 width="5.2916665mm">
            <g
                transform="translate(299.73512,66.443006)">
                <path
                    transform="matrix(0.26458333,0,0,0.26458333,-299.73512,-64.326339)"
                    d="M 10,-8 0,1 h 3 v 8 8 h 5 v -6 h 4 v 6 h 5 V 9 1 h 3 z"
                />
            </g>
        </SvgIcon>
    );
}

function DoubleTwoFloorIcon(props) {
    return (
        <SvgIcon {...props}
                 viewBox="0 0 8.46667 6.6145835"
                 height="6.6145835mm"
                 width="8.46667mm">
            <g
                transform="translate(299.73512,66.443006)">
                <path
                    transform="matrix(0.26458333,0,0,0.26458333,-299.73512,-66.443006)"
                    d="M 10 0 L 0 9 L 3 9 L 3 17 L 3 25 L 8 25 L 8 19 L 12 19 L 12 25 L 15 25 L 17 25 L 20 25 L 20 19 L 24 19 L 24 25 L 29 25 L 29 17 L 29 9 L 32 9 L 22 0 L 16 5.4003906 L 10 0 z "/>
                />
            </g>
        </SvgIcon>
    );
}

function CursorIcon() {
    return (
        <SvgIcon>
            <path
                d="M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z"/>
        </SvgIcon>
    );
}

function HomeIcon() {
    return (
        <SvgIcon>
            <path d="M12,3L2,12H5V20H19V12H22L12,3M11,10H13V13H16V15H13V18H11V15H8V13H11V10Z"/>
        </SvgIcon>
    );
}

function SunPathIcon() {
    return (
        <SvgIcon viewBox="0 0 64 64">
            <path d="M62 30H47.9a15.9 15.9 0 0 0-3.2-7.8l10-10a2 2 0 0 0-2.8-2.8l-10 10a15.9 15.9 0 0 0-7.9-3.3V2a2 2 0 0 0-4 0v14.2a15.9 15.9 0 0 0-7.8 3.2l-10-10a2 2 0 1 0-2.8 2.8l10 10a15.9 15.9 0 0 0-3.2 7.8H2a2 2 0 1 0 0 4h14.2a15.9 15.9 0 0 0 3.2 7.8l-10 10a2 2 0 1 0 2.8 2.8l10-10a15.9 15.9 0 0 0 7.8 3.3V62a2 2 0 0 0 4 0V47.9a15.9 15.9 0 0 0 7.8-3.2l10 10a2 2 0 1 0 2.8-2.8l-10-10a15.9 15.9 0 0 0 3.3-7.9H62a2 2 0 1 0 0-4z"
            fill="#757575"></path>
        </SvgIcon>
    );
}


class BarraHerramientasMorfologia extends Component {

    constructor(props) {
        super(props);

        var dibujandoStatesButtons = new Array(4).fill(false);

        this.state = {
            spacing: '16',
            casaPredefinida: props.casaPredefinida,
            click2D: props.click2D,
            dibujando: props.dibujando,
            dibujandoStatesButtons: dibujandoStatesButtons,
            borrando: props.borrando,
            seleccionando: props.seleccionando,
            rotando: props.borrando,
            anchorEl: null,
            anchor: null,
        };


        this.handleCasaPredefinida = this.handleCasaPredefinida.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handlePerspective = this.handlePerspective.bind(this);
        this.handleClickCasa = this.handleClickCasa.bind(this);
        this.handleCloseCasa = this.handleCloseCasa.bind(this);
        this.handleClickAddPredefined = this.handleClickAddPredefined.bind(this);
        this.handleBorrando = this.handleBorrando.bind(this);
        this.handleSeleccionando = this.handleSeleccionando.bind(this);
        this.handleDibujo = this.handleDibujo.bind(this);
        this.handleClickSeleccionar = this.handleClickSeleccionar.bind(this);
        this.onActionChanged = this.onActionChanged.bind(this);
        this.handleSunPathClick = this.handleSunPathClick.bind(this);
        this.handleRotation = this.handleRotation.bind(this);

    };

    componentDidUpdate(prevProps){
        if(this.props.seleccionando !== prevProps.seleccionando){
            this.setState({seleccionando: this.props.seleccionando})
        }
    }

    handleClickAgregar(event) {
        this.setState({anchorEl: event.currentTarget});
    };

    handleClickSeleccionar() {
        this.props.onSeleccionar();
    };

    handleClickCasa(event) {
        this.setState({anchor: event.currentTarget});
    };

    handleCloseCasa() {
        this.setState({anchor: null});
    };

    handleClose() {
        this.setState({anchorEl: null});
    };

    handlePerspective() {
        this.setState(prevState => ({
            click2D: !prevState.click2D
        }));
        this.props.onPerspectiveChanged();
    }

    handleCasaPredefinida(event){
        this.handleClose();
        this.handleCloseCasa();
        let casaPredefinida = parseInt(event.currentTarget.value);
        this.setState({
            casaPredefinida: casaPredefinida,
        });
        this.props.onCasaPredefinidaChanged(casaPredefinida);
    }

    handleDibujo(event) {
        this.handleClose();
        this.handleCloseCasa();
        let dibujandoStatesButtons = this.state.dibujandoStatesButtons;
        dibujandoStatesButtons[this.state.dibujando] = false;
        dibujandoStatesButtons[event.currentTarget.value] = true;
        this.setState({
            dibujando: parseInt(event.currentTarget.value),
            borrando: false,
            seleccionando: false,
            dibujandoStatesButtons: dibujandoStatesButtons,
        });
        this.onActionChanged(parseInt(event.currentTarget.value), false, false);
    }


    onActionChanged(dibujando, borrando, seleccionando, rotando = false) {
        this.props.onSeleccionandoMorfChanged(seleccionando);
        this.props.onBorrandoMorfChanged(borrando);
        this.props.onDibujandoMorfChanged(dibujando);
        this.props.onRotationClicked(rotando);
    }

    handleBorrando() {
        let dibujandoStatesButtons = this.state.dibujandoStatesButtons;
        dibujandoStatesButtons[this.state.dibujando] = false;
        this.setState({
            dibujando: -1,
            borrando: true,
            seleccionando: false,
            dibujandoStatesButtons: dibujandoStatesButtons,
        });
        this.onActionChanged(-1, true, false);
    }

    handleSeleccionando() {
        let dibujandoStatesButtons = this.state.dibujandoStatesButtons;
        dibujandoStatesButtons[this.state.dibujando] = false;
        this.setState({
            dibujando: -1,
            borrando: false,
            seleccionando: true,
            dibujandoStatesButtons: dibujandoStatesButtons,
        });
        this.onActionChanged(-1, false, true);
    }

    handleClickAddPredefined(event) {
        this.setState({dibujo: event.target.value});
        this.props.onDrawingChanged(event.target.value);
    }

    handleSunPathClick(){
        this.props.onSunPathClicked();
    }

    handleRotation(){
        let dibujandoStatesButtons = this.state.dibujandoStatesButtons;
        dibujandoStatesButtons[this.state.dibujando] = false;
        this.setState({
            dibujando: -1,
            borrando: false,
            seleccionando: false,
            dibujandoStatesButtons: dibujandoStatesButtons,
            rotando: true,
        });
        this.onActionChanged(-1, false, false, true);
    }


    render() {
        const {classes} = this.props;
        const {dibujandoStatesButtons, borrando, seleccionando, click2D, anchorEl, anchor} = this.state;
        return (
            <div className={classes.root} align="center">

                <Tooltip title="Camara 2D"
                         disableFocusListener={!click2D}
                >
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="2D"
                            disabled={click2D}
                            onClick={this.handlePerspective}>
                            <IconTwoD/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Camara 3D"
                         disableFocusListener={click2D}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="3D"
                            disabled={!click2D}
                            onClick={this.handlePerspective}>
                            <IconThreeD/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Seleccionar"
                         disableFocusListener={!seleccionando}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Seleccionar"
                            disabled={seleccionando}
                            onClick={this.handleSeleccionando}>
                            <CursorIcon/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Eliminar"
                         disableFocusListener={!borrando}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="AgregarPuerta"
                            disabled={borrando}
                            onClick={this.handleBorrando}>
                            <Delete/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Agregar">
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Seleccionar"
                            aria-owns={anchorEl ? 'simple-menu' : null}
                            aria-haspopup="true"
                            onClick={this.handleClickAgregar}
                        >
                            <AddCircle/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    elevation={9}
                >
                    <Tooltip title="Paredes"
                             disableFocusListener={!dibujandoStatesButtons[0]}
                             placement="left">
                        <MenuItem onClick={this.handleClose}
                                  disabled={dibujandoStatesButtons[0]}>
                            <IconButton
                                className={classes.button}
                                aria-label="AgregarPared"
                                value={0}
                                disabled={dibujandoStatesButtons[0]}
                                onClick={this.handleDibujo}>
                                <WallIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Ventana"
                             disableFocusListener={!dibujandoStatesButtons[1]}
                             placement="left">
                        <MenuItem onClick={this.handleClose}
                                  disabled={dibujandoStatesButtons[1]}>
                            <IconButton
                                className={classes.button}
                                aria-label="AgregarVentana"
                                value={1}
                                disabled={dibujandoStatesButtons[1]}
                                onClick={this.handleDibujo}>
                                <WindowIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Puerta"
                             disableFocusListener={!dibujandoStatesButtons[2]}
                             placement="left">
                        <MenuItem onClick={this.handleClose}
                                  disabled={dibujandoStatesButtons[2]}>
                            <IconButton
                                className={classes.button}
                                aria-label="AgregarPuerta"
                                value={2}
                                disabled={dibujandoStatesButtons[2]}
                                onClick={this.handleDibujo}>
                                <DoorIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Techo"
                             disableFocusListener={!dibujandoStatesButtons[3]}
                             placement="left">
                        <MenuItem onClick={this.handleClose}
                                  disabled={dibujandoStatesButtons[3]}>
                            <IconButton
                                className={classes.button}
                                aria-label="AgregarTecho"
                                value={3}
                                disabled={dibujandoStatesButtons[3]}
                                onClick={this.handleDibujo}>
                                <FloorIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                </Menu>

                <Tooltip title="Agregar Casa Predefinida">
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Predefinida"
                            aria-owns={anchor ? 'simple-menu2' : null}
                            aria-haspopup="true"
                            onClick={this.handleClickCasa}>
                            <HomeIcon/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Menu
                    id="simple-menu2"
                    anchorEl={anchor}
                    open={Boolean(anchor)}
                    onClose={this.handleCloseCasa}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    elevation={9}
                >
                    <Tooltip title="Simple"
                             placement="left">
                        <MenuItem onClick={this.handleCloseCasa}>
                            <IconButton
                                className={classes.button}
                                aria-label="Simple"
                                value={0}
                                onClick={this.handleCasaPredefinida}>
                                <SimpleIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Doble"
                             placement="left">
                        <MenuItem onClick={this.handleCloseCasa}>
                            <IconButton
                                className={classes.button}
                                aria-label="Double"
                                value={1}
                                onClick={this.handleCasaPredefinida}>
                                <DoubleIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Simple dos pisos"
                             placement="left">
                        <MenuItem onClick={this.handleCloseCasa}>
                            <IconButton
                                className={classes.button}
                                aria-label="Simple dos pisos"
                                value={2}
                                onClick={this.handleCasaPredefinida}>
                                <SimpleTwoFloorIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Doble dos pisos"
                             placement="left">
                        <MenuItem onClick={this.handleCloseCasa}>
                            <IconButton
                                className={classes.button}
                                aria-label="Simple"
                                value={3}
                                onClick={this.handleCasaPredefinida}>
                                <DoubleTwoFloorIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>
                </Menu>

                <Tooltip title="Ver/Ocultar Sunpath">
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Sunpath"
                            onClick={this.handleSunPathClick}>
                            <SunPathIcon/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Rotar"
                         disableFocusListener={!this.state.rotando}
                >
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Rotar"
                            aria-haspopup="true"
                            onClick={this.handleRotation}>
                            <ThreeDRotation/>
                        </IconButton>
                    </div>
                </Tooltip>

            </div>


        );
    }

}

BarraHerramientasMorfologia.propTypes = {
    classes: PropTypes.object.isRequired,
    onPerspectiveChanged: PropTypes.func,
    onSeleccionandoMorfChanged: PropTypes.func,
    onBorrandoMorfChanged: PropTypes.func,
    onDibujandoMorfChanged: PropTypes.func,
    onCasaPredefinidaChanged: PropTypes.func,
};

export default withStyles(styles)(BarraHerramientasMorfologia);
