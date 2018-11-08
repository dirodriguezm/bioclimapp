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

const image = new Image();
image.src = "data:image/png;base64,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"


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
        this.resetObstrucciones = this.resetObstrucciones.bind(this);
        this.state = {
            height: props.height,
            width: props.width,
            anchorEl: null,
            open: false
        };
        this.dibujando = false;
        this.seleccionando = false;
        this.borrando = false;
        this.ventanas = [];
        let PW_N = new Map(); // p/w orientacion norte para calculo de FAV2
        this.PW_N = PW_N;
        this.dif = 0;
        PW_N.set(0, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        PW_N.set(0.2, [0.89, 0.94, 0.97, 0.99, 0.99, 0.99, 1, 1, 1, 1]);
        PW_N.set(0.4, [0.75, 0.81, 0.89, 0.94, 0.96, 0.98, 0.99, 1, 1, 1]);
        PW_N.set(0.6, [0.64, 0.71, 0.81, 0.87, 0.91, 0.94, 0.99, 0.99, 1, 1]);
        PW_N.set(0.8, [0.57, 0.64, 0.74, 0.81, 0.86, 0.89, 0.96, 0.99, 1, 1]);
        PW_N.set(1, [0.53, 0.59, 0.7, 0.77, 0.82, 0.85, 0.95, 0.99, 1, 1]);
        PW_N.set(1.5, [0.49, 0.55, 0.65, 0.72, 0.78, 0.81, 0.9, 0.98, 0.99, 0.99]);
        PW_N.set(2, [0.44, 0.5, 0.62, 0.7, 0.76, 0.79, 0.92, 0.99, 1, 1]);
        PW_N.set(4, [0.35, 0.41, 0.53, 0.63, 0.7, 0.74, 0.87, 0.99, 1, 1]);
        PW_N.set(6, [0.3, 0.37, 0.49, 0.58, 0.67, 0.71, 0.85, 0.98, 0.99, 1]);
        PW_N.set(10, [0.26, 0.32, 0.44, 0.54, 0.63, 0.68, 0.83, 0.97, 0.99, 1]);
        let SW = [0.1, 0.2, 0.4, 0.6, 0.8, 1, 2, 4, 6, 8]; // s/w para calculo de FAV2
        this.SW = SW;
        let PW_EOS = new Map(); // p/w orientaciones este, oeste y sur para calculo de FAV2
        this.PW_EOS = PW_EOS;
        PW_EOS.set(0, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        PW_EOS.set(0.2, [0.9, 0.94, 0.98, 0.99, 0.99, 1, 1, 1, 1, 1]);
        PW_EOS.set(0.4, [0.77, 0.83, 0.91, 0.95, 0.97, 0.99, 1, 1, 1, 1]);
        PW_EOS.set(0.6, [0.67, 0.74, 0.84, 0.9, 0.94, 0.97, 0.99, 1, 1, 1]);
        PW_EOS.set(0.8, [0.61, 0.68, 0.79, 0.86, 0.91, 0.95, 0.99, 1, 1, 1]);
        PW_EOS.set(1, [0.56, 0.63, 0.74, 0.82, 0.88, 0.92, 0.99, 1, 1, 1]);
        PW_EOS.set(1.5, [0.5, 0.57, 0.68, 0.76, 0.82, 0.86, 0.97, 0.99, 1, 1]);
        PW_EOS.set(2, [0.45, 0.53, 0.64, 0.73, 0.79, 0.84, 0.97, 0.99, 1, 1]);
        PW_EOS.set(4, [0.37, 0.45, 0.57, 0.67, 0.75, 0.8, 0.96, 0.99, 1, 1]);
        PW_EOS.set(6, [0.33, 0.41, 0.53, 0.63, 0.72, 0.77, 0.94, 0.99, 1, 1]);
        PW_EOS.set(10, [0.28, 0.35, 0.48, 0.59, 0.68, 0.73, 0.9, 0.99, 1, 1]);
        let LH_N = new Map(); // l/h orientacion norte para calculo de FAV1
        this.LH_N = LH_N;
        LH_N.set(0.5, [0.79, 0.87, 0.93]);
        LH_N.set(1, [0.57, 0.69, 0.81]);
        LH_N.set(1.5, [0.42, 0.55, 0.69]);
        LH_N.set(2, [0.33, 0.44, 0.59]);
        LH_N.set(3, [0.22, 0.32, 0.44]);
        let LH_EOS = new Map();
        this.LH_EOS = LH_EOS; // l/h orientacion oeste, este y sur para calculo de FAV1
        LH_EOS.set(0.5, [0.88, 0.93, 0.96]);
        LH_EOS.set(1, [0.74, 0.82, 0.89]);
        LH_EOS.set(1.5, [0.63, 0.73, 0.82]);
        LH_EOS.set(2, [0.54, 0.65, 0.76]);
        LH_EOS.set(3, [0.42, 0.52, 0.65]);
        this.DH = [0.2, 0.5, 1]; // d/h para calculo de FAV1
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        //Si se cerró el popper y se modificó alguna obstrucción entonces se debe volver a calcular el FAR
        if (prevState.open === true && this.state.open === false && this.ventanas != null) {
            this.calcularFAR(this.ventanas);
        }
        if (this.props.agregarContexto) {
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
        if (this.props.seleccionar) {
            this.seleccionando = true;
            this.agregarContexto = false;
            this.borrando = false;
        }
        if (this.props.borrarContexto) {
            this.seleccionando = true;
            this.agregarContexto = false;
            this.borrando = true;
        }
        if (this.ventanas !== this.props.ventanas && prevProps.ventanas !== this.props.ventanas) {
            this.ventanas = this.props.ventanas.slice();
            this.calcularFAR(this.ventanas);

        }

        if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
            if (this.props.width < prevProps.width) {
                this.dif = prevProps.width - this.props.width;
            }
            else {
                this.dif = 0;
            }
            this.renderer.setSize(this.props.width, this.props.height);
            this.escena.remove(this.camara);
            this.camara = new THREE.OrthographicCamera(this.props.width / -20, this.props.width / 20, this.props.height / 20, this.props.height / -20, 1, 2000);
            this.camara.position.set(0, 10, 0);
            this.camara.lookAt(new THREE.Vector3());
            this.camara.zoom = 0.8;
            this.camara.updateProjectionMatrix();
            this.escena.add(this.camara);
            this.control = new Orbitcontrols(this.camara, this.renderer.domElement);
            this.control.maxPolarAngle = 0;
            this.control.maxAzimuthAngle = 0;
            this.control.minAzimuthAngle = 0;
            this.control.enabled = true;
            this.control.enableKeys = true;
            this.renderer.render(this.escena, this.camara);
        }
    }

    componentDidMount() {
        this.props.onRef(this);
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
        //controles de camara
        this.control = new Orbitcontrols(this.camara, this.renderer.domElement);
        this.control.maxPolarAngle = 0;
        this.control.maxAzimuthAngle = 0;
        this.control.minAzimuthAngle = 0;
        this.control.enabled = true;
        this.control.enableKeys = true;
        // 3D camara
        // this.camara = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
        // this.camara.position.set( 5, 8, 13 );
        // this.camara.lookAt( new THREE.Vector3() );
        // this.control = new Orbitcontrols( this.camara, this.renderer.domElement );
        // this.control.enabled = true;
        // this.control.maxDistance = 500;

        //Plano
        let planoGeometria = new THREE.PlaneBufferGeometry(150, 150);
        planoGeometria.rotateX(-Math.PI / 2);
        this.plano = new THREE.Mesh(planoGeometria, new THREE.MeshBasicMaterial({visible: true}));
        this.escena.add(this.plano);

        //Grid del plano
        let gridHelper = new THREE.GridHelper(150, 150, 0xCCCCCC, 0xCCCCCC);
        this.escena.add(gridHelper);

        //Indicador de puntos cardinales
        let curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            50, 50,           // xRadius, yRadius
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
        sprite.scale.setX(0.1);
        sprite.scale.setY(0.1);
        sprite.position.set(0, 0.3, 50);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("N", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.1);
        sprite.scale.setY(0.1);
        sprite.position.set(0, 0.3, -50);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("E", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.1);
        sprite.scale.setY(0.1);
        sprite.position.set(50, 0.3, 0);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("O", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.1);
        sprite.scale.setY(0.1);
        sprite.position.set(-50, 0.3, 0);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        //caja que representa la casa al centro del plano

        let vertices = [
            new THREE.Vector2(-1,-0.7),
            new THREE.Vector2(-1.3,-0.7),
            new THREE.Vector2(0,-2),
            new THREE.Vector2(1.3,-0.7),
            new THREE.Vector2(1,-0.7),
            new THREE.Vector2(1,-1),
            new THREE.Vector2(1,1),
            new THREE.Vector2(-1,1),

        ];
        let shape = new THREE.Shape(vertices);
        vertices = [
            new THREE.Vector2(-0.3,-0.2),
            new THREE.Vector2(0.3,-0.2),
            new THREE.Vector2(0.3,1),
            new THREE.Vector2(-0.3,1),
            new THREE.Vector2(-0.3, -0.2)
        ]
        shape.holes = [new THREE.Path(vertices)];
        let geometria = new THREE.ShapeBufferGeometry(shape);
        geometria.rotateX(Math.PI/2);
        var mesh = new THREE.Mesh( geometria, new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide}) );
        mesh.position.set(0,0.1,0);
        this.escena.add(mesh);


        /*let centerBoxGeom = new THREE.BoxBufferGeometry(1, 1, 1);
        let centerBoxMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        let centerBox = new THREE.Mesh(centerBoxGeom, centerBoxMaterial);
        this.escena.add(centerBox);*/

        const light = new THREE.AmbientLight(0x404040, 100); // soft white light
        this.escena.add(light);

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
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
        text2.style.top = (event.clientY - 60 ) + 'px';
        text2.style.left = (event.clientX + 20 + (window.innerWidth - this.dif) - this.dif) + 'px';
        this.mount.parentNode.insertBefore(text2, this.mount);

        if (this.dibujando) {
            this.nuevaObstruccion();
        }
        if (this.seleccionando) {
            this.onHoverObstruction();
        }
    }

    onClick(event) {
        if (this.seleccionando) {
            this.onSelectObstruction(event.clientX, event.clientY);
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
            obstruccion.ventanas = [];
            obstruccion.userData.altura = obstruccion.geometry.parameters.height;
            this.obstrucciones.push(obstruccion);
            this.escena.add(obstruccion);
            this.crearTextoObstruccion(obstruccion);
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

    onSelectObstruction(x, y) {
        if (this.intersections.length > 0) {
            if (this.selectedObstruction !== this.hoveredObstruction && this.selectedObstruction != null) {
                this.selectedObstruction.material = new THREE.MeshBasicMaterial({color: this.selectedObstruction.currentHex});
            }
            this.selectedObstruction = this.hoveredObstruction;
            this.setState({open: true, popperCoords: {x: x, y: y}});
        }
        else {
            this.selectedObstruction.material = new THREE.MeshBasicMaterial({color: this.selectedObstruction.currentHex});
            this.selectedObstruction = null;
            this.setState({open: false});
        }
    }

    onDeleteObstruction() {
        this.setState({open: false});
        this.escena.remove(this.selectedObstruction);
        let index = this.obstrucciones.indexOf(this.selectedObstruction);
        this.obstrucciones.splice(index, 1);
        this.selectedObstruction = null;
        this.hoveredObstruction = null;
        this.calcularFAR(this.ventanas);
    }

    onKeyDown(event) {

    }

    compareVectors(v1, v2) {
        if (v1 == null || v2 == null) return false;
        return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;

    }

    resetObstrucciones() {
        for (let obs of this.obstrucciones) {
            obs.ventanas = [];
        }
    }


    calcularFAR(ventanas) {
        for (let obs of this.obstrucciones) {
            for (let vent of obs.ventanas) {
                vent.betaIndex = null;
                vent.betaAngle = null;
            }
        }
        for (let ventana of ventanas) {
            let axisY = new THREE.Vector3(0, 1, 0);
            let raycasterFAR = new THREE.Raycaster();
            let angleLeft = ventana.userData.orientacion.clone().applyAxisAngle(axisY, Math.PI / 4);
            let angle = angleLeft.clone();
            let obstruccionesVentana = [];
            let current = {};
            let pos = new THREE.Vector3();
            ventana.getWorldPosition(pos);
            for (let x = 0; x < 90; x++) {
                angle = angle.normalize();
                raycasterFAR.set(new THREE.Vector3(0,pos.y,0), angle);
                let intersections = raycasterFAR.intersectObjects(this.obstrucciones);
                let masAlto = {aDistance: 0};
                //para cada obstruccion en el angulo actual se obtiene su aDistance y su bDistance, además se almacena el más alto
                for (let i = 0; i < intersections.length; i++) {
                    if (intersections[i].distance > 50) {
                        intersections[i].object.fuera = true
                    }
                    let aDistance = intersections[i].object.userData.altura - pos.y;
                    let bDistance = ventana.userData.orientacion.clone().dot(intersections[i].object.position);
                    let far = Math.pow(0.2996, (aDistance / bDistance));
                    let ventanaObstruida = {
                        id: ventana.uuid,
                        orientacion: ventana.userData.orientacion,
                        aDistance: aDistance,
                        bDistance: bDistance,
                        far: far,
                    };
                    intersections[i].aDistance = aDistance;
                    let ventanaAgregada = intersections[i].object.ventanas.find(element => element.id === ventanaObstruida.id);
                    if (!ventanaAgregada) intersections[i].object.ventanas.push(ventanaObstruida);
                    else {
                        intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].aDistance = aDistance;
                        intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].bDistance = bDistance;
                        intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].far = far;
                    }
                    if (aDistance > masAlto.aDistance) {
                        masAlto = intersections[i];
                    }
                }
                //si no hay obstruccion en el angulo actual entonces pasamos al siguiente
                if (masAlto.point == null) {
                    angle.applyAxisAngle(axisY, -Math.PI / 180); //angulo + 1
                    continue;
                }
                //si cambiamos de obstruccion mas alta entonces se reinicia el start point
                if (masAlto.object !== current) {
                    current.startPoint = null;
                    current = masAlto.object;
                    //el beta index indica si hay un nuevo angulo que agregar a la obstruccion
                    let betaIndex = current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex;
                    if (betaIndex == null) betaIndex = -1;
                    betaIndex += 1
                    current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex = betaIndex;
                }
                //cuando se cambia de obstruccion se reinicia el startpoint,
                // entonces si ha sido reiniciado y volvemos a la misma obstruccion lo inicializamos de nuevo
                if (current.startPoint == null) {
                    current.startPoint = masAlto.point;
                }
                //se inicializa el arreglo de angulos beta
                let betaAngle = current.ventanas.find(ele => ele.id === ventana.uuid).betaAngle;
                let betaIndex = current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex;
                if (betaAngle == null) betaAngle = [];
                betaAngle[betaIndex] = current.startPoint.angleTo(masAlto.point) * 180 / Math.PI;
                current.ventanas.find(ele => ele.id === ventana.uuid).betaAngle = betaAngle;
                //se agrega la obstruccion actual a las obstrucciones de la ventana si es que no ha sido agregada antes
                //además las obstrucciones de una ventana se pintan rojas
                if (!obstruccionesVentana.includes(current)) {
                    obstruccionesVentana.push(current);
                }

                //pasamos al siguiente angulo
                angle.applyAxisAngle(axisY, -Math.PI / 180);
            }
            //se calcula el far de la ventana en base a la formula
            ventana.userData.obstrucciones = obstruccionesVentana;
            let f1 = 1;
            let f2 = 0;
            for (let obs of ventana.userData.obstrucciones) {
                // Si la obstrucción está fuera del rango y tiene FAR > 0.95 no se considera
                if (obs.ventanas.find(element => element.id === ventana.uuid).far > 0.95 && obs.fuera) {
                    ventana.userData.obstrucciones.splice(ventana.userData.obstrucciones.indexOf(obs), 1);
                    obs.startPoint = null;
                    continue;
                }
                obs.startPoint = null; //reseteamos el punto de inicio de la obstruccion para futuros cálculos
                obs.material.color.setHex(0xff0000);
                obs.currentHex = 0xff0000;
                // if(ventana.userData.obstrucciones.length === 1 && obs.betaAngle.length > 1){
                //     console.log("beta angle", obs.betaAngle);
                //     obs.betaAngle = [obs.betaAngle[0]];
                // }
                for (let beta of obs.ventanas.find(element => element.id === ventana.uuid).betaAngle) {
                    f1 -= beta / 90;
                    f2 += obs.ventanas.find(element => element.id === ventana.uuid).far * beta / 90;
                }
            }
            ventana.userData.far = f1 + f2;
        }
        this.props.onFarChanged(ventanas);
    }


    nuevaObstruccion() {
        let puntoActual = new THREE.Vector3(Math.round(this.mousePoint.x), 0,
            -Math.round(this.mousePoint.y));
        let dir = puntoActual.sub(this.puntoInicial);
        let largo = dir.length();
        this.obstruccionFantasma.geometry = new THREE.BoxBufferGeometry(largo, 3, 0.5);
        dir = dir.normalize().multiplyScalar(largo / 2);
        let pos = this.puntoInicial.clone().add(dir);
        this.obstruccionFantasma.position.set(pos.x, 0, pos.z);
        this.obstruccionFantasma.rotation.y = Math.atan2(-dir.z, dir.x);
        this.obstruccionFantasma.visible = true;
    }

    crearTextoObstruccion(obstruccion) {
        let sprite = new MeshText2D("alt: " + obstruccion.geometry.parameters.height + "   long: " + Math.round(obstruccion.geometry.parameters.width), {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(sprite.position.x, sprite.position.y, sprite.position.z + 1);
        sprite.rotateX(-Math.PI / 2);
        sprite.name = "info";
        obstruccion.add(sprite);
    }


    handleRotation(sentido) {
        if (sentido < 0) {
            this.selectedObstruction.rotateY(Math.PI / 180);
        }
        else {
            this.selectedObstruction.rotateY(-Math.PI / 180);
        }
        this.setState({
            selectedObstruction: this.selectedObstruction
        })
    }


    handleParamChange(name, value) {
        if (name === 'altura') {
            this.selectedObstruction.userData.altura = value;
            let sprite = this.selectedObstruction.getObjectByName("info");
            sprite.text = "alt: " + value + "   long: " + Math.round(this.selectedObstruction.geometry.parameters.width);
        }
        if (name === 'longitud') {
            this.selectedObstruction.geometry = new THREE.BoxBufferGeometry(value, this.selectedObstruction.geometry.parameters.height, 0.5);
            let sprite = this.selectedObstruction.getObjectByName("info");
            sprite.text = "alt: " + this.selectedObstruction.geometry.parameters.height + "   long: " + Math.round(value);
        }
        this.setState({
            selectedObstruction: this.selectedObstruction
        })

    }

    getFAV2(pw, sw, orientacion) {
        let pw_values = [0, 0.2, 0.4, 0.6, 0.8, 1, 1.5, 2, 4, 6, 10];
        let closest = pw_values.reduce(function (prev, curr) {
            return (Math.abs(curr - pw) < Math.abs(prev - pw) ? curr : prev);
        });
        if (orientacion.z > 0) { //orientacion norte
            return this.PW_N.get(closest)[this.SW.indexOf(sw)];
        }
        else {
            return this.PW_EOS.get(closest)[this.SW.indexOf(sw)];
        }
    }

    getFAV1(lh, dh, orientacion) {
        let lh_values = [0.5, 1, 1.5, 2, 3];
        let closest = lh_values.reduce(function (prev, curr) {
            return (Math.abs(curr - lh) < Math.abs(prev - lh) ? curr : prev);
        });
        if (orientacion.z > 0) { //orientacion norte
            return this.LH_N.get(closest)[this.DH.indexOf(sw)];
        }
        else {
            return this.LH_EOS.get(closest)[this.DH.indexOf(sw)];
        }
    }


    render() {
        const open = this.state.open;
        const id = open ? 'simple-popper' : null;
        let divStyle = {
            position: 'absolute',
            left: this.state.popperCoords != null ? (this.state.popperCoords.x + (window.innerWidth - this.dif) - this.dif) + 'px' : 0,
            top: this.state.popperCoords != null ? this.state.popperCoords.y + 'px' : 0,
            zIndex: 1
        };
        return (
            <div style={{height: this.props.height}}>
                <div
                    ref={(popper) => {
                        this.popper = popper
                    }}
                    style={divStyle}
                />

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
                <Popper id={id} open={open} anchorEl={this.popper} style={{zIndex: 1}}>
                    <InfoObstruccion
                        selectedObstruction={this.selectedObstruction}
                        handleRotation={this.handleRotation}
                        handleChange={this.handleParamChange}
                    />
                </Popper>
            </div>


        )
    }
}

Context.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Context);
