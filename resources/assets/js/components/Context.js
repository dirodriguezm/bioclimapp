import React, {Component} from 'react'
import * as THREE from 'three'
import Orbitcontrols from 'orbit-controls-es6';
import {MeshText2D, textAlign} from 'three-text2d';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import InfoObstruccion from './InfoObstruccion';

const styles = theme => ({
    typography: {
        padding: theme.spacing.unit * 2,
    },
});


class Context extends Component {
    constructor(props) {
        super(props);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleRotation = this.handleRotation.bind(this);
        this.handleParamChange = this.handleParamChange.bind(this);
        this.state = {
            height: props.height,
            width: props.width,
            anchorEl: null,
            open: false
        };
        this.dibujando = false;
        this.seleccionando = false;
        this.borrando = false;
        this.modified = false;
        this.ventanas = [
            {
                pos: new THREE.Vector3(0, 0, 0),
                orientacion: new THREE.Vector3(0, 0, -1)
            }
        ];
    }

    componentWillReceiveProps(nextProps) {
        // if (nextProps.ventanas !== this.ventanas) {
        //     this.ventanas = nextProps.ventanas;
        //     this.calcularFAR(nextProps.ventanas);
        // }
        if (nextProps.agregarContexto) {
            this.agregarContexto = true;
            this.seleccionando = false;
            this.borrando = false;
            let geometry = new THREE.BoxBufferGeometry(0.05, 2, 0.05);
            const material = new THREE.MeshBasicMaterial({color: '#433F81', opacity: 0.5, transparent: true});
            let obstruccionFantasma = new THREE.Mesh(geometry, material);
            obstruccionFantasma.visible = false;
            this.escena.add(obstruccionFantasma);
            this.obstruccionFantasma = obstruccionFantasma;
        }
        if (nextProps.seleccionar) {
            this.seleccionando = true;
            this.agregarContexto = false;
            this.borrando = false;
        }
        if (nextProps.borrarContexto) {
            this.seleccionando = true;
            this.agregarContexto = false;
            this.borrando = true;
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        //Si se cerró el popper y se modificó alguna obstrucción entonces se debe volver a calcular el FAR
        if(prevState.open === true && this.state.open === false ){
            console.log("MODIFIED");
            this.calcularFAR(this.ventanas);
        }
        console.log("SI");
    }

    componentDidMount() {
        const width = this.state.width;
        const height = this.state.height;
        this.mouse = new THREE.Vector2();
        //arreglo de objetos de obstruccion
        this.obstrucciones = [];
        //Hay que cargar this.escena, this.camara, y renderer,
        //this.escena
        this.escena = new THREE.Scene();
        this.escena.background = new THREE.Color(0xf0f0f0);

        //Renderer
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.setClearColor('#F0F0F0');
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);


        // // 2D camara
        this.camara = new THREE.OrthographicCamera(width / -20, width / 20, height / 20, height / -20, 1, 2000);
        this.camara.position.set(0, 10, 0);
        this.camara.lookAt(new THREE.Vector3());
        this.camara.zoom = 0.8;
        this.camara.updateProjectionMatrix();
        this.escena.add(this.camara);
        //this.controles de this.camara
        this.control = new Orbitcontrols(this.camara, this.renderer.domElement);
        this.control.maxPolarAngle = 0;
        this.control.maxAzimuthAngle = 0;
        this.control.minAzimuthAngle = 0;
        this.control.enabled = true;
        this.control.enableKeys = true;
        // 3D this.camara
        // this.camara = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
        // this.camara.position.set( 5, 8, 13 );
        // this.camara.lookAt( new THREE.Vector3() );
        // this.control = new Orbitcontrols( this.camara, this.renderer.domElement );
        // this.control.enabled = true;
        // this.control.maxDistance = 500;

        //Plano
        let planoGeometria = new THREE.PlaneBufferGeometry(80, 80);
        planoGeometria.rotateX(-Math.PI / 2);
        this.plano = new THREE.Mesh(planoGeometria, new THREE.MeshBasicMaterial({visible: true}));
        this.escena.add(this.plano);

        //Grid del plano
        let gridHelper = new THREE.GridHelper(80, 80, 0xCCCCCC, 0xCCCCCC);
        this.escena.add(gridHelper);

        //Indicador de puntos cardinales
        let curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            25, 25,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        let points = curve.getPoints(359);
        let circleGeometry = new THREE.BufferGeometry().setFromPoints(points);
        let circleMaterial = new THREE.LineBasicMaterial({color: 0xCCCCCC});
        this.cardinalPointsCircle = new THREE.Line(circleGeometry, circleMaterial);
        //Circulo de puntos cardinales con letras
        this.cardinalPointsCircle.rotateX(-Math.PI / 2);
        this.cardinalPointsCircle.position.set(0, 0.001, 0);
        this.cardinalPointsCircle.name = "cardinalPointsCircle";
        this.circlePoints = points;
        this.escena.add(this.cardinalPointsCircle);
        let sprite = new MeshText2D("S", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, 0.3, 25);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("N", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, 0.3, -25);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("E", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(25, 0.3, 0);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("O", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(-25, 0.3, 0);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        //caja que representa la casa al centro del plano
        let centerBoxGeom = new THREE.BoxBufferGeometry(1, 1, 1);
        let centerBoxMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        let centerBox = new THREE.Mesh(centerBoxGeom, centerBoxMaterial);
        this.escena.add(centerBox);

        const light = new THREE.AmbientLight(0x404040, 100); // soft white light
        this.escena.add(light);

        this.mount.appendChild(this.renderer.domElement);
        let popperDiv = document.createElement('div');
        popperDiv.setAttribute("id", "popperDiv");
        popperDiv.style.position = 'absolute';
        popperDiv.style.top = '200px';
        popperDiv.style.left = '200px';
        document.body.appendChild(popperDiv);
        this.setState({anchorEl: popperDiv});

        this.start();
    }

    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement)
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    animate() {
        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate)
    }

