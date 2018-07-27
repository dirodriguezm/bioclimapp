import React, {Component} from 'react'
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';
import {MeshText2D, textAlign} from 'three-text2d';
import PropTypes from "prop-types";

class Morfologia extends Component {
    //Aqui se nomban objetos y se asocian a un metodo
    constructor(props) {
        super(props);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.agregarPared = this.agregarPared.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onChangeCamera = this.onChangeCamera.bind(this);
        this.crearCasasPredefinidas = this.crearCasasPredefinidas.bind(this);

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
        var sunLight = new THREE.PointLight(0xFFFFFF, 1, 100);
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

        sunLight.position.set(sunPos.x, sunAlt.y - 1, sunPos.z);
        sunLight.name = "sunLight";
        let remove = this.escena.getObjectByName("sunLight");
        this.escena.remove(remove);
        this.escena.add(sunLight);
        //SOL
        var solGeometry = new THREE.SphereBufferGeometry(0.5, 32, 32);
        var solMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
        var sol = new THREE.Mesh(solGeometry, solMaterial);
        sol.name = "sunSphere";
        remove = this.escena.getObjectByName("sunSphere");
        this.escena.remove(remove);
        sol.position.set(sunLight.position.x, sunLight.position.y, sunLight.position.z);
        this.escena.add(sol);
    }

    onPerspectiveChanged() {
        if (this.props.click2D) {
            this.camara.position.set(0, 16, 0);
            this.camara.lookAt(new THREE.Vector3());
            this.control.enablePan = true;
            this.control.enableRotation = false;
            this.control.mouseButtons = {
                PAN: THREE.MOUSE.RIGHT,
                ZOOM: THREE.MOUSE.MIDDLE,
                ORBIT: -1,
            };

        } else {
            this.camara.position.set(5, 8, 13);
            this.camara.lookAt(new THREE.Vector3());
            this.control.enablePan = false;
            this.control.enableRotation = true;
            this.control.mouseButtons = {
                PAN: -1,
                ZOOM: THREE.MOUSE.MIDDLE,
                ORBIT: THREE.MOUSE.RIGHT,
            };
        }
    }

    componentDidMount() {
        //configuracion pantalla

        const width = this.state.width;
        const height = this.state.height;

        //posicion de mouse en la pantalla
        this.mouse = new THREE.Vector2();

        //arreglo de objetos visibles que podrían interactuar
        var objetos = [];
        var paredes = [];
        var ventanas = [];


        //Hay que cargar escena, camara, y renderer,
        //Escena
        let escena = new THREE.Scene();
        escena.background = new THREE.Color(0xf0f0f0);
        this.escena = escena;

        //Camara
        let camara = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camara.position.set(5, 8, 13);
        camara.lookAt(new THREE.Vector3());
        this.camara = camara;

        //Renderer
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.shadowMap.enabled = true;
        renderer.setClearColor('#F0F0F0');
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer = renderer;

        //Controles para la camara
        const control = new OrbitControls(camara, renderer.domElement);
        control.enabled = true;
        control.maxDistance = 100;
        control.minDistance = 10;
        this.control = control;

        //Plano se agrega a objetos
        let planoGeometria = new THREE.PlaneBufferGeometry(50, 50);
        planoGeometria.rotateX(-Math.PI / 2);
        let plano = new THREE.Mesh(planoGeometria, new THREE.MeshBasicMaterial({visible: true}));
        escena.add(plano);
        objetos.push(plano);

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

        //pared que dibuja nuevas paredes
        var geoParedFantasma = new THREE.BoxBufferGeometry(0.05, 2, 0.05);
        const materialParedFantasma = new THREE.MeshBasicMaterial({color: '#433F81', opacity: 0.5, transparent: true});
        var paredFantasma = new THREE.Mesh(geoParedFantasma, materialParedFantasma);
        paredFantasma.visible = false;
        escena.add(paredFantasma);
        this.paredFantasma = paredFantasma;
        this.materialParedFantasma = materialParedFantasma;


        //raycaster, usado para apuntar objetos
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 3;
        this.raycaster = raycaster;

        this.construyendo = false;
        this.construirPared = false;
        this.construirVentana = false;

        //controles, ahora con teclas para probar
        this.mount.appendChild(this.renderer.domElement);
        this.start();
        this.setState({
            objetos: objetos,
            paredes: paredes,
            ventanas: ventanas,
        });

        var casas = this.crearCasasPredefinidas();
        this.casa_dibujada = null;
        this.casas = casas;
    }

