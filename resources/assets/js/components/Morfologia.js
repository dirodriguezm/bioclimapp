import React, {Component} from 'react'
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';
import {MeshText2D, textAlign} from 'three-text2d';
import PropTypes from "prop-types";
import Graph from '../Utils/Graph';
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';
import axios from "axios";
import ManagerCasas from "../Utils/ManagerCasas";
import Typography from "@material-ui/core/Typography/Typography";

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
        this.onChangeCamera = this.onChangeCamera.bind(this);

        this.temperaturasMes = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.temperaturaConfort = props.temperatura;
        this.angleRotatedTemp = 0;
        this.coordenadasRotadas = false;

        this.state  = {
            height: props.height,
            width: props.width,
        };

    };

    componentDidUpdate(prevProps) {
        if (this.props.sunPosition !== prevProps.sunPosition || (this.sunPath == null && this.props.sunPosition != null)) {
            this.onSunpositionChanged();
            if(this.props.fecha != null) this.getSunPath(new Date(this.props.fecha));
            else this.getSunPath();
        }
        /*if(this.props.sunPath !== prevProps.sunPath || (this.sunPath == null && this.props.sunPosition != null)){
            this.getSunPath();
        }*/
        if (this.props.click2D !== prevProps.click2D) {
            this.onPerspectiveChanged();
        }
        if(this.paredes !== this.props.paredes && this.props.paredes != null){
            this.paredes = this.props.paredes.slice();
        }
        if(this.props.comuna !== prevProps.comuna){
            this.onComunaChanged();
        }

        if(this.props.alturaPiso !== prevProps.alturaPiso && this.props.alturaPiso !== null){
            this.managerCasas.modificarAlturaVentana(this.props.alturaPiso.ventana, this.props.alturaPiso.altura);
            this.props.onVentanasChanged(this.ventanas);
        }

        if(this.props.dimensiones !== prevProps.dimensiones && this.props.dimensiones != null){
            if(this.props.dimensiones.elemento.userData.tipo === Morfologia.tipos.PARED){
                this.managerCasas.modificarParedHabitacion(this.props.dimensiones.elemento, this.props.dimensiones.width, this.props.dimensiones.height );
                this.props.onVentanasChanged(this.ventanas);
            }
            if(this.props.dimensiones.elemento.userData.tipo === Morfologia.tipos.PUERTA){
                this.managerCasas.modificarPuerta(this.props.dimensiones.elemento, this.props.dimensiones.width, this.props.dimensiones.height );
            }
            if(this.props.dimensiones.elemento.userData.tipo === Morfologia.tipos.VENTANA){
                this.managerCasas.modificarVentana(this.props.dimensiones.elemento, this.props.dimensiones.width, this.props.dimensiones.height );
                this.props.onVentanasChanged(this.ventanas);
            }
            if(this.props.dimensiones.elemento.userData.tipo === Morfologia.tipos.PISO){
                //console.log(this.props.dimensiones.width, this.props.dimensiones.depth);
                this.managerCasas.modificarHabitacionDesdePiso(this.props.dimensiones.elemento, this.props.dimensiones.width, this.props.dimensiones.height );
                this.props.onVentanasChanged(this.ventanas);
            }
            this.handleChangeCasa();
        }
        if(this.props.width !== prevProps.width || this.props.height !== prevProps.height ){
            this.renderer.setSize(this.props.width, this.props.height);
            this.camara.aspect = this.props.width / this.props.height;
            this.camara.updateProjectionMatrix();
            this.renderer.render(this.escena, this.camara);
        }

        if(this.props.paredCapaChange){
            this.managerCasas.capasChanged(this.props.seleccionadoMorf);
            if(this.props.seleccionadoMorf.userData.tipo === Morfologia.tipos.VENTANA){
                this.props.onVentanasChanged(this.ventanas);
            }
            this.handleChangeCasa();
            this.props.onCapaReady();
        }
        if(this.props.sunPathClicked !== prevProps.sunPathClicked){
            this.handleSunPathClicked(this.props.sunPathClicked);
        }

        if(this.props.casaPredefinida !== prevProps.casaPredefinida && this.props.casaPredefinida !== -1){
            this.handleCasaPredefinida(this.props.casaPredefinida);
        }
        if(this.props.personas !== prevProps.personas) {
            this.ocupantes = this.props.personas;
            this.managerCasas.setPersonas(this.props.personas);
            this.handleChangeCasa();
        }
        if(this.props.temperatura !== prevProps.temperatura) {
            this.temperaturaConfort = this.props.temperatura;
            let res = BalanceEnergetico.gradosDias(this.temperaturasMes, this.temperaturaConfort);
            let gradoDias = res[0];
            let periodo = res[1];
            this.managerCasas.setGradosDias(gradoDias, periodo);
            this.props.onParedesChanged(this.paredes);
            this.props.onFarChanged(this.ventanas);
            this.handleChangeCasa();
        }
        if(this.props.iluminacion !== prevProps.iluminacion) {
            this.horasIluminacion = this.props.iluminacion;
            this.managerCasas.setIluminacion(this.props.iluminacion);
            this.handleChangeCasa();
        }
        if(this.props.aire !== prevProps.aire) {
            this.aireRenovado = this.props.aire;
            this.managerCasas.setAire(this.props.aire);
            this.handleChangeCasa();
        }
    }

    onComunaChanged() {
        axios.get("https://bioclimapp.host/api/temperaturas/"+this.props.comuna.id)
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
        this.managerCasas.setZona(this.props.comuna.zona);
        this.managerCasas.setGradosDias(gradoDias, periodo);
        this.props.onParedesChanged(this.paredes);
        this.props.onFarChanged(this.ventanas);
        this.handleChangeCasa();
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

        this.light.position.set(sunPos.x, (sunAlt.y-1), sunPos.z);

        this.sol.position.set(sunPos.x, sunAlt.y -1, sunPos.z);
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

        //this.managerCasas.agregarHabitacionDibujada();
        this.handleChangeCasa();


    }

    getSunPath(now = new Date()){
        let sunPath = this.escena.getObjectByName("sunPath");
        if(sunPath != null){
            this.escena.remove(sunPath);
        }
        let allPoints= [];
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
                let material = new THREE.LineBasicMaterial({color: 0x950714, linewidth: 5});
                let curveObject = new THREE.Line(geometry, material);
                curveObject.position.set(curveObject.position.x, curveObject.position.y + 0.1, curveObject.position.z -0.1);
                group.add(curveObject);
            }
            else{
                let material = new THREE.LineBasicMaterial({color: 0xfbeb90, linewidth: 5, transparent: true, opacity: 0.5 });
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
        this.pisos = [];
        this.objetoSeleccionado = null;
        this.objetoSeleccionadoClick = null;

        //Hay que cargar escena, camara, y renderer,
        //Escena
        let escena = new THREE.Scene();
        escena.background = new THREE.Color(0xf0f0f0);
        this.escena = escena;

        this.ocupantes = this.props.personas;
        this.horasIluminacion = this.props.iluminacion;
        this.aireRenovado = this.props.aire;

        this.heightWall = 2.5;

        this.managerCasas = new ManagerCasas(
            this.escena,
            this.paredes,
            this.ventanas,
            this.puertas,
            this.pisos,
            this.allObjects,
            this.ocupantes,
            this.horasIluminacion,
            this.aireRenovado,
            this.heightWall,
        );

        if(this.props.comuna != null){
            this.managerCasas.setZona(this.props.comuna.zona);
        }
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
        camara3D.position.set(0, 6, 15);
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

        this.escena.add(new THREE.AmbientLight(0xB1B1B1));
        //this.escena.add(this.casas);

        //Luz
        this.light = new THREE.DirectionalLight(0xffff00, 1, 100);
        this.light.castShadow = true;

        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        var d = 50;
        this.light.shadow.camera.left = -d;
        this.light.shadow.camera.right = d;
        this.light.shadow.camera.top = d;
        this.light.shadow.camera.bottom = -d;
        this.light.shadow.camera.far = 35;
        this.light.shadow.bias = -0.0001;

        //Mesh Sol
        var solGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
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

        let sizePlano = 30;
        //Plano se agrega a objetos
        let planoGeometria = new THREE.PlaneBufferGeometry(sizePlano, sizePlano);
        planoGeometria.rotateX(-Math.PI / 2);
        planoGeometria.computeFaceNormals();
        planoGeometria.computeVertexNormals();


        this.positionParedes = [];
        for (let i = 0; i < sizePlano; i++) {
            this.positionParedes[i] = [];
            for (let j = 0; j < sizePlano; j++) {
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
        this.light.target = plano;
        this.objetos.push(plano);

        //Grid del plano
        let gridHelper = new THREE.GridHelper(sizePlano,sizePlano, 0xCCCCCC, 0xCCCCCC);
        gridHelper.material = new THREE.LineBasicMaterial( {
            color: 0xffffff,
            linewidth: 4,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round' //ignored by WebGLRenderer
        } );
        escena.add(gridHelper);
        gridHelper.position.y+=0.001;

        //Indicador de puntos cardinales
        let curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            15, 15,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );

        var points = curve.getPoints(360);
        var circleGeometry = new THREE.BufferGeometry().setFromPoints(points);
        var circleMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 4});
        var cardinalPointsCircle = new THREE.Line(circleGeometry, circleMaterial,);

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
        sprite.position.set(0, -15, 0.0);
        cardinalPointsCircle.add(sprite);

        sprite = new MeshText2D("N", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, 16, 0.0);
        cardinalPointsCircle.add(sprite);
        sprite = new MeshText2D("E", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(15.5, 0.3, 0);
        cardinalPointsCircle.add(sprite);

        sprite = new MeshText2D("O", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(-15.5, 0.3, 0);
        cardinalPointsCircle.add(sprite);

        //Indicador de la pared
        const geomeIndPared = new THREE.CylinderBufferGeometry(0.05, 0.05, 5, 32);
        const materialIndPared = new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.5, transparent: true});
        var indicadorPared = new THREE.Mesh(geomeIndPared, materialIndPared);
        indicadorPared.visible = false;
        escena.add(indicadorPared);

        //Materiales
        this.materialIndicador = new THREE.MeshBasicMaterial({
            color: '#433F81',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });


        this.materialSeleccionado = new THREE.MeshLambertMaterial({
            color: '#FF0000',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,

        });

        var light = new THREE.AmbientLight(0x404040); // soft white light
        escena.add(light);

        //raycaster, usado para apuntar objetos
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 1;
        this.raycaster = raycaster;

        this.construyendo = false;

        this.indicador_dibujado = this.crearIndicadorConstruccionPared(this.heightWall, 0.05);
        escena.add(this.indicador_dibujado);

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    crearIndicadorConstruccionPared(heightWall, radius) {
        const geometria = new THREE.CylinderBufferGeometry(radius, radius, heightWall, 32);
        var indicadorPared = new THREE.Mesh(geometria, this.materialIndicador.clone());
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
                if(this.coordenadasRotadas){
                    BalanceEnergetico.calcularGammaParedes(this.paredes, this.cardinalPointsCircle, this.circlePoints);
                }
                this.handleChangeCasa();
                /*let casa = this.managerCasas.getCasa();
                this.props.onCasaChanged(
                    casa.userData.aporteInterno,
                    casa.userData.perdidaVentilacion,
                    casa.userData.perdidaVentilacionObjetivo,
                    casa.userData.perdidaPorConduccion,
                    casa.userData.perdidaPorConduccionObjetivo,
                    casa.userData.volumen,
                    casa.userData.area,
                );
                this.props.onParedesChanged(this.paredes);*/

                this.construyendo = false;

            }
        }

        if(this.dragging && this.props.rotando){
            this.dragging = false;
            
            let ventanas = [];
            for(let pared of this.paredes){
                let resultAngle = pared.userData.gamma + this.angleRotatedTemp;
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
                        child.userData.orientacion.applyAxisAngle(new THREE.Vector3(0,1,0), -this.angleRotatedTemp * Math.PI / 180);
                        ventanas.push(child);
                    }
                }
            }
            this.angleRotated = this.angleRotatedTemp;
            this.angleRotatedTemp = 0;
            if(this.paredes.length > 0) this.props.onParedesChanged(this.paredes);
            if(ventanas.length > 0) this.props.onVentanasChanged(ventanas);
            this.props.onRotationChanged();
            this.coordenadasRotadas = true;
        }
    }

    changeColorSeleccion(elemento){
        switch (elemento.userData.tipo) {
            case  Morfologia.tipos.PARED:
                elemento.material = this.managerCasas.materialParedConstruida.clone();
                break;
            case  Morfologia.tipos.VENTANA:
                elemento.material = this.managerCasas.materialVentanaConstruccion.clone();
                break;
            case Morfologia.tipos.PUERTA:
                elemento.material = this.managerCasas.materialPuertaConstruida.clone();
                break;
            case Morfologia.tipos.PISO:
                elemento.material = this.managerCasas.materialPisoConstruido.clone();
                break;
            default:
                break;
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

    onMouseMove(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //Si se está seleccionado
        if(this.props.seleccionando){
            let intersects = this.raycaster.intersectObjects(this.allObjects);

            if(this.objetoSeleccionadoClick !== null){
                this.changeColorSeleccion(this.objetoSeleccionadoClick);

            }
            if(intersects.length > 0){
                let intersect = intersects[0].object;
                if(this.objetoSeleccionado !== intersect && this.objetoSeleccionado != null){
                    this.changeColorSeleccion(this.objetoSeleccionado);
                }
                this.objetoSeleccionado = intersect;
                this.objetoSeleccionado.material = this.materialSeleccionado.clone();

            }else{
                if(this.objetoSeleccionado != null){
                    this.changeColorSeleccion(this.objetoSeleccionado);
                    this.objetoSeleccionado = null;
                }
            }

        }
        if(this.props.borrando){
            let intersects = this.raycaster.intersectObjects(this.allObjects);
            if(intersects.length > 0){
                let intersect = intersects[0].object;
                if(this.objetoSeleccionado !== intersect && this.objetoSeleccionado != null){
                    this.changeColorSeleccion(this.objetoSeleccionado);
                }
                this.objetoSeleccionado = intersect;
                this.objetoSeleccionado.material = this.materialSeleccionado.clone();

            }else{
                if(this.objetoSeleccionado != null){
                    this.changeColorSeleccion(this.objetoSeleccionado);
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
            else if(this.props.dibujando === 3){
                let intersects = this.raycaster.intersectObjects(this.paredes);
                if( intersects.length > 0){
                    intersect = intersects[0];
                    let piso = intersect.object;
                    this.managerCasas.moverTechoConstruccion(piso);
                }else{
                   this.managerCasas.ocultarTechoConstruccion();
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
            // 
            // this.angleRotatedTemp += (angle*180/Math.PI);
            let movementX = event.screenX - this.prevX;
            this.prevX = event.screenX;
            let angle = Math.PI * movementX / 180;
            this.angleRotatedTemp += (angle*180/Math.PI);
            this.cardinalPointsCircle.rotateZ(angle);
            this.sunPath.rotateY(angle);
            this.light.target.position.set(0,0,0);
            //this.light.position.set(this.sol.position.x, this.sol.position.y, this.sol.position.z);

        }
    }

    handleChangeCasa(){
        let casa = this.managerCasas.getCasa();
        this.props.onCasaChanged(
            casa.userData.aporteInterno,
            casa.userData.perdidaVentilacion,
            casa.userData.perdidaVentilacionObjetivo,
            casa.userData.perdidaPorConduccion,
            casa.userData.perdidaPorConduccionObjetivo,
            casa.userData.volumen,
            casa.userData.area,
        );
    }

    onClick(event) {
        event.preventDefault();

        if (this.props.dibujando === 1 && this.props.dibujando !== -1) {
            this.managerCasas.agregarVentana();
            this.props.onVentanasChanged(this.ventanas);

            this.handleChangeCasa();
        }

        if (this.props.dibujando === 2 && this.props.dibujando !== -1) {
            this.managerCasas.agregarPuerta();

            this.handleChangeCasa();
        }
        if(this.props.dibujando === 3 && this.props.dibujando !== -1){
            this.managerCasas.agregarTechoConstruccion();
            this.handleChangeCasa();
        }

        if(this.props.borrando){
            this.handleBorrado();
        }

        if(this.props.seleccionando){
            this.handleSeleccionado();

        }
    }

    handleSeleccionado(){
        if (this.objetoSeleccionado != null){
            this.props.onSeleccionadoChanged(this.objetoSeleccionado);

        }
        if(this.objetoSeleccionadoClick !== null){
            this.changeColorSeleccion(this.objetoSeleccionadoClick);
        }
        this.objetoSeleccionadoClick = this.objetoSeleccionado;
    }

    handleBorrado(){
        if(this.objetoSeleccionado != null){
            this.managerCasas.borrarEstructura(this.objetoSeleccionado);
            if(this.objetoSeleccionado.userData.tipo === Morfologia.tipos.VENTANA ||
                this.objetoSeleccionado.userData.tipo === Morfologia.tipos.PISO ||
                this.objetoSeleccionado.userData.tipo === Morfologia.tipos.PARED
            ){
                this.props.onVentanasChanged(this.ventanas);
            }
            this.objetoSeleccionado = null;
            if(this.objetoSeleccionadoClick !== null){
                this.changeColorSeleccion(this.objetoSeleccionadoClick);
            }
            this.objetoSeleccionadoClick = null;
        }
        this.handleChangeCasa();

    }

    render() {
        return (
            <div style={{height: this.props.height}}>
                <div style={{height: 10}}
                    //tabIndex="0"
                     onMouseDown={this.onMouseDown}
                     onMouseUp={this.onMouseUp}
                     onMouseMove={this.onMouseMove}
                     onClick={this.onClick}
                     ref={(mount) => {
                         this.mount = mount
                     }}
                />
                <Typography style={{
                                fontSize: 'x-small',
                            }}
                            align={"center"}
                            variant={"button"}
                            color={"textSecondary"}>
                    Rotar camara: botón secundario
                </Typography>
            </div>

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
    dimensiones: PropTypes.object,
    onCapaReady: PropTypes.func,
    onCasaPredefinidaChanged: PropTypes.func,

};

Morfologia.tipos = {PARED : 0, VENTANA : 1, PUERTA : 2, TECHO : 3, PISO : 4,};
Morfologia.separacion = {EXTERIOR : 0,  INTERIOR : 1};
Morfologia.aislacionPiso = {CORRIENTE: 0, MEDIO : 1, AISLADO : 2};
Morfologia.tipos_texto = {
    0 : 'Pared',
    1 : 'Ventana',
    2 : 'Puerta',
    3 : 'Techo',
    4 : 'Piso',
};

export default Morfologia