    renderScene() {
        this.renderer.render(this.escena, this.camara)
    }

    onMouseMove(event) {
        event.preventDefault();
        if (document.getElementById("text")) {
            var text = document.getElementById("text");
            text.parentNode.removeChild(text);
        }
        let rect = this.renderer.domElement.getBoundingClientRect();
        let mouse = this.mouse;
        this.raycasterMouse = new THREE.Raycaster();
        mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycasterMouse.setFromCamera(mouse, this.camara);
        let intersections = this.raycasterMouse.intersectObject(this.plano);
        let point = {x: 0, y: 0}
        if (intersections.length > 0) {
            point = {x: intersections[0].point.x, y: -intersections[0].point.z}
        }
        this.mouse = mouse;
        this.mousePoint = point; // Coordenadas del mouse en el world pero 2D x: eje x, y: -eje z
        //elemento HTML que indica las coordenadas en el plano
        let text2 = document.createElement('div');
        text2.setAttribute("id", "text");
        text2.style.position = 'absolute';
        text2.style.width = 100;
        text2.style.height = 100;
        text2.style.backgroundColor = "#f0f0f0";
        text2.innerHTML = Math.round(point.x) + "," + Math.round(point.y);
        text2.style.top = (event.clientY) + 'px';
        text2.style.left = (event.clientX + 20) + 'px';
        document.body.appendChild(text2);

        if (this.dibujando) {
            this.nuevaObstruccion();
        }
        if (this.seleccionando) {
            this.onHoverObstruction();
        }
    }

    onClick(event) {
        if (this.seleccionando) {
            this.onSelectObstruction();
        }
        if (this.borrando) {
            this.onDeleteObstruction();
        }
    }

    onMouseDown(event) {
        if (this.agregarContexto && event.button === 0) {
            this.dibujando = true;
            this.puntoInicial = new THREE.Vector3(Math.round(this.mousePoint.x), 0,
                -Math.round(this.mousePoint.y));
        }
    }

    onMouseUp(event) {
        if (this.dibujando) {
            let material = new THREE.MeshBasicMaterial({color: 0x000000});
            let obstruccion = this.obstruccionFantasma.clone();
            obstruccion.material = material;
            this.obstrucciones.push(obstruccion);
            this.escena.add(obstruccion);
            this.crearDivObstruccion(obstruccion);
            this.obstruccionFantasma.visible = false;
            this.dibujando = false;
            this.calcularFAR(this.ventanas);
        }
    }

    onMouseLeave(event) {
        if (document.getElementById("text")) {
            var text = document.getElementById("text");
            text.parentNode.removeChild(text);
        }
    }