    crearCasasPredefinidas() {
        //casa simple Predefinida
        var widthWall = 3;
        var heightWall = 1;
        var geoParedPre = new THREE.BoxBufferGeometry(widthWall, heightWall, 0.05);
        var halfWidth = widthWall / 2;
        var casas = [];
        //casa simple
        var pared1 = new THREE.Mesh(geoParedPre, this.materialParedFantasma);
        pared1.position.y = heightWall / 2;
        pared1.position.z = pared1.position.z + halfWidth;

        var pared2 = new THREE.Mesh(geoParedPre, this.materialParedFantasma);
        pared2.position.copy(pared1.position);
        pared2.rotation.y = Math.PI / 2;
        pared2.position.x = pared2.position.x + halfWidth;
        pared2.position.z = pared2.position.z - halfWidth;

        var pared3 = new THREE.Mesh(geoParedPre, this.materialParedFantasma);
        pared3.position.copy(pared2.position);
        pared3.rotation.y = Math.PI;
        pared3.position.z = pared3.position.z - halfWidth;
        pared3.position.x = pared3.position.x - halfWidth;

        var pared4 = new THREE.Mesh(geoParedPre, this.materialParedFantasma);
        pared4.position.copy(pared3.position);
        pared4.rotation.y = Math.PI / 2;
        pared4.position.x = pared4.position.x - halfWidth;
        pared4.position.z = pared4.position.z + halfWidth;

        var casa = new THREE.Group();
        casa.add(pared1);
        casa.add(pared2);
        casa.add(pared3);
        casa.add(pared4);

        casas.push(casa);
        //casa doble
        var pared5 = pared1.clone();
        pared5.position.x = pared5.position.x + widthWall;
        var pared6 = pared2.clone();
        pared6.position.x = pared6.position.x + widthWall;
        var pared7 = pared3.clone();
        pared7.position.x = pared7.position.x + widthWall;

        var casa2 = casa.clone();
        casa2.add(pared5);
        casa2.add(pared6);
        casa2.add(pared7);
        casa2.position.set(-halfWidth, 0, 0);
        casas.push(casa2);

        //casa simple dos pisos
        var newHeight = heightWall + heightWall / 2;

        var pared8 = pared1.clone();
        pared8.position.y = newHeight;
        var pared9 = pared2.clone();
        pared9.position.y = newHeight;
        var pared10 = pared3.clone();
        pared10.position.y = newHeight;
        var pared11 = pared4.clone();
        pared11.position.y = newHeight;

        var geoFloor = new THREE.BoxBufferGeometry(widthWall, 0.05, widthWall);
        floor = new THREE.Mesh(geoFloor, this.materialParedFantasma);
        floor.position.x = pared1.position.x;
        floor.position.z = pared1.position.z - widthWall / 2;
        floor.position.y = heightWall;

        var casa3 = casa.clone();
        casa3.add(pared8);
        casa3.add(pared9);
        casa3.add(pared10);
        casa3.add(pared11);
        casa3.add(floor);

        casas.push(casa3);
        //casa doble dos pisos
        var pared12 = pared1.clone();
        pared12.position.y = newHeight;
        var pared13 = pared2.clone();
        pared13.position.y = newHeight;
        var pared14 = pared3.clone();
        pared14.position.y = newHeight;
        var pared15 = pared4.clone();
        pared15.position.y = newHeight;
        var pared16 = pared5.clone();
        pared16.position.y = newHeight;
        var pared17 = pared6.clone();
        pared17.position.y = newHeight;
        var pared18 = pared7.clone();
        pared18.position.y = newHeight;

        geoFloor = new THREE.BoxBufferGeometry(widthWall * 2, 0.05, widthWall);
        var floor = new THREE.Mesh(geoFloor, this.materialParedFantasma);
        floor.position.x = pared1.position.x + widthWall / 2;
        floor.position.z = pared1.position.z - widthWall / 2;
        floor.position.y = heightWall;

        var casa4 = casa2.clone();
        casa4.add(pared12);
        casa4.add(pared13);
        casa4.add(pared14);
        casa4.add(pared15);
        casa4.add(pared16);
        casa4.add(pared17);
        casa4.add(pared18);
        casa4.add(floor);

        casas.push(casa4);
        return casas;
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

    agregarCasa() {
        var material = new THREE.MeshLambertMaterial({color: '#433F81', transparent: false});
        var casa = this.casa_dibujada.clone();
        var i;
        for (i = 0; i < casa.children.length; i++) {
            casa.children[i].material = material;
            casa.children[i].castShadow = true;
        }
        this.escena.add(casa);
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


    onKeyDown(event) {
        event.preventDefault()
        const code = event.keyCode;
        if (code == 49) {
            this.control.enabled = false;
            this.construirPared = true
            this.construirVentana = false
            this.renderScene()
            this.indicadorPared.visible = true
        } else if (code == 50) {
            this.control.enabled = false;
            this.construirPared = false
            this.construirVentana = true
            this.indicadorPared.visible = false
        } else if (code == 48) {
            this.control.enabled = true;
            this.construirPared = false
            this.construirVentana = false
            this.indicadorPared.visible = false
        }
        console.log(code);
    }

    onChangeCamera(event) {
        this.setState({camara: event.target.value})
    }

    onMouseMove(event) {
        event.preventDefault();

        /*if (this.dibujando != -1 && this.dibujando < 4) {
            var index = parseInt(this.dibujando);
            if (this.casa_dibujada != this.casas[index]) {
                if (this.casa_dibujada != null) {
                    this.escena.remove(this.casa_dibujada);
                }
                this.casa_dibujada = this.casas[index];
                this.escena.add(this.casa_dibujada);
            }
            this.casa_dibujada.position.copy(intersect.point).add(intersect.face.normal);
            this.casa_dibujada.position.floor();

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

        var rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        var intersects = 0;

        //console.log("x: "+this.mouse.x+"\ny: "+this.mouse.y);

        if (this.construirPared) {
            intersects = this.raycaster.intersectObjects(this.state.objetos);
        } else if (this.construirVentana) {
            intersects = this.raycaster.intersectObjects(this.state.paredes);
        } else {
            intersects = this.raycaster.intersectObjects(this.state.objetos);
        }
        if (intersects.length > 0) {
            var intersect = intersects[0];
            //console.log(intersect.point);
            if (this.construirVentana) {
                console.log(intersect);

            } else if (this.construirPared) {
                this.indicadorPared.position.copy(intersect.point).add(intersect.face.normal);
                this.indicadorPared.position.floor();
                if (this.indicadorPared.position.y < 1) {
                    this.indicadorPared.position.y = 1
                }
            }

            if (this.props.dibujando !== -1 && this.props.dibujando < 4) {
                var index = parseInt(this.props.dibujando);
                if (this.casa_dibujada !== this.casas[index]) {
                    if (this.casa_dibujada != null) {
                        this.escena.remove(this.casa_dibujada);
                    }
                    this.casa_dibujada = this.casas[index];
                    this.escena.add(this.casa_dibujada);
                }
                this.casa_dibujada.position.copy(intersect.point).add(intersect.face.normal);
                this.casa_dibujada.position.floor();

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
                this.paredFantasma.rotation.y = -*/


            }


        }
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
        if (this.construirPared) {
            this.agregarPared();
        }
        if (this.props.dibujando < 4) {
            this.agregarCasa();
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
    borrando: PropTypes.number,
    seleccionando: PropTypes.number,

};

export default Morfologia
