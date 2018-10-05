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
        this.onDrag = this.onDrag.bind(this);
        this.onChangeCamera = this.onChangeCamera.bind(this);

        this.temperaturasMes = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.temperaturaConfort = 19;
        this.angleRotated = 0;

        this.state  = {
            height: props.height,
            width: props.width,
        };


    };

    componentDidUpdate(prevProps) {
        if (this.props.sunPosition !== prevProps.sunPosition) {
            this.onSunpositionChanged();
        }
        if(this.props.sunPath !== prevProps.sunPath){
            this.getSunPath();
        }
        if (this.props.click2D !== prevProps.click2D) {
            this.onPerspectiveChanged();
        }
        if(this.paredes !== this.props.paredes && this.props.paredes != null){
            this.paredes = this.props.paredes.slice();
        }

        if(this.props.comuna !== prevProps.comuna){
            this.onComunaChanged();
        }

        if(this.props.dimensionesPared !== prevProps.dimensionesPared && this.props.dimensionesPared != null){
            this.managerCasas.modificarParedHabitacion(this.props.dimensionesPared.pared, this.props.dimensionesPared.width, this.props.dimensionesPared.height );
            let casa = this.managerCasas.getCasa();
            let aporte_interno = casa.userData.aporteInterno;
            let perdida_ventilacion =  casa.userData.perdidaPorVentilacion;
            let perdida_conduccion = casa.userData.perdidaPorConduccion;
            this.props.onCasaChanged(aporte_interno, perdida_ventilacion, perdida_conduccion);
        }
        if(this.props.width !== prevProps.width ){
            this.renderer.setSize(this.props.width, this.props.height);
            this.camara.aspect = this.props.width / this.props.height;
            this.camara.updateProjectionMatrix();
            this.renderer.render(this.escena, this.camara);
        }

        if(this.props.paredCapaChange){
            this.managerCasas.capasChanged(this.props.seleccionadoMorf);
            let casa = this.managerCasas.getCasa();
            let aporte_interno = casa.userData.aporteInterno;
            let perdida_ventilacion =  casa.userData.perdidaPorVentilacion;
            let perdida_conduccion = casa.userData.perdidaPorConduccion;
            this.props.onCasaChanged(aporte_interno, perdida_ventilacion, perdida_conduccion);
            this.props.onCapaReady();
        }
        if(this.props.sunPathClicked !== prevProps.sunPathClicked){
            this.handleSunPathClicked(this.props.sunPathClicked);
        }

        if(this.props.casaPredefinida !== prevProps.casaPredefinida && this.props.casaPredefinida !== -1){
            this.handleCasaPredefinida(this.props.casaPredefinida);
        }
    }

    onComunaChanged() {
        axios.get("http://127.0.0.1:8000/api/temperaturas/"+this.props.comuna.id)
            .then(response => this.getJson(response));

    }

    getJson(response) {
        let data = response.data.slice();
        for (let i = 0; i < data.length; i++) {
            this.temperaturasMes[i] = data[i].valor;
        }
        let res = BalanceEnergetico.gradosDias(this.temperaturasMes, this.temperaturaConfort);
        let gradoDias = res[0];
        let periodo = res[1];
        this.managerCasas.setGradosDias(gradoDias, periodo);
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

    handleSunPathClicked(sunPathClicked){
        let group = this.escena.getObjectByName("sunPath");
        if(sunPathClicked === true){
            if(group != null){
                this.escena.remove(group);
            }
        }
        else {
            this.escena.add(this.sunPath);
        }
    }

    handleCasaPredefinida(casaPredefinida) {
        this.managerCasas.handleCasaPredefinida(casaPredefinida);
        this.props.onCasaPredefinidaChanged(-1);
        this.props.onParedesChanged(this.paredes);
        this.props.onVentanasChanged(this.ventanas);


        console.log("ventanas",this.ventanas);

        this.managerCasas.agregarHabitacionDibujada();
        let casa = this.managerCasas.getCasa();
        let aporte_interno = casa.userData.aporteInterno;
        let perdida_ventilacion =  casa.userData.perdidaPorVentilacion;
        let perdida_conduccion = casa.userData.perdidaPorConduccion;

        this.props.onCasaChanged(aporte_interno, perdida_ventilacion, perdida_conduccion);


    }

    getSunPath(){
        let sunPath = this.escena.getObjectByName("sunPath");
        if(sunPath != null){
            this.escena.remove(sunPath);
        }
        let allPoints= [];
        let now = new Date();
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        let today = Math.floor(diff / oneDay);
        let invierno = new Date(now.getFullYear(),5,21);
        let verano = new Date(now.getFullYear(),11,21);
        let diff_invierno = (invierno - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let diff_verano = (verano - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let day_invierno = Math.floor(diff_invierno / oneDay);
        let day_verano = Math.floor(diff_verano / oneDay);
        if(today < day_invierno){
            today = day_invierno + (day_invierno - today);
        }
        if(today > day_verano){
            today = day_verano + (day_verano - today);
        }
        let day = day_invierno;
        let group = new THREE.Group();
        group.name = "sunPath";
        for(let daySunPath of this.props.sunPath){
            let curvePoints = [];
            for(let sunPosition of daySunPath){
                let sunDegrees = this.transformGammaToDegree(sunPosition.azimuth);
                let index = Math.round(sunDegrees);
                let sunPosCircle = this.circlePoints[index];
                index = Math.round(sunPosition.altitude);
                if (index < 0) {
                    index = 360 + index;
                }
                let sunAlt = this.circlePoints[index];

                let sunPos = new THREE.Vector3(sunPosCircle.x, 0, sunPosCircle.y);
                let d = sunPos.distanceTo(new THREE.Vector3(0, 0.001, 0));
                let f = sunAlt.x / d;
                sunPos = sunPos.clone().multiplyScalar(Math.abs(f));
                curvePoints.push(new THREE.Vector3(sunPos.x, sunAlt.y - 1, sunPos.z));
            }
            let curve = new THREE.CatmullRomCurve3(curvePoints, true);
            let points = curve.getPoints(100);
            allPoints.push(points);
            let geometry = new THREE.BufferGeometry().setFromPoints(points);
            if(day === today){
                let material = new THREE.LineBasicMaterial({color: 0x950714, linewidth: 2});
                let curveObject = new THREE.Line(geometry, material);
                curveObject.position.set(curveObject.position.x, curveObject.position.y + 0.1, curveObject.position.z -0.1);
                group.add(curveObject);
            }
            else{
                let material = new THREE.LineBasicMaterial({color: 0xfbeb90, linewidth: 2});
                let curveObject = new THREE.Line(geometry, material);
                group.add(curveObject);
            }
            day++;

        }
        group.add(this.sol);
        group.add(this.light);
        this.sunPath = group;
        this.escena.add(group);
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
        this.puertas = [];
        this.objetoSeleccionado = null;
        this.objetoClick = null;
        this.paredDeVentana = null;
        this.grafoParedes = new Graph(0);
        this.pisos = [];
        this.techos = [];

        this.casas = new THREE.Group();

        //Hay que cargar escena, camara, y renderer,
        //Escena
        let escena = new THREE.Scene();
        escena.background = new THREE.Color(0xf0f0f0);
        this.escena = escena;

        this.ocupantes = 4;
        this.horasIluminacion = 5;
        this.aireRenovado = 5;

        this.heightWall = 2.5;

        this.managerCasas = new ManagerCasas(
            this.escena,
            this.paredes,
            this.ventanas,
            this.puertas,
            this.allObjects,
            this.ocupantes,
            this.horasIluminacion,
            this.aireRenovado,
            this.heightWall,
        );

        //Camaras

        //camara 2d
        const val = 2 * 16;
        let camara2D = new THREE.OrthographicCamera(width / -val, width / val, height / val, height / -val, 1, 1000);
        camara2D.position.set(0, 3, 0);
        camara2D.zoom = 2.5;
        camara2D.updateProjectionMatrix ();
        this.camara2D = camara2D;
        //CAMARA 3D
        let camara3D = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camara3D.position.set(0, 8, 27);
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
        //this.escena.add(this.light);

        this.light.shadow.mapSize.width = 512;  // default
        this.light.shadow.mapSize.height = 512; // default
        this.light.shadow.camera.near = 0.5;    // default
        this.light.shadow.camera.far = 500;



        //Mesh Sol
        var solGeometry = new THREE.SphereBufferGeometry(0.5, 32, 32);
        var solMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
        this.sol = new THREE.Mesh(solGeometry, solMaterial);
        this.sol.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
        //this.escena.add(this.sol);

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
        let planoGeometria = new THREE.PlaneBufferGeometry(20, 20);
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


        let plano = new THREE.Mesh(planoGeometria, new THREE.MeshLambertMaterial({
            color: '#3D7B00',
            side: THREE.DoubleSide,
        }));
        plano.receiveShadow = true;
        plano.castShadow = false;
        escena.add(plano);
        this.objetos.push(plano);

        //Grid del plano
        let gridHelper = new THREE.GridHelper(20, 20, 0xCCCCCC, 0xCCCCCC);
        escena.add(gridHelper);

        //Indicador de puntos cardinales
        let curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            10, 10,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        var points = curve.getPoints(360);
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
        sprite.position.set(0, -10, 0.3);
        cardinalPointsCircle.add(sprite);
        sprite = new MeshText2D("N", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, 10, 0.3);
        cardinalPointsCircle.add(sprite);
        sprite = new MeshText2D("E", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(10, 0.3, 0);
        cardinalPointsCircle.add(sprite);
        sprite = new MeshText2D("O", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(-10, 0.3, 0);
        cardinalPointsCircle.add(sprite);


        //Indicador de la pared
        const geomeIndPared = new THREE.CylinderBufferGeometry(0.05, 0.05, 5, 32);
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
            color: '#33ebed',
            opacity: 0.4,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialParedConstruida = new THREE.MeshLambertMaterial({
            color: '#eaedc7',
            side: THREE.DoubleSide,

        });

        this.materialVentanaConstruida = new THREE.MeshBasicMaterial({
            color: '#33ebed',
            opacity: 0.4,
            transparent: true,
            side: THREE.DoubleSide,
        });


        this.materialSeleccionado = new THREE.MeshLambertMaterial({
            color: '#FF0000',
            side : THREE.DoubleSide,

        });

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

        this.widthWall = 10;


        this.indicador_dibujado = this.crearIndicadorConstruccionPared(this.heightWall, 0.05);
        escena.add(this.indicador_dibujado);

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

        this.renderer.render(this.escena, this.camara);
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
                //console.log(casa);
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
            //console.log(casa);
            this.escena.add(casa);
        }
        this.props.onParedesChanged(this.paredes);
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
        if (this.props.dibujando === 0) {
            if (event.button === 0) {
                this.construyendo = true;
                let intersects = this.raycaster.intersectObjects(this.objetos);
                if (intersects.length > 0) {
                    let intersect = intersects[0];
                    let startHabitacion = (intersect.point).add(intersect.face.normal).clone();
                    startHabitacion = startHabitacion.round();
                    this.managerCasas.setStartHabitacion(startHabitacion, this.raycaster);
                }
            }
        }

        if(this.props.rotando && event.button === 0){
            this.dragging = true;
            this.prevX = event.screenX;
        }
    }

    onMouseUp(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //seleccionado construccion de pared
        if (this.props.dibujando === 0) {
            //click derecho
            if (event.button === 0) {
                this.managerCasas.agregarHabitacionDibujada();
                let casa = this.managerCasas.getCasa();
                let aporte_interno = casa.userData.aporteInterno;
                let perdida_ventilacion =  casa.userData.perdidaPorVentilacion;
                let perdida_conduccion = casa.userData.perdidaPorConduccion;

                this.props.onCasaChanged(aporte_interno, perdida_ventilacion, perdida_conduccion);
                this.props.onParedesChanged(this.paredes);
                this.construyendo = false;

            }
        }

        if(this.dragging && this.props.rotando){
            this.dragging = false;
            console.log("rotado", this.angleRotated);
            let ventanas = [];
            for(let pared of this.paredes){
                let resultAngle = pared.userData.gamma + this.angleRotated;
                if(resultAngle > 180){
                    pared.userData.gamma = resultAngle - 360;
                }
                else if(resultAngle < -180){
                    pared.userData.gamma = resultAngle + 360;
                }
                else{
                    pared.userData.gamma = resultAngle;
                }
                for(let child of pared.children){
                    if(child.userData.tipo === Morfologia.tipos.VENTANA){
                        child.userData.orientacion.applyAxisAngle(new THREE.Vector3(0,1,0), -this.angleRotated * Math.PI / 180);
                        ventanas.push(child);
                    }
                }
            }
            this.angleRotated = 0;
            this.props.onParedesChanged(this.paredes);
            console.log("asdad")
            if(ventanas.length > 0) this.props.onVentanasChanged(ventanas);
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

                    switch (this.objetoSeleccionado.userData.tipo) {
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
                switch (this.objetoSeleccionado.userData.tipo) {
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
                    switch (this.objetoSeleccionado.userData.tipo) {
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
        if (this.props.dibujando !== -1 && this.props.dibujando < 4) {
            let index = parseInt(this.props.dibujando);
            let intersect;
            //si se dibujan paredes
            if (this.props.dibujando === 0) {
                console.log("YES");
                let intersects = this.raycaster.intersectObjects(this.objetos);
                if (intersects.length > 0) {
                    intersect = intersects[0];
                    this.indicador_dibujado.visible = true;
                    this.indicador_dibujado.position.copy(intersect.point).add(intersect.face.normal);
                    this.indicador_dibujado.position.round();
                    //si es pared

                        this.indicador_dibujado.position.y = this.heightWall / 2;
                        if (this.construyendo) {
                            var nextPosition = (intersect.point).add(intersect.face.normal).clone();
                            nextPosition.round();
                            this.managerCasas.crecerHabitacion(nextPosition);
                        }


                }
            }
            //si se dibuja una ventana o pared, se intersecta con paredes.
            else if (this.props.dibujando === 1 || this.props.dibujando === 2 ) {
                let intersects = this.raycaster.intersectObjects(this.paredes);
                if (intersects.length > 0) {
                    intersect = intersects[0];
                    let pared = intersect.object;
                    let pos = intersect.point.clone();
                    if(this.props.dibujando === 1){
                        this.managerCasas.moverVentanaConstruccion(pared, pos);
                    }else{
                        this.managerCasas.moverPuertaConstruccion(pared, pos);
                    }

                }else{
                    if(this.props.dibujando === 1){
                        this.managerCasas.ocultarVentanaConstruccion();
                    }else{
                        this.managerCasas.ocultarPuertaConstruccion();
                    }
                }
            }
        }
        else{
            if(this.indicador_dibujado != null){
                this.indicador_dibujado.visible = false;
            }
        }

        //si se está rotando
        if(this.dragging){
            // console.log("comparar", movementX, event.movementX);
            // this.angleRotated += (angle*180/Math.PI);
            let movementX = event.screenX - this.prevX;
            this.prevX = event.screenX;
            let angle = Math.PI * movementX / 180;
            this.angleRotated += (angle*180/Math.PI);
            this.cardinalPointsCircle.rotateZ(angle);
            this.sunPath.rotateY(angle);
            //this.light.position.set(this.sol.position.x, this.sol.position.y, this.sol.position.z);

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

        if (this.props.dibujando === 1 && this.props.dibujando !== -1) {
            this.managerCasas.agregarVentana();
            this.props.onVentanasChanged(this.ventanas);
        }

        if (this.props.dibujando === 2 && this.props.dibujando !== -1) {
            this.managerCasas.agregarPuerta();
        }

        if(this.props.seleccionando){
            this.handleSeleccionado();
        }
    }

    onDrag(event){
        console.log("drag", event);
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
            ventana.fs = 0.87;
            ventana.fm = 0.95;
            ventana.um = 2.6;
            ventana.geometry.computeBoundingBox();
            this.paredDeVentana.add(ventana);
            this.paredDeVentana.worldToLocal(ventana.position);
            this.ventanas.push(ventana);
            this.allObjects.push(ventana);
            this.props.onVentanasChanged(this.ventanas);
        }
    }

    render() {
        return (
            <div
                //tabIndex="0"
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onMouseMove={this.onMouseMove}
                onClick={this.onClick}
                onDrag={this.onDrag}
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
    dimensionesPared: PropTypes.object,
    onCapaReady: PropTypes.func,
    onCasaPredefinidaChanged: PropTypes.func,

};

Morfologia.tipos = {PARED : 0, VENTANA : 1, PUERTA : 2, TECHO : 3, PISO : 4,};
Morfologia.separacion = {EXTERIOR : 0, PAREADA : 1, INTERIOR : 2};
Morfologia.aislacionPiso = {CORRIENTE: 0, MEDIO : 1, AISLADO : 2};
Morfologia.tipos_texto = {
    0 : 'Pared',
    1 : 'Ventana',
    2 : 'Puerta',
    3 : 'Techo',
    4 : 'Piso',
};

export default Morfologia