    onHoverObstruction() {
        this.intersections = this.raycasterMouse.intersectObjects(this.obstrucciones);
        if (this.intersections.length > 0) {
            if (this.intersections[0].object !== this.hoveredObstruction) {
                if (this.intersections[0].object.currentHex == null) this.intersections[0].object.currentHex = this.intersections[0].object.material.color.getHex();
                this.hoveredObstruction = this.intersections[0].object;
                this.hoveredObstruction.material = this.obstruccionFantasma.material;
            }
        }
        else {
            if ((this.hoveredObstruction != null && this.selectedObstruction == null) || (this.selectedObstruction !== this.hoveredObstruction)) {
                this.hoveredObstruction.material = new THREE.MeshBasicMaterial({color: this.hoveredObstruction.currentHex});
                this.hoveredObstruction = null;
            }
        }
    }

    onSelectObstruction() {
        if (this.intersections.length > 0) {
            if (this.selectedObstruction !== this.hoveredObstruction && this.selectedObstruction != null) {
                this.selectedObstruction.material = new THREE.MeshBasicMaterial({color: this.selectedObstruction.currentHex});
            }
            this.selectedObstruction = this.hoveredObstruction;
            this.setState({open: true});
        }
        else {
            this.selectedObstruction.material = new THREE.MeshBasicMaterial({color: this.selectedObstruction.currentHex});
            this.selectedObstruction = null;
            this.setState({open: false});
        }
    }

    onDeleteObstruction() {
        this.setState({open:false});
        this.escena.remove(this.selectedObstruction);
        let index = this.obstrucciones.indexOf(this.selectedObstruction);
        this.obstrucciones.splice(index, 1);
        this.selectedObstruction = null;
        this.hoveredObstruction = null;
    }

    onKeyDown(event) {
        console.log(event);
    }



    calcularFAR(ventanas) {
        for (let ventana of ventanas) {
            let axisY = new THREE.Vector3(0, 1, 0);
            let raycasterFAR = new THREE.Raycaster();
            let angleLeft = ventana.orientacion.clone().applyAxisAngle(axisY, Math.PI / 4);
            let angle = angleLeft.clone();
            let obstruccionesVentana = [];
            let current = {startPoint: null, betaAngle: 0, bDistance: 0, aDistance: 0, betaIndex: -1};
            if (ventana.obstrucciones != null) {
                for (let obs of ventana.obstrucciones) {
                    obs.betaIndex = null;
                    obs.betaAngle = null;
                }
            }
            for (let x = 0; x < 90; x++) {
                angle = angle.normalize();
                raycasterFAR.set(ventana.pos, angle);
                let intersections = raycasterFAR.intersectObjects(this.obstrucciones);
                let masAlto = {object: {aDistance: 0}};
                console.log(intersections.length);
                //para cada obstruccion en el angulo actual se obtiene su aDistance y su bDistance, además se almacena el más alto
                for (let i = 0; i < intersections.length; i++) {
                    intersections[i].object.aDistance = intersections[i].object.geometry.parameters.height - ventana.pos.y;
                    let auxPoint = new THREE.Vector3(intersections[i].object.position.x, ventana.pos.y, ventana.pos.z);
                    intersections[i].object.bDistance = auxPoint.distanceTo(intersections[i].object.position);
                    intersections[i].object.far = Math.pow(0.2996,(intersections[i].object.aDistance / intersections[i].object.bDistance));
                    if (intersections[i].object.aDistance > masAlto.object.aDistance) {
                        masAlto = intersections[i];
                    }
                }
                //si no hay obstruccion en el angulo actual entonces pasamos al siguiente
                if (masAlto.point == null) {
                    angle.applyAxisAngle(axisY, -Math.PI / 180);
                    continue;
                }
                //si cambiamos de obstruccion mas alta entonces se reinicia el start point
                if (masAlto.object !== current) {
                    current.startPoint = null;
                    current = masAlto.object;
                    //el beta index indica si hay un nuevo angulo que agregar a la obstruccion
                    let betaIndex = current.betaIndex;
                    if (betaIndex == null) betaIndex = -1;
                    current.betaIndex = betaIndex + 1;
                }
                //cuando se cambia de obstruccion se reinicia el startpoint,
                // entonces si ha sido reiniciado y volvemos a la misma obstruccion lo inicializamos de nuevo
                if (current.startPoint == null) {
                    current.startPoint = masAlto.point;
                }
                //se inicializa el arreglo de angulos beta
                if (current.betaAngle == null) {
                    current.betaAngle = [];
                }
                //el angulo beta se actualiza con cada angulo, se toma el startPoint y se calcula el angulo hasta el angulo actual
                current.betaAngle[current.betaIndex] = current.startPoint.angleTo(masAlto.point) * 180 / Math.PI;
                //se agrega la obstruccion actual a las obstrucciones de la ventana si es que no ha sido agregada antes
                //además las obstrucciones de una ventana se pintan rojas
                if (!obstruccionesVentana.includes(current)) {
                    obstruccionesVentana.push(current);
                    current.material.color.setHex(0xff0000);
                    current.currentHex = 0xff0000;
                }
                // let arrowHelper = new THREE.ArrowHelper(angle, ventana.pos, 10, 0x00ff00);
                // this.escena.add(arrowHelper);
                //pasamos al siguiente angulo
                angle.applyAxisAngle(axisY, -Math.PI / 180);
            }
            //se calcula el far de la ventana en base a la formula
            ventana.obstrucciones = obstruccionesVentana;
            let f1 = 1;
            let f2 = 0;
            for(let obs of ventana.obstrucciones){
                obs.startPoint = null; //reseteamos el punto de inicio de la obstruccion para futuros cálculos
                for(let beta of obs.betaAngle){
                    f1 -= beta / 90;
                    f2 += obs.far * beta/90;
                }
            }
            ventana.far = f1 + f2;
        }
        this.props.onFarChanged(ventanas);
    }


