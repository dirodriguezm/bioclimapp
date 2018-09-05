import React, {Component} from 'react'
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';
import {MeshText2D, textAlign} from 'three-text2d';
import PropTypes from "prop-types";
import Graph from '../Utils/Graph';
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';
import axios from "axios";
import ManagerCasas from "../Utils/ManagerCasas";

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

        this.temperaturasMes = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.temperaturaConfort = 19;

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

        if(this.props.comuna !== prevProps.comuna){
            this.onComunaChanged();
        }
    }

    onComunaChanged() {
        console.log(this.props.comuna.id);
        axios.get("http://127.0.0.1:8000/api/temperaturas/"+this.props.comuna.id)
            .then(response => this.getJson(response));

    }

    getJson(response) {
        let data = response.data.slice();
        for (let i = 0; i < data.length; i++) {
            this.temperaturasMes[i] = data[i].valor;
        }
        let gradoDias = BalanceEnergetico.gradosDias(this.temperaturasMes, this.temperaturaConfort);
        this.managerCasas.setGradosDias(gradoDias);
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

        this.allObjects = [];

        this.paredes = [];
        this.ventanas = [];
        this.objetoSeleccionado = null;
        this.objetoClick = null;
        this.paredDeVentana = null;
        this.grafoParedes = new Graph(0);
        this.pisos = [];
        this.techos = [];

        this.casas = new THREE.Group();

        var ventanas = [];

        //Hay que cargar escena, camara, y renderer,
        //Escena
        let escena = new THREE.Scene();
        escena.background = new THREE.Color(0xf0f0f0);
        this.escena = escena;

        this.ocupantes = 4;
        this.horasIluminacion = 5;
        this.aireRenovado = 5;

        this.managerCasas = new ManagerCasas(escena, this.paredes, this.allObjects, this.ocupantes, this.horasIluminacion, this.aireRenovado);

        //Camaras

        //camara 2d
        const val = 2 * 16;
        let camara2D = new THREE.OrthographicCamera(width / -val, width / val, height / val, height / -val, 1, 1000);
        camara2D.position.set(0, 10, 0);
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
        this.light = new THREE.DirectionalLight(0xffffff, 1, 100);
        this.light.position.set(10, 10, 1); 			//default; light shining from top
        this.light.castShadow = true;            // default false
        this.escena.add(this.light);

        this.light.shadow.mapSize.width = 512;  // default
        this.light.shadow.mapSize.height = 512; // default
        this.light.shadow.camera.near = 0.5;    // default
        this.light.shadow.camera.far = 500;

        var helper = new THREE.CameraHelper(this.light.shadow.camera);

        this.escena.add(helper);

        //Mesh Sol
        var solGeometry = new THREE.SphereBufferGeometry(0.5, 32, 32);
        var solMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
        this.sol = new THREE.Mesh(solGeometry, solMaterial);
        this.sol.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
        this.escena.add(this.sol);

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

        planoGeometria.computeFaceNormals();
        planoGeometria.computeVertexNormals();

        this.positionParedes = [];
        for (let i = 0; i < 50; i++) {
            this.positionParedes[i] = [];
            for (let j = 0; j < 50; j++) {
                this.positionParedes[i][j] = [];
            }
        }


        let plano = new THREE.Mesh(planoGeometria, new THREE.MeshBasicMaterial({visible: true}));
        plano.receiveShadow = true;
        plano.castShadow = false;
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
        this.materialParedConstruccion = new THREE.MeshBasicMaterial({
            color: '#433F81',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });

        this.materialPisoConstruccion = new THREE.MeshBasicMaterial({
            color: '#392481',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });

        this.materialTechoConstruccion = new THREE.MeshBasicMaterial({
            color: '#3d8179',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });

        this.materialVentanaConstruccion = new THREE.MeshBasicMaterial({
            color: '#00ff00',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });

        this.materialParedConstruida = new THREE.MeshLambertMaterial({
            color: '#433F81',
            side : THREE.DoubleSide,

        });

        this.materialVentanaConstruida = new THREE.MeshLambertMaterial({
            color: '#00ff00',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });


        this.materialSeleccionado = new THREE.MeshLambertMaterial({
            color: '#FF0000',
            side : THREE.DoubleSide,

        });

        //pared que dibuja nuevas paredes
        this.paredConstruccion = this.crearMeshPared(0, this.heightWall);
        this.paredConstruccion.visible = false;
        escena.add(this.paredConstruccion);

        var light = new THREE.AmbientLight(0x404040); // soft white light
        escena.add(light);

        //raycaster, usado para apuntar objetos
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 1;
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
        for (let indicador of this.indicadores) {
            escena.add(indicador);
        }

        this.indicador_dibujado = null;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    crearCasaVacia() {
        var casa = new THREE.Group();

        var nivel = new THREE.Group();

        var paredes = new THREE.Group();
        paredes.name = "Paredes";
        var pisos = new THREE.Group();
        pisos.name = "Pisos";
        var techos = new THREE.Group();
        techos.name = "Techos";

        nivel.add(paredes);
        nivel.add(pisos);
        nivel.add(techos);

        casa.add(nivel);

        return casa;

    }

    crearCasaParedes(paredesCiclo) {
        var casa = this.crearCasaVacia();

        var nivel = casa.children[0];
        var paredes = nivel.getObjectByName("Paredes");

        var vertices = [];

        var paredesId = paredes.id;
        for (let pared of paredesCiclo) {
            if(pared.type =="Group"){
                this.grafoParedes.removeVertex(pared.id);
                let verticesPared = pared.vertices;
                for(let vertice of verticesPared){
                    this.positionParedes[vertice.x][vertice.z] = this.positionParedes[vertice.x][vertice.z].filter(id => id !== pared.id);
                    this.positionParedes[vertice.x][vertice.z].push(paredesId);
                    vertices.push(vertice);
                }

                for(let paredReal of pared.children){
                    paredReal.parent = paredes;
                }

            }else{
                let xStart = pared.startPoint.x + 25, zStart = pared.startPoint.z + 25;
                let xEnd = pared.endPoint.x + 25, zEnd = pared.endPoint.z + 25;

                this.grafoParedes.removeVertex(pared.id);

                var posStart = this.positionParedes[xStart][zStart].indexOf(paredesId);
                var posEnd = this.positionParedes[xEnd][zEnd].indexOf(paredesId);

                this.positionParedes[xStart][zStart] = this.positionParedes[xStart][zStart].filter(id => id !== pared.id);
                this.positionParedes[xEnd][zEnd] = this.positionParedes[xEnd][zEnd].filter(id => id !== pared.id);

                if(posStart == -1){
                    this.positionParedes[xStart][zStart].push(paredesId);
                    let point = {
                        x : xStart,
                        z : zStart,
                    };
                    vertices.push(point);
                }

                if(posEnd == -1){
                    this.positionParedes[xEnd][zEnd].push(paredesId);
                    let point = {
                        x : xEnd,
                        z : zEnd,
                    };
                    vertices.push(point);
                }
                paredes.add(pared);
                pared.tipo = Morfologia.tipos.PARED;
                this.paredes.push(pared);
                this.allObjects.push(pared);
            }

        }

        var puntos = [];

        for(let vertice of vertices){
            puntos.push(new THREE.Vector2(vertice.x - 25, 25 -vertice.z ));
        }

        var loader = new THREE.TextureLoader();
        var texture = loader.load( "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/UV_Grid_Sm.jpg" );
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set( 0.008, 0.008 );


        var planoParedes = new THREE.Shape(puntos);
        var geometry = new THREE.ShapeBufferGeometry( planoParedes );
        geometry.rotateX(-Math.PI / 2);
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, map: texture } ) );
        mesh.castShadow = true;
        mesh.receiveShadow = false;

        mesh.position.y = this.heightWall;
        mesh.visible = true;

        nivel.add(mesh);

        paredes.vertices = vertices;

        this.grafoParedes.addVertex(paredesId);

        this.casas.add(casa);



    }

    crearPlano(vertices){

    }

    crearNivel(widthWall, heightWall, valorNivel) {
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
        pared1.userData.orientacion = new THREE.Vector3(0,0,1);

        var pared2 = this.crearMeshPared(widthWall, heightWall);
        pared2.rotation.y = Math.PI / 2;
        pared2.position.x = pared2.position.x + halfWidth;
        pared2.userData.orientacion = new THREE.Vector3(1,0,0);

        var pared3 = this.crearMeshPared(widthWall, heightWall);
        pared3.rotation.y = Math.PI;
        pared3.position.z = pared3.position.z - halfWidth;
        pared3.userData.orientacion = new THREE.Vector3(0,0,-1);

        var pared4 = this.crearMeshPared(widthWall, heightWall);
        pared4.rotation.y = -Math.PI / 2;
        pared4.position.x = pared4.position.x - halfWidth;
        pared4.userData.orientacion = new THREE.Vector3(-1,0,0);

        var piso = this.crearMeshPiso(widthWall, widthWall);

        var techo = this.crearMeshTecho(widthWall, widthWall, heightWall);
        paredes.add(pared1);
        paredes.add(pared2);
        paredes.add(pared3);
        paredes.add(pared4);
        pisos.add(piso);
        piso.userData.superficie = widthWall * widthWall;
        techos.add(techo);

        nivel.add(paredes);
        nivel.add(pisos);
        nivel.add(techos);

        nivel.userData.volumen = widthWall * widthWall * heightWall;

        return nivel;
    }

    //Metodo que crea grupo casa y agrega un nivel con metodo crearNivel.
    crearCasaSimple(widthWall, heightWall) {

        var casa = new THREE.Group();
        casa.add(this.crearNivel(widthWall, heightWall, 1));

        casa.visible = false;

        return casa;
    }

    //Metodo que crea grupo de casas, y crea dos grupos de casa, casa una con nivel usando crearNivel.
    crearCasaDoble(widthWall, heightWall) {
        var casas = new THREE.Group();

        var casa = this.crearCasaSimple(widthWall, heightWall);
        casa.visible = true;
        casas.add(casa);

        casa = this.crearCasaSimple(widthWall, heightWall);
        casa.visible = true;
        casas.add(casa);

        var halfWidth = widthWall / 2;

        casas.children[0].position.x = casas.children[0].position.x - halfWidth;
        casas.children[1].position.x = casas.children[1].position.x + halfWidth;

        casas.visible = false;

        return casas;
    }

    //Metodo que extiende la casa de crearCasaSimple con un segundo piso
    crearCasaSimpleDosPisos(widthWall, heightWall) {
        var casa = this.crearCasaSimple(widthWall, heightWall);

        casa.add(this.crearNivel(widthWall, heightWall, 2));

        casa.visible = false;

        return casa;
    }

    crearCasaDobleDosPisos(widthWall, heightWall) {
        var casas = this.crearCasaDoble(widthWall, heightWall);

        casas.children[0].add(this.crearNivel(widthWall, heightWall, 2));
        casas.children[1].add(this.crearNivel(widthWall, heightWall, 2));

        casas.visible = false;

        return casas;
    }

    crearIndicadorConstruccionPared(heightWall, radius) {
        const geometria = new THREE.CylinderBufferGeometry(radius, radius, heightWall, 32);
        var indicadorPared = new THREE.Mesh(geometria, this.materialParedConstruccion.clone());
        indicadorPared.visible = false;
        return indicadorPared;
    }

    crearIndicadorConstruccionVentana(widthWindow, heightWindow, heightWall) {
        const geometria = new THREE.Geometry();

        let x1 = 0, x2 = widthWindow, y1 = heightWall / 4, y2 = heightWall / 4 + heightWindow;
        let z_offset = 0.01;

        geometria.vertices.push(new THREE.Vector3(x1, y1, z_offset));
        geometria.vertices.push(new THREE.Vector3(x1, y2, z_offset));
        geometria.vertices.push(new THREE.Vector3(x2, y1, z_offset));
        geometria.vertices.push(new THREE.Vector3(x2, y2, z_offset));

        geometria.vertices.push(new THREE.Vector3(x1, y1, -z_offset));
        geometria.vertices.push(new THREE.Vector3(x1, y2, -z_offset));
        geometria.vertices.push(new THREE.Vector3(x2, y1, -z_offset));
        geometria.vertices.push(new THREE.Vector3(x2, y2, -z_offset));

        let face = new THREE.Face3(0, 2, 1);
        let face2 = new THREE.Face3(1, 2, 3);
        let face3 = new THREE.Face3(4, 6, 5);
        let face4 = new THREE.Face3(5, 6, 7);

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
        indicadores.push(this.crearIndicadorConstruccionVentana(widthWall / 4, heightWall / 2, heightWall));

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

    crearMeshPared(width, height) {
        let geometria = new THREE.Geometry();

        let x1 = width / -2, x2 = width / 2, y1 = 0, y2 = height;

        geometria.vertices.push(new THREE.Vector3(x1, y1, 0));
        geometria.vertices.push(new THREE.Vector3(x1, y2, 0));
        geometria.vertices.push(new THREE.Vector3(x2, y1, 0));
        geometria.vertices.push(new THREE.Vector3(x2, y2, 0));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        geometria.computeFaceNormals();
        geometria.computeVertexNormals();

        return new THREE.Mesh(geometria, this.materialParedConstruccion.clone());
    }

    crearGeometriaPared(width, height) {
        let geometria = new THREE.Geometry();

        let x1 = width / -2, x2 = width / 2, y1 = 0, y2 = height;

        geometria.vertices.push(new THREE.Vector3(x1, y1, 0));
        geometria.vertices.push(new THREE.Vector3(x1, y2, 0));
        geometria.vertices.push(new THREE.Vector3(x2, y1, 0));
        geometria.vertices.push(new THREE.Vector3(x2, y2, 0));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        geometria.computeFaceNormals();
        geometria.computeVertexNormals();

        return geometria;
    }

    crearMeshPiso(width, depth) {
        //piso representa el numero de piso donde se encuentra el piso
        let geometria = new THREE.Geometry();
        let offset = 0.01;
        let x1 = width / -2, x2 = width / 2, y = offset, z1 = depth / -2, z2 = depth / 2;


        geometria.vertices.push(new THREE.Vector3(x1, y, z1));
        geometria.vertices.push(new THREE.Vector3(x1, y, z2));
        geometria.vertices.push(new THREE.Vector3(x2, y, z1));
        geometria.vertices.push(new THREE.Vector3(x2, y, z2));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        return new THREE.Mesh(geometria, this.materialPisoConstruccion);
    }

    crearMeshTecho(width, depth, heigth) {
        let geometria = new THREE.Geometry();

        let x1 = width / -2, x2 = width / 2, y = heigth, z1 = depth / -2, z2 = depth / 2;

        geometria.vertices.push(new THREE.Vector3(x1, y, z1));
        geometria.vertices.push(new THREE.Vector3(x1, y, z2));
        geometria.vertices.push(new THREE.Vector3(x2, y, z1));
        geometria.vertices.push(new THREE.Vector3(x2, y, z2));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        return new THREE.Mesh(geometria, this.materialTechoConstruccion);
    }

    agregarCasa() {
        if (this.props.dibujando == 1 || this.props.dibujando == 3) {
            var casas = this.indicador_dibujado.clone();
            for (let i = 0; i < casas.children.length; i++) {
                let casa = casas.children[i];

                let aporteInterno = 0;
                let ocupantes = 4, horasIluminacion = 5, aireRenovado = 3;
                let perdidaPorVentilacion = 0;

                for (let j = 0; j < casa.children.length; j++) {
                    let nivel = casa.children[j];
                    let paredes = nivel.getObjectByName("Paredes");
                    for (let k = 0; k < paredes.children.length; k++) {
                        let pared = paredes.children[k];
                        pared.material = this.materialParedConstruida.clone();
                        pared.castShadow = true;
                        pared.receiveShadow = false;
                        pared.piso = j;
                        pared.tipo =  Morfologia.tipos.PARED;
                        this.paredes.push(pared);
                        this.allObjects.push(pared);
                    }
                    let pisos = nivel.getObjectByName("Pisos");
                    for (let k = 0; k < pisos.children.length; k++) {
                        let piso = pisos.children[k];
                        aporteInterno += BalanceEnergetico.aporteInterno(ocupantes, piso.userData.superficie, horasIluminacion);
                    }
                    perdidaPorVentilacion += BalanceEnergetico.perdidasVentilacion(nivel.userData.volumen, aireRenovado, this.gradoDias);
                }
                casa.userData.aporteInterno = aporteInterno;
                casa.userData.perdidaPorVentilacion = perdidaPorVentilacion;
                console.log(casa);
            }
            this.escena.add(casas);

        } else {
            var casa = this.indicador_dibujado.clone();
            let aporteInterno = 0;
            let ocupantes = 4, horasIluminacion = 5, aireRenovado = 3;
            let perdidaPorVentilacion = 0;
            for (let j = 0; j < casa.children.length; j++) {
                let nivel = casa.children[j];
                let paredes = nivel.getObjectByName("Paredes");
                for (let k = 0; k < paredes.children.length; k++) {
                    let pared = paredes.children[k];
                    pared.material = this.materialParedConstruida.clone();
                    pared.castShadow = true;
                    pared.receiveShadow = false;
                    pared.piso = j;
                    pared.tipo =  Morfologia.tipos.PARED;
                    this.paredes.push(pared);
                    this.allObjects.push(pared);
                }
                let pisos = nivel.getObjectByName("Pisos");
                for (let k = 0; k < pisos.children.length; k++) {
                    let piso = pisos.children[k];
                    aporteInterno += BalanceEnergetico.aporteInterno(ocupantes, piso.userData.superficie, horasIluminacion);
                }
                perdidaPorVentilacion += BalanceEnergetico.perdidasVentilacion(nivel.userData.volumen, aireRenovado, this.gradoDias);
            }
            casa.userData.aporteInterno = aporteInterno;
            casa.userData.perdidaPorVentilacion = perdidaPorVentilacion;
            console.log(casa);
            this.escena.add(casa);
        }
        //calcularGammaParedes(this.paredes);
        //BalanceEnergetico.calcularGammaParedes(this.paredes, this.cardinalPointsCircle, this.circlePoints);
        //this.props.onParedesChanged(this.paredes);
    }

    agregarPared() {
        this.construyendo = false;

        var pared = this.paredConstruccion.clone();
        pared.material = this.materialParedConstruida.clone();
        pared.castShadow = true;
        pared.receiveShadow = false;

        this.paredConstruccion.visible = false;

        pared.startPoint = this.startNewPared.clone();
        pared.endPoint = this.indicador_dibujado.position.clone();

        let xStart = pared.startPoint.x + 25, zStart = pared.startPoint.z + 25;
        let xEnd = pared.endPoint.x + 25, zEnd = pared.endPoint.z + 25;

        this.grafoParedes.addVertex(pared.id);

        let ids = this.positionParedes[xStart][zStart];

        for (let id of ids) {
            this.grafoParedes.addEdge(pared.id, id);
        }

        this.positionParedes[xStart][zStart].push(pared.id);

        ids = this.positionParedes[xEnd][zEnd];

        for (let id of ids) {
            this.grafoParedes.addEdge(pared.id, id);
        }

        this.positionParedes[xEnd][zEnd].push(pared.id);

        var cycles = this.grafoParedes.getCycle();

        if (cycles.length > 0) {
            for(let cycle of cycles ){
                let keys = cycle.keys();

                let paredesCiclo = [];

                for(let key of keys){
                    if(cycle.get(key)){
                        var paredCiclo = this.escena.getObjectById(key);
                        if(paredCiclo){
                            paredesCiclo.push(paredCiclo);
                        }

                    }
                }
                paredesCiclo.push(pared);

                this.crearCasaParedes(paredesCiclo);
            }
        }else{
            this.escena.add(pared);
        }

        pared.tipo =  Morfologia.tipos.PARED;
        this.paredes.push(pared);
        this.allObjects.push(pared);
        //BalanceEnergetico.calcularGammaParedes(this.paredes, this.cardinalPointsCircle, this.circlePoints);
        //this.props.onParedesChanged(this.paredes);

    }

    onChangeCamera(event) {
        this.setState({camara: event.target.value})
    }

    onMouseDown(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //seleccionado construccion de pared
        if (this.props.dibujando == 4) {
            if (event.button === 0) {
                this.construyendo = true;
                let intersects = this.raycaster.intersectObjects(this.objetos);
                if (intersects.length > 0) {
                    let intersect = intersects[0];
                    let startHabitacion = (intersect.point).add(intersect.face.normal).clone();
                    startHabitacion = startHabitacion.round();
                    this.managerCasas.setStartHabitacion(startHabitacion);


                    /*let intersect = intersects[0];
                    this.startNewPared = (intersect.point).add(intersect.face.normal).clone();
                    this.paredConstruccion.geometry = this.crearGeometriaPared(0, this.heightWall);
                    this.startNewPared.round();
                    this.paredConstruccion.visible = true;*/
                }
            }
        }
    }

    onMouseUp(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //seleccionado construccion de pared
        if (this.props.dibujando == 4) {
            //click derecho
            if (event.button === 0) {
                this.managerCasas.agregarHabitacionDibujada();
                this.construyendo = false;

            }
        }
    }

    onMouseMove(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //Si se está seleccionado
        if(this.props.seleccionando){
            let intersects = this.raycaster.intersectObjects(this.allObjects);
            if(intersects.length > 0){
                let intersect = intersects[0].object;
                if(this.objetoSeleccionado != intersect && this.objetoSeleccionado != null){

                    switch (this.objetoSeleccionado.tipo) {
                        case  Morfologia.tipos.PARED:
                            this.objetoSeleccionado.material = this.materialParedConstruida.clone();
                            break;
                        case  Morfologia.tipos.VENTANA:
                            this.objetoSeleccionado.material = this.materialVentanaConstruida.clone();
                        default:
                            break;
                    }
                }
                this.objetoSeleccionado = intersect;
                switch (this.objetoSeleccionado.tipo) {
                    case  Morfologia.tipos.PARED:
                        this.objetoSeleccionado.material = this.materialSeleccionado.clone();
                        break;
                    case  Morfologia.tipos.VENTANA:
                        this.objetoSeleccionado.material = this.materialSeleccionado.clone();
                    default:
                        break;
                }

            }else{
                if(this.objetoSeleccionado != null){
                    switch (this.objetoSeleccionado.tipo) {
                        case  Morfologia.tipos.PARED:
                            this.objetoSeleccionado.material = this.materialParedConstruida.clone();
                            break;
                        case  Morfologia.tipos.VENTANA:
                            this.objetoSeleccionado.material = this.materialVentanaConstruida.clone();
                        default:
                            break;
                    }
                    this.objetoSeleccionado = null;
                }
            }
        }

        //Si se está dibujando
        if (this.props.dibujando !== -1 && this.props.dibujando < 6) {
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
            if (this.props.dibujando < 5) {
                let intersects = this.raycaster.intersectObjects(this.objetos);
                if (intersects.length > 0) {
                    intersect = intersects[0];

                    this.indicador_dibujado.position.copy(intersect.point).add(intersect.face.normal);
                    this.indicador_dibujado.position.round();
                    //si es pared
                    if (this.props.dibujando == 4) {
                        this.indicador_dibujado.position.y = this.heightWall / 2;
                        if (this.construyendo) {
                            var nextPosition = (intersect.point).add(intersect.face.normal).clone();
                            nextPosition.round();
                            this.managerCasas.crecerHabitacion(nextPosition);



                            /*var dir = nextPosition.clone().sub(this.startNewPared);
                            var widthPared = this.startNewPared.distanceTo(nextPosition);
                            this.paredConstruccion.geometry = this.crearGeometriaPared(widthPared, this.heightWall);
                            var len = dir.length();
                            dir = dir.normalize().multiplyScalar(len * 0.5);
                            let pos = this.startNewPared.clone().add(dir);
                            this.paredConstruccion.position.copy(pos);
                            var angleRadians = Math.atan2(nextPosition.z - this.startNewPared.z, nextPosition.x - this.startNewPared.x);
                            this.paredConstruccion.rotation.y = -angleRadians;
                            this.paredConstruccion.position.y = 0;*/
                        }
                    } else {
                        this.indicador_dibujado.position.y = 0;
                    }

                }
            }
            //si se dibuja una ventana, se intersecta con paredes.
            else if (this.props.dibujando == 5 ) {
                let intersects = this.raycaster.intersectObjects(this.paredes);
                if (intersects.length > 0) {
                    intersect = intersects[0];
                    let pared = intersect.object;
                    let pos = intersect.point.clone();
                    pared.worldToLocal(pos);
                    pos.round();
                    if (pos.x < 2) {
                        this.paredDeVentana = pared;
                        this.indicador_dibujado.setRotationFromEuler(pared.rotation);
                        this.indicador_dibujado.position.copy(intersect.point).round();
                        this.indicador_dibujado.position.y = pared.piso * this.heightWall;
                    }

                }
            }

        }else{
            if(this.indicador_dibujado != null){
                this.indicador_dibujado.visible = false;
                this.indicador_dibujado = null;
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
        if (this.props.dibujando < 4 && this.props.dibujando != -1) {
            this.agregarCasa();
        }

        if (this.props.dibujando == 5 && this.props.dibujando != -1) {
            this.agregarVentana();
        }

        if(this.props.seleccionando){
            console.log(this.props.dibujando);
            this.handleSeleccionado();
        }
    }

    handleSeleccionado(){
        if (this.objetoSeleccionado != null){
            this.props.onSeleccionadoChanged(this.objetoSeleccionado);
        }
    }

    agregarVentana() {

        if (this.paredDeVentana != null) {
            var ventana = this.indicador_dibujado.clone();
            ventana.orientacion = new THREE.Vector3(this.paredDeVentana.userData.orientacion.x, this.paredDeVentana.userData.orientacion.y,this.paredDeVentana.userData.orientacion.z);
            ventana.pos = new THREE.Vector3();
            ventana.setRotationFromEuler(new THREE.Euler(0, 0, 0, 'XYZ'));
            ventana.tipo =  Morfologia.tipos.VENTANA;
            this.paredDeVentana.add(ventana);
            this.paredDeVentana.worldToLocal(ventana.position);
            this.ventanas.push(ventana);
            this.allObjects.push(ventana);
            this.props.onVentanasChanged(this.ventanas);
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
                //tabIndex="0"
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
    onSeleccionadoChanged: PropTypes.func,

};

Morfologia.tipos = {PARED : 0, VENTANA : 1, PUERTA : 2, TECHO : 3, PISO : 4,};
Morfologia.separacion = {EXTERIOR : 0, PAREADA : 1};
Morfologia.aislacionPiso = {CORRIENTE: 0, MEDIO : 1, AISLADO : 2};
Morfologia.tipos_texto = {
    0 : 'Pared',
    1 : 'Ventana',
    2 : 'Puerta',
    3 : 'Techo',
    4 : 'Piso',
};

export default Morfologia
