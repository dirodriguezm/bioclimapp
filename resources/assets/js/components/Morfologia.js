import React, {Component} from 'react'
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';
import {MeshText2D, textAlign} from 'three-text2d';
import PropTypes from "prop-types";
import Graph from '../Utils/Graph';

class Morfologia extends Component {
    //Aqui se nomban objetos y se asocian a un metodo
    constructor(props) {
        super(props);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);
        this.agregarPared = this.agregarPared.bind(this);
        this.onChangeCamera = this.onChangeCamera.bind(this);
        this.crearIndicadores = this.crearIndicadores.bind(this);

        this.state = {
            height: props.height,
            width: props.width,
        };

    };

    componentDidUpdate(prevProps) {
        if (this.props.sunPosition !== prevProps.sunPosition) {
            this.onSunpositionChanged();

        }
        if (this.props.click2D !== prevProps.click2D) {
            this.onPerspectiveChanged();
        }
    }

    onSunpositionChanged() {

        var sunDegrees = this.transformGammaToDegree(this.props.sunPosition.azimuth);
        let index = Math.round(sunDegrees);
        let sunPosCircle = this.circlePoints[index];
        index = Math.round(this.props.sunPosition.altitude);
        if (index < 0) {
            index = 360 + index;
        }
        let sunAlt = this.circlePoints[index];

        let sunPos = new THREE.Vector3(sunPosCircle.x, 0, sunPosCircle.y);
        let d = sunPos.distanceTo(new THREE.Vector3(0, 0.001, 0));
        let f = sunAlt.x / d;
        sunPos = sunPos.clone().multiplyScalar(Math.abs(f));

        this.light.position.set(sunPos.x, sunAlt.y - 1, sunPos.z);

        this.sol.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
    }

    onPerspectiveChanged() {
        if (this.props.click2D) {
            this.camara = this.camara2D;
            this.control2D.enabled = true;
            this.control3D.enabled = false;

        } else {
            this.camara = this.camara3D;
            this.control3D.enabled = true;
            this.control2D.enabled = false;
        }
    }

    componentDidMount() {
        //configuracion pantalla

        const width = this.state.width;
        const height = this.state.height;

        //posicion de mouse en la pantalla
        this.mouse = new THREE.Vector2();

        //arreglo de objetos visibles que podrían interactuar
        this.objetos = [];

        this.paredes = [];
        this.ventanas = [];
        this.paredDeVentana = null;
        this.grafoParedes = new Graph(0);
        this.pisos = [];
        this.techos = [];

        this.casas = this.crearCasaVacia();

        var ventanas = [];

        //Hay que cargar escena, camara, y renderer,
        //Escena
        let escena = new THREE.Scene();
        escena.background = new THREE.Color(0xf0f0f0);
        this.escena = escena;

        //Camaras

        //camara 2d
        const val = 2 * 16;
        let camara2D = new THREE.OrthographicCamera(width / -val, width / val, height / val, height / -val, 1, 1000 );
        camara2D.position.set(0,10,0);
        this.camara2D = camara2D;
        //CAMARA 3D
        let camara3D = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camara3D.position.set(5, 8, 13);
        camara3D.lookAt(new THREE.Vector3());
        this.camara3D = camara3D;

        //camara de la escena es 3D al principio
        this.camara = this.camara3D;

        //Renderer
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.setClearColor('#F0F0F0');
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer = renderer;

        this.escena.add(new THREE.AmbientLight(0x666666));
        this.escena.add(this.casas);

        //Luz
        this.light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
        this.light.position.set( 10, 10, 1 ); 			//default; light shining from top
        this.light.castShadow = true;            // default false
        this.escena.add( this.light );

        this.light.shadow.mapSize.width = 512;  // default
        this.light.shadow.mapSize.height = 512; // default
        this.light.shadow.camera.near = 0.5;    // default
        this.light.shadow.camera.far = 500;

        var helper = new THREE.CameraHelper( this.light.shadow.camera);

        this.escena.add( helper );

        //Mesh Sol
        var solGeometry = new THREE.SphereBufferGeometry(0.5, 32, 32);
        var solMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
        this.sol = new THREE.Mesh(solGeometry, solMaterial);
        this.sol.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
        this.escena.add( this.sol );

        //Controles para la camara2D
        const control2D = new OrbitControls(camara2D, renderer.domElement);
        control2D.enabled = false;
        control2D.maxDistance = 10;
        control2D.mouseButtons = {
            PAN: THREE.MOUSE.RIGHT,
            ZOOM: THREE.MOUSE.MIDDLE,
            ORBIT: -1,
        };
        this.control2D = control2D;

        //Controles para la camara3D
        const control3D = new OrbitControls(camara3D, renderer.domElement);
        control3D.enabled = true;
        control3D.maxDistance = 100;
        control3D.mouseButtons = {
            PAN: -1,
            ZOOM: THREE.MOUSE.MIDDLE,
            ORBIT: THREE.MOUSE.RIGHT,
        };
        this.control3D = control3D;


        //Plano se agrega a objetos
        let planoGeometria = new THREE.PlaneBufferGeometry(50, 50);
        planoGeometria.rotateX(-Math.PI / 2);
        let plano = new THREE.Mesh(planoGeometria, new THREE.MeshBasicMaterial({visible: true}));
        plano.receiveShadow = true;
        escena.add(plano);
        this.objetos.push(plano);

        //Grid del plano
        let gridHelper = new THREE.GridHelper(50, 50, 0xCCCCCC, 0xCCCCCC);
        escena.add(gridHelper);

        //Indicador de puntos cardinales
        let curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            20, 20,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        var points = curve.getPoints(359);
        var circleGeometry = new THREE.BufferGeometry().setFromPoints(points);
        var circleMaterial = new THREE.LineBasicMaterial({color: 0xCCCCCC});
        var cardinalPointsCircle = new THREE.Line(circleGeometry, circleMaterial);

        cardinalPointsCircle.rotateX(-Math.PI / 2);
        cardinalPointsCircle.position.set(0, 0.001, 0);
        cardinalPointsCircle.name = "cardinalPointsCircle";
        this.cardinalPointsCircle = cardinalPointsCircle;
        this.circlePoints = points;
        escena.add(cardinalPointsCircle);

        var sprite = new MeshText2D("S", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, 0.3, 20);
        sprite.rotateX(-Math.PI / 2);
        escena.add(sprite);
        sprite = new MeshText2D("N", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, 0.3, -20);
        sprite.rotateX(-Math.PI / 2);
        escena.add(sprite);
        sprite = new MeshText2D("E", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(20, 0.3, 0);
        sprite.rotateX(-Math.PI / 2);
        escena.add(sprite);
        sprite = new MeshText2D("O", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(-20, 0.3, 0);
        sprite.rotateX(-Math.PI / 2);
        escena.add(sprite);


        //Indicador de la pared
        const geomeIndPared = new THREE.CylinderBufferGeometry(0.05, 0.05, 2, 32);
        const materialIndPared = new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.5, transparent: true});
        var indicadorPared = new THREE.Mesh(geomeIndPared, materialIndPared);
        indicadorPared.visible = false;
        escena.add(indicadorPared);
        this.indicadorPared = indicadorPared;

        //Materiales
        this.materialParedConstruccion =  new THREE.MeshBasicMaterial({color: '#433F81', opacity: 0.7, transparent: true});
        this.materialParedConstruccion.side = THREE.DoubleSide;

        this.materialPisoConstruccion = new THREE.MeshBasicMaterial({color: '#392481', opacity: 0.7, transparent: true});
        this.materialPisoConstruccion.side = THREE.DoubleSide;

        this.materialTechoConstruccion = new THREE.MeshBasicMaterial({color: '#3d8179', opacity: 0.7, transparent: true});
        this.materialTechoConstruccion.side = THREE.DoubleSide;

        this.materialVentanaConstruccion = new THREE.MeshBasicMaterial({color: '#f10700', opacity: 0.7, transparent: true});
        this.materialVentanaConstruccion.side = THREE.DoubleSide;

        this.materialParedConstruida = new THREE.MeshLambertMaterial({
            color: '#433F81'
        });
        this.materialParedConstruida.side = THREE.DoubleSide;

        //pared que dibuja nuevas paredes
        this.paredConstruccion = this.crearMeshPared(0,this.heightWall);
        this.paredConstruccion.visible = false;
        escena.add(this.paredConstruccion);

        //raycaster, usado para apuntar objetos
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 3;
        this.raycaster = raycaster;

        this.construyendo = false;
        this.paredNivel = null; //Para saber si se agrega a una pared
        this.construirPared = false;
        this.construirVentana = false;

        this.startNewPared = null;
        this.endNewPared = null;

        this.widthWall = 4;
        this.heightWall = 1;

        this.indicadores = this.crearIndicadores(this.widthWall, this.heightWall);
        for(let indicador of this.indicadores){
            escena.add(indicador);
        }

        this.indicador_dibujado = null;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
    // Determine the intersection point of two line segments
    // Return FALSE if the lines don't intersect
    intersectLines(x1, y1, x2, y2, x3, y3, x4, y4) {

        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false;
        }

        var denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        // Lines are parallel
        if (denominator === 0) {
            return false
        }

        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false
        }

        // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1);
        let y = y1 + ua * (y2 - y1);

        return {x, y}
    }

    crearCasaVacia(){
        var casas = new THREE.Group();
        var casa = new THREE.Group();

        var nivel = new THREE.Group();

        var habitacion = new THREE.Group();

        var paredes = new THREE.Group();
        paredes.name = "Paredes";
        var pisos = new THREE.Group();
        pisos.name = "Pisos";
        var techos = new THREE.Group();
        techos.name = "Techos";

        habitacion.add(paredes);
        habitacion.add(pisos);
        habitacion.add(techos);

        nivel.add(habitacion);

        casa.add(nivel);

        casas.add(casa);

        return casas;

    }

    crearNivel(widthWall, heightWall, valorNivel){
        var nivel = new THREE.Group();
        nivel.position.y = (valorNivel - 1) * heightWall;

        var paredes = new THREE.Group();
        paredes.name = "Paredes";
        var pisos = new THREE.Group();
        pisos.name = "Pisos";
        var techos = new THREE.Group();
        techos.name = "Techos";

        var halfWidth = widthWall / 2;

        var pared1 = this.crearMeshPared(widthWall, heightWall);
        pared1.position.z = pared1.position.z + halfWidth;

        var pared2 = this.crearMeshPared(widthWall, heightWall);
        pared2.rotation.y = Math.PI / 2;
        pared2.position.x = pared2.position.x + halfWidth;

        var pared3 = this.crearMeshPared(widthWall, heightWall);
        pared3.rotation.y = Math.PI;
        pared3.position.z = pared3.position.z - halfWidth;

        var pared4 = this.crearMeshPared(widthWall, heightWall);
        pared4.rotation.y = Math.PI / 2;
        pared4.position.x = pared4.position.x - halfWidth;

        var piso = this.crearMeshPiso(widthWall, widthWall);
        var techo = this.crearMeshTecho(widthWall, widthWall, heightWall);

        paredes.add(pared1);
        paredes.add(pared2);
        paredes.add(pared3);
        paredes.add(pared4);
        pisos.add(piso);
        techos.add(techo);

        nivel.add(paredes);
        nivel.add(pisos);
        nivel.add(techos);

        return nivel;
    }

    //Metodo que crea grupo casa y agrega un nivel con metodo crearNivel.
    crearCasaSimple(widthWall, heightWall){
        var casas = new THREE.Group();

        var casa = new THREE.Group();
        casa.add(this.crearNivel(widthWall, heightWall, 1));

        casas.add(casa);

        casas.visible = false;

        return casas;
    }
    //Metodo que crea grupo de casas, y crea dos grupos de casa, casa una con nivel usando crearNivel.
    crearCasaDoble(widthWall, heightWall){
        var casas = this.crearCasaSimple(widthWall, heightWall);

        var casa = new THREE.Group();
        casa.add(this.crearNivel(widthWall, heightWall, 1));

        casas.add(casa);

        var halfWidth = widthWall / 2;

        casas.children[0].position.x = casas.children[0].position.x  - halfWidth;
        casas.children[1].position.x = casas.children[1].position.x  + halfWidth;

        casas.visible = false;

        return casas;
    }
    //Metodo que extiende la casa de crearCasaSimple con un segundo piso
    crearCasaSimpleDosPisos(widthWall, heightWall){
        var casas = this.crearCasaSimple(widthWall, heightWall);

        casas.children[0].add(this.crearNivel(widthWall, heightWall, 2));

        casas.visible = false;

        return casas;
    }

    crearCasaDobleDosPisos(widthWall, heightWall){
        var casas = this.crearCasaDoble(widthWall, heightWall);

        casas.children[0].add(this.crearNivel(widthWall, heightWall, 2));
        casas.children[1].add(this.crearNivel(widthWall, heightWall, 2));

        casas.visible = false;

        return casas;
    }

    crearIndicadorConstruccionPared(heightWall, radius){
        const geometria = new THREE.CylinderBufferGeometry(radius, radius, heightWall, 32);
        var indicadorPared = new THREE.Mesh(geometria, this.materialParedConstruccion);
        indicadorPared.visible = false;
        return indicadorPared;
    }

    crearIndicadorConstruccionVentana(widthWindow, heightWindow, heightWall){
        const geometria = new THREE.Geometry();

        let x1 = 0, x2 = widthWindow, y1 = heightWall / 4, y2 = heightWall / 4 + heightWindow;
        let z_offset = 0.01;

        geometria.vertices.push(new THREE.Vector3(x1,y1,z_offset));
        geometria.vertices.push(new THREE.Vector3(x1,y2,z_offset));
        geometria.vertices.push(new THREE.Vector3(x2,y1,z_offset));
        geometria.vertices.push(new THREE.Vector3(x2,y2,z_offset));

        geometria.vertices.push(new THREE.Vector3(x1,y1,-z_offset));
        geometria.vertices.push(new THREE.Vector3(x1,y2,-z_offset));
        geometria.vertices.push(new THREE.Vector3(x2,y1,-z_offset));
        geometria.vertices.push(new THREE.Vector3(x2,y2,-z_offset));

        let face = new THREE.Face3(0,2,1);
        let face2 = new THREE.Face3(1,2,3);
        let face3 = new THREE.Face3(4,6,5);
        let face4 = new THREE.Face3(5,6,7);

        geometria.faces.push(face);
        geometria.faces.push(face2);
        geometria.faces.push(face3);
        geometria.faces.push(face4);

        var indicadorVentana = new THREE.Mesh(geometria, this.materialVentanaConstruccion);
        indicadorVentana.visible = false;

        return indicadorVentana;

    }

    crearIndicadores(widthWall, heightWall) {
        //arreglo con todos los indicadores
        var indicadores = [];
        var radius = 0.05;

        indicadores.push(this.crearCasaSimple(widthWall, heightWall));
        indicadores.push(this.crearCasaDoble(widthWall, heightWall));
        indicadores.push(this.crearCasaSimpleDosPisos(widthWall, heightWall));
        indicadores.push(this.crearCasaDobleDosPisos(widthWall, heightWall));
        indicadores.push(this.crearIndicadorConstruccionPared(heightWall, radius));
        indicadores.push(this.crearIndicadorConstruccionVentana(widthWall / 4 , heightWall / 2, heightWall));

        return indicadores;
    }

    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
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

    crearMeshPared(width, height){
        let geometria = this.crearGeometriaPared(width, height);

        return new THREE.Mesh(geometria, this.materialParedConstruccion);
    }

    crearGeometriaPared(width, height){
        let geometria = new THREE.Geometry();

        let x1 = width / -2 , x2 = width / 2, y1 = 0, y2 = height;

        geometria.vertices.push(new THREE.Vector3(x1,y1,0));
        geometria.vertices.push(new THREE.Vector3(x1,y2,0));
        geometria.vertices.push(new THREE.Vector3(x2,y1,0));
        geometria.vertices.push(new THREE.Vector3(x2,y2,0));

        geometria.faces.push(new THREE.Face3(0,2,1));
        geometria.faces.push(new THREE.Face3(1,2,3));

        geometria.computeFaceNormals();
        geometria.computeVertexNormals();

        return geometria;
    }

    crearMeshPiso(width, depth){
        //piso representa el numero de piso donde se encuentra el piso
        let geometria = new THREE.Geometry();
        let offset = 0.01;
        let x1 = width / -2 , x2 = width / 2, y = offset, z1 = depth / -2, z2 = depth / 2;


        geometria.vertices.push(new THREE.Vector3(x1,y,z1));
        geometria.vertices.push(new THREE.Vector3(x1,y,z2));
        geometria.vertices.push(new THREE.Vector3(x2,y,z1));
        geometria.vertices.push(new THREE.Vector3(x2,y,z2));

        geometria.faces.push(new THREE.Face3(0,2,1));
        geometria.faces.push(new THREE.Face3(1,2,3));

        return new THREE.Mesh(geometria, this.materialPisoConstruccion);
    }

    crearMeshTecho(width, depth, heigth){
        let geometria = new THREE.Geometry();

        let x1 = width / -2 , x2 = width / 2, y = heigth , z1 = depth / -2, z2 = depth / 2;

        geometria.vertices.push(new THREE.Vector3(x1,y,z1));
        geometria.vertices.push(new THREE.Vector3(x1,y,z2));
        geometria.vertices.push(new THREE.Vector3(x2,y,z1));
        geometria.vertices.push(new THREE.Vector3(x2,y,z2));

        geometria.faces.push(new THREE.Face3(0,2,1));
        geometria.faces.push(new THREE.Face3(1,2,3));

        return new THREE.Mesh(geometria, this.materialTechoConstruccion);
    }

    agregarCasa() {
        var casas = this.indicador_dibujado.clone();
        for(let i = 0; i < casas.children.length; i++){
            let casa = casas.children[i];

            for(let j = 0; j < casa.children.length ; j++){
                let nivel = casa.children[j];
                let paredes = nivel.getObjectByName("Paredes");
                for(let k = 0; k < paredes.children.length; k++ ){
                    let pared = paredes.children[k];
                    pared.material = this.materialParedConstruida;
                    pared.castShadow = true;
                    pared.receiveShadow = false;
                    pared.piso = j;
                    this.paredes.push(pared);
                }
            }
        }
        this.escena.add(casas);
        /*var i;
        let paredes = casa.getObjectByName("Paredes");
        let pisos = casa.getObjectByName("Pisos");
        let techos = casa.getObjectByName("Techos");
        var pared;
        for(i = 0; i < paredes.children.length; i++){
            pared = paredes.children[i];
            pared.material = material;
            pared.castShadow = true;

            this.paredes.push(pared);
        }
        this.escena.add(casa);*/
    }

    agregarPared() {
        if (this.state.dibujando) {
            var pared = this.paredFantasma.clone();
            pared.material = new THREE.MeshLambertMaterial({color: '#433F81', transparent: false});
            this.paredFantasma.visible = false;
            pared.castShadow = true;
            this.orientacion = this.orientacion.normalize();
            var hex = 0xffff;
            var arrowHelper = new THREE.ArrowHelper(this.orientacion, pared.position, 5, hex);
            this.escena.add(arrowHelper);
            this.orientacion = this.orientacion.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            pared.orientacion = this.orientacion;
            hex = 0xffff00;
            arrowHelper = new THREE.ArrowHelper(this.orientacion, pared.position, 5, hex);
            this.escena.add(arrowHelper);
            pared.name = "pared";
            this.escena.add(pared);
            let paredes = this.state.paredes.slice();
            paredes.push(pared);
            this.calcularGammaParedes(paredes);
            this.props.onParedesChanged(paredes);
            this.setState({
                paredes: paredes,
                dibujando: false,
            });

            /*
            var endPosition = this.indicadorPared.position;
            var widthPared = endPosition.distanceTo( this.paredFantasma.position );
            //this.paredFantasma.width = widthPared;
            this.paredFantasma.scale.x = widthPared;
            //this.paredFantasma.rotateX( - Math.PI / 2 );
            //this.paredFantasma.position.copy(this.indicadorPared.position);*/
        } else {
            this.paredFantasma.geometry = new THREE.BoxBufferGeometry(0.05, 2, 0.05);
            this.paredFantasma.visible = true;
            this.setState({
                dibujando: true,
            });
            var startPosition = this.indicadorPared.position.clone();
            this.startPosition = startPosition;
            this.paredFantasma.position.copy(startPosition);
        }
    }

    onChangeCamera(event) {
        this.setState({camara: event.target.value})
    }

    onMouseDown(event){
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //seleccionado construccion de pared
        if(this.props.dibujando == 4){
            if(event.button === 0){
                this.construyendo = true;
                let intersects = this.raycaster.intersectObjects(this.objetos);
                if (intersects.length > 0){
                    let intersect = intersects[0];
                    this.startNewPared = (intersect.point).add(intersect.face.normal).clone();
                    this.paredConstruccion.geometry = this.crearGeometriaPared(0, this.heightWall);
                    this.startNewPared.round();
                    this.paredConstruccion.visible = true;
                }
            }
        }
    }

    onMouseUp(event){
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //seleccionado construccion de pared
        if(this.props.dibujando == 4){
            //click derecho
            if(event.button === 0){
                this.construyendo = false;
                var pared = this.paredConstruccion.clone();
                this.paredConstruccion.visible = false;
                pared.material = this.materialParedConstruida;
                pared.castShadow = true;
                pared.receiveShadow = false;

                pared.startPoint =  this.startNewPared.clone();
                pared.endPoint = this.indicador_dibujado.position.clone();
                pared.endPoint.y = 1;

                console.log(pared.startPoint);
                console.log(pared.endPoint);

                this.escena.add(pared);
                this.grafoParedes.addVertex(pared);

                //deteccion pared de origen

                var dir = pared.endPoint.clone();
                dir.sub(pared.startPoint).normalize();

                this.raycaster.set(pared.startPoint, dir);

                let intersects = this.raycaster.intersectObjects(this.paredes);

                if (intersects.length > 0){
                    let paredInter = intersects[0].object;
                    console.log(paredInter);
                    if(paredInter.startPoint.equals(pared.endPoint) || paredInter.endPoint.equals(pared.endPoint)){
                        this.grafoParedes.addEdge(pared, paredInter);
                    }
                }

                //deteccion pared de fin

                dir = pared.startPoint.clone();
                dir.sub(pared.endPoint).normalize();

                this.raycaster.set(pared.endPoint, dir);

                intersects = this.raycaster.intersectObjects(this.paredes);

                if (intersects.length > 0){
                    let paredInter = intersects[0].object;
                    if(paredInter.startPoint.equals(pared.startPoint) || paredInter.endPoint.equals(pared.startPoint)){
                        this.grafoParedes.addEdge(pared, paredInter);
                    }
                }
                this.grafoParedes.printGraph();

                if(this.grafoParedes.isCyclic()){
                    console.log("ciclo");
                }else{
                    console.log("no");
                }
                this.paredes.push(pared)

            }
        }
    }

    onMouseMove(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //Si se está dibujando
        if(this.props.dibujando !== -1 && this.props.dibujando < 6){
            //se actualiza el indicador dependiendo que se esté dibujando
            let index = parseInt(this.props.dibujando);
            if (this.indicador_dibujado !== this.indicadores[index]) {
                if (this.indicador_dibujado != null) {
                    this.indicador_dibujado.visible = false;
                }
                this.indicador_dibujado = this.indicadores[index];
                this.indicador_dibujado.visible = true;
            }
            let intersect;
            //si se dibujan casas pre-definidas, se intersecta con el plano.
            if(this.props.dibujando < 5){
                let intersects = this.raycaster.intersectObjects(this.objetos);
                if (intersects.length > 0) {
                    intersect = intersects[0];

                    this.indicador_dibujado.position.copy(intersect.point).add(intersect.face.normal);
                    this.indicador_dibujado.position.round();
                    //si es pared
                    if(this.props.dibujando == 4){
                        this.indicador_dibujado.position.y = this.heightWall / 2;
                        if(this.construyendo){
                            var nextPosition = (intersect.point).add(intersect.face.normal).clone();
                            nextPosition.round();
                            var dir = nextPosition.clone().sub(this.startNewPared);
                            var widthPared = this.startNewPared.distanceTo(nextPosition);
                            this.paredConstruccion.geometry = this.crearGeometriaPared(widthPared, this.heightWall);
                            var len = dir.length();
                            dir = dir.normalize().multiplyScalar(len * 0.5);
                            let pos = this.startNewPared.clone().add(dir);
                            this.paredConstruccion.position.copy(pos);
                            var angleRadians = Math.atan2(nextPosition.z - this.startNewPared.z, nextPosition.x - this.startNewPared.x);
                            this.paredConstruccion.rotation.y = - angleRadians;
                            this.paredConstruccion.position.y = 0;
                        }
                    }else{
                        this.indicador_dibujado.position.y = 0;
                    }

                }
            }
            //si se dibuja una ventana, se intersecta con paredes.
            else if(this.props.dibujando == 5){
                let intersects = this.raycaster.intersectObjects(this.paredes);
                if (intersects.length > 0) {
                    intersect = intersects[0];
                    let pared = intersect.object;
                    let pos = intersect.point.clone();
                    pared.worldToLocal(pos);
                    pos.round();
                    if(pos.x < 2){
                        this.paredDeVentana = pared;
                        this.indicador_dibujado.setRotationFromEuler(pared.rotation);
                        this.indicador_dibujado.position.copy(intersect.point).round();
                        this.indicador_dibujado.position.y = pared.piso * this.heightWall;
                    }

                }
            }

        }

        /*if (this.dibujando != -1 && this.dibujando < 4) {
            var index = parseInt(this.dibujando);
            if (this.indicador_dibujado != this.indicadores[index]) {
                if (this.indicador_dibujado != null) {
                    this.escena.remove(this.indicador_dibujado);
                }
                this.indicador_dibujado = this.indicadores[index];
                this.escena.add(this.indicador_dibujado);
            }
            this.indicador_dibujado.position.copy(intersect.point).add(intersect.face.normal);
            this.indicador_dibujado.position.floor();

            /*
            este codigo se usaba para hacer crecer las paredes
            todo: mover de aca
            var nexPosition = this.indicadorPared.position.clone();
            var dir = nexPosition.clone().sub(this.startPosition);
            this.orientacion = dir.clone();
            var widthPared = this.startPosition.distanceTo(nexPosition);
            var geomeIndPared = new THREE.BoxBufferGeometry(widthPared, 2, 0.05);
            this.paredFantasma.geometry = geomeIndPared
            var len = dir.length();
            dir = dir.normalize().multiplyScalar(len * 0.5);
            var pos = this.startPosition.clone().add(dir);
            this.paredFantasma.position.copy(pos);
            var angleRadians = Math.atan2(nexPosition.z - this.startPosition.z, nexPosition.x - this.startPosition.x);
            this.paredFantasma.rotation.y = -


        }*/
    }

    calcularGammaParedes(paredes) {
        for (let pared of paredes) {
            var orientacionRaycaster = new THREE.Raycaster();
            orientacionRaycaster.set(new THREE.Vector3(), pared.orientacion);
            var inter = orientacionRaycaster.intersectObject(this.cardinalPointsCircle);
            let interPoint = inter[0].point.add(inter[1].point);
            interPoint = interPoint.multiplyScalar(0.5);
            // var hex = 0xffff;
            // var arrowHelper = new THREE.ArrowHelper( inter[11].point, new THREE.Vector3(), 10, hex );
            // this.escena.add(arrowHelper);
            let closestDistance = 99;
            let closestPoint = {};
            let i = 0;
            let index = 0;
            for (let point of this.circlePoints) {
                let circlePoint = new THREE.Vector3(point.x, 0.001, point.y);
                let temp = circlePoint.distanceTo(interPoint);
                if (temp < closestDistance) {
                    closestDistance = temp;
                    closestPoint = circlePoint;
                    index = i;
                }
                i++;
            }
            pared.gamma = this.transformDegreeToGamma(index);
            console.log("gamma", pared.gamma);
            console.log("degree", index);
        }
    }

    transformDegreeToGamma(degree) {
        if (degree > 270 && degree <= 360) degree = 180 - degree;
        else degree -= 90;
        return degree;
    }

    transformGammaToDegree(gamma) {
        if (gamma < -90) gamma += 450;
        else gamma += 90;
        return gamma;
    }

    onClick(event) {
        event.preventDefault();
        if (this.props.dibujando < 4) {
            this.agregarCasa();
        }

        if(this.props.dibujando == 5){
            this.agregarVentana();
        }
    }

    agregarVentana(){
        if(this.paredDeVentana != null){
            var ventana = this.indicador_dibujado.clone();
            ventana.setRotationFromEuler(new THREE.Euler(0,0,0,'XYZ'));
            this.paredDeVentana.add(ventana);
            this.paredDeVentana.worldToLocal(ventana.position);
            this.ventanas.push(ventana);
        }
    }

    // for (let pared of this.paredes){
    //   var orientacionRaycaster = new THREE.Raycaster();
    //   orientacionRaycaster.set(pared.position,pared.orientacion);
    //   var inter = orientacionRaycaster.intersectObjects(this.paredes);
    //   if(inter.length > 0){
    //     pared.orientacion.multiplyScalar(-1);
    //     console.log("nueva orientacion",pared.orientacion);
    //   }
    //   var hex = 0xffff00;
    //   var arrowHelper = new THREE.ArrowHelper( pared.orientacion, pared.position, 5, hex );
    //   this.escena.add( arrowHelper );
    // }

    render() {
        return (
            <div
                tabIndex="0"
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onMouseMove={this.onMouseMove}
                onClick={this.onClick}
                ref={(mount) => {
                    this.mount = mount
                }}
            />
        )
    }
}

Morfologia.propTypes = {
    dibujando: PropTypes.number,
    click2D: PropTypes.bool,
    sunPosition: PropTypes.object,
    borrando: PropTypes.bool,
    seleccionando: PropTypes.bool,

};

export default Morfologia