    nuevaObstruccion() {
        let puntoActual = new THREE.Vector3(Math.round(this.mousePoint.x), 0,
            -Math.round(this.mousePoint.y));
        let dir = puntoActual.sub(this.puntoInicial);
        let largo = dir.length();
        this.obstruccionFantasma.geometry = new THREE.BoxBufferGeometry(largo, 1, 0.5);
        dir = dir.normalize().multiplyScalar(largo / 2);
        let pos = this.puntoInicial.clone().add(dir);
        this.obstruccionFantasma.position.set(pos.x, 0, pos.z);
        this.obstruccionFantasma.rotation.y = Math.atan2(-dir.z, dir.x);
        this.obstruccionFantasma.visible = true;
    }

    crearDivObstruccion(obstruccion){
        let sprite = new MeshText2D("alt: " + obstruccion.geometry.parameters.height + "   long: " +  Math.round(obstruccion.geometry.parameters.width), {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(sprite.position.x, sprite.position.y, sprite.position.z +1);
        sprite.rotateX(-Math.PI / 2);
        sprite.name="info";
        obstruccion.add(sprite);
    }


    handleRotation(sentido){
        if(sentido < 0){
            this.selectedObstruction.rotateY(Math.PI / 180);
        }
        else{
            this.selectedObstruction.rotateY(-Math.PI/180);
        }
        this.setState({
            selectedObstruction: this.selectedObstruction
        })
    }



    handleParamChange(name,value){
        if(name === 'altura') {
            this.selectedObstruction.geometry = new THREE.BoxBufferGeometry(this.selectedObstruction.geometry.parameters.width, value, 0.5);
            let sprite = this.selectedObstruction.getObjectByName("info");
            sprite.text = "alt: " + value + "   long: " + Math.round(this.selectedObstruction.geometry.parameters.width);
        }
        if(name === 'longitud') {
            this.selectedObstruction.geometry = new THREE.BoxBufferGeometry(value, this.selectedObstruction.geometry.parameters.height, 0.5);
            let sprite = this.selectedObstruction.getObjectByName("info");
            sprite.text = "alt: " + this.selectedObstruction.geometry.parameters.height + "   long: " + Math.round(value);
        }
        this.setState({
            selectedObstruction: this.selectedObstruction
        })

    }



    render() {
        const anchorEl = this.state.anchorEl;
        const open = this.state.open;
        const id = open ? 'simple-popper' : null;
        return (
            <div>
                <div
                    ref={(mount) => {
                        this.mount = mount
                    }}
                    onMouseMove={this.onMouseMove}
                    onClick={this.onClick}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    onMouseLeave={this.onMouseLeave}
                    onKeyDown={this.onKeyDown}
                />


                <Popper id={id} open={open} anchorEl={anchorEl}>
                    <InfoObstruccion
                        selectedObstruction={this.selectedObstruction}
                        handleRotation={this.handleRotation}
                        handleChange={this.handleParamChange}
                    />
                </Popper>;

            </div>

        )
    }
}

Context.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Context);
