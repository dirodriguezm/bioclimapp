import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as THREE from 'three'
import Orbitcontrols from 'orbit-controls-es6';
import { SpriteText2D, MeshText2D,textAlign } from 'three-text2d'

class Context extends Component {
    constructor(props) {
        super(props)
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.state = {
          height: props.height,
          width: props.width,
        }
        this.dibujando = false;
        this.seleccionando = false;
        this.borrando = false;
        this.ventanas = [
          {pos: new THREE.Vector3(0,0,-0.5),
           orientacion: new THREE.Vector3(0,0,-1)
          }
        ];
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.ventanas != this.state.ventanas){
      this.ventanas = nextProps.ventanas;
      this.calcularFAR(nextProps.ventanas);
    }
    if(nextProps.agregarContexto){
      this.agregarContexto = true;
      this.seleccionando = false;
      var geometry = new THREE.BoxBufferGeometry(0.05,2,0.05);
      const material = new THREE.MeshBasicMaterial({ color: '#433F81', opacity: 0.5, transparent: true });
      var obstruccionFantasma = new THREE.Mesh( geometry, material );
      obstruccionFantasma.visible = false;
      this.escena.add( obstruccionFantasma );
      this.obstruccionFantasma = obstruccionFantasma;
    }
    if(nextProps.seleccionar){
      this.seleccionando = true;
      this.agregarContexto = false;
    }
  }

  componentDidMount() {
    const width = this.state.width;
    const height = this.state.height;
    var mouse = new THREE.Vector2();
    this.mouse = mouse;
    //arreglo de objetos de obstruccion
    this.obstrucciones = [];
    //Hay que cargar this.escena, this.camara, y renderer,
    //this.escena
    this.escena = new THREE.Scene();
    this.escena.background = new THREE.Color( 0xf0f0f0 );

    //Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor('#F0F0F0');
    this.renderer.setSize(width,height);
    this.renderer.setPixelRatio( window.devicePixelRatio );


    // // 2D this.camara
    this.camara = new THREE.OrthographicCamera( width / -20 , width / 20, height / 20,  height / -20 , 1, 2000 );
    this.camara.position.set( 0, 10, 0 );
    this.camara.lookAt( new THREE.Vector3() );
    this.camara.zoom = 0.8;
    this.camara.updateProjectionMatrix();
    this.escena.add(this.camara);
    //this.controles de this.camara
    this.control = new Orbitcontrols( this.camara, this.renderer.domElement );
    this.control.maxPolarAngle = 0;
    this.control.maxAzimuthAngle = 0;
    this.control.minAzimuthAngle = 0;
    this.control.enabled = true;
    // 3D this.camara
    // this.camara = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
    // this.camara.position.set( 5, 8, 13 );
    // this.camara.lookAt( new THREE.Vector3() );
    // this.control = new Orbitcontrols( this.camara, this.renderer.domElement );
    // this.control.enabled = true;
    // this.control.maxDistance = 500;

    //Plano
    let planoGeometria = new THREE.PlaneBufferGeometry( 80, 80);
    planoGeometria.rotateX( - Math.PI / 2 );
    this.plano = new THREE.Mesh( planoGeometria, new THREE.MeshBasicMaterial( { visible: true } ) );
    this.escena.add( this.plano );

    //Grid del plano
    let gridHelper = new THREE.GridHelper( 80,80, 0xCCCCCC, 0xCCCCCC);
    this.escena.add(gridHelper);

    //Indicador de puntos cardinales
    let curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      25, 25,           // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );
    let points = curve.getPoints( 359 );
    let circleGeometry = new THREE.BufferGeometry().setFromPoints( points );
    let circleMaterial = new THREE.LineBasicMaterial( { color : 0xCCCCCC } );
    this.cardinalPointsCircle = new THREE.Line( circleGeometry, circleMaterial );
    //Circulo de puntos cardinales con letras
    this.cardinalPointsCircle.rotateX(- Math.PI /2);
    this.cardinalPointsCircle.position.set(0,0.001,0);
    this.cardinalPointsCircle.name = "cardinalPointsCircle";
    this.cardinalPointsCircle = this.cardinalPointsCircle;
    this.circlePoints = points;
    this.escena.add(this.cardinalPointsCircle);
    let sprite = new MeshText2D("S", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
    sprite.scale.setX(0.03);
    sprite.scale.setY(0.03);
    sprite.position.set(0,0.3,25);
    sprite.rotateX(- Math.PI / 2);
    this.escena.add(sprite);
    sprite = new MeshText2D("N", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
    sprite.scale.setX(0.03);
    sprite.scale.setY(0.03);
    sprite.position.set(0,0.3,-25);
    sprite.rotateX(- Math.PI / 2);
    this.escena.add(sprite);
    sprite = new MeshText2D("E", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
    sprite.scale.setX(0.03);
    sprite.scale.setY(0.03);
    sprite.position.set(25,0.3,0);
    sprite.rotateX(- Math.PI / 2);
    this.escena.add(sprite);
    sprite = new MeshText2D("O", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
    sprite.scale.setX(0.03);
    sprite.scale.setY(0.03);
    sprite.position.set(-25,0.3,0);
    sprite.rotateX(- Math.PI / 2);
    this.escena.add(sprite);
    //caja que representa la casa al centro del plano
    let centerBoxGeom = new THREE.BoxBufferGeometry( 1, 1, 1 );
    let centerBoxMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
    let centerBox = new THREE.Mesh( centerBoxGeom, centerBoxMaterial );
    this.escena.add( centerBox );

    var light = new THREE.AmbientLight( 0x404040, 100 ); // soft white light
    this.escena.add( light );

    this.mount.appendChild(this.renderer.domElement);
    this.start();
  }

  componentWillUnmount() {
      this.stop()
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
        this.renderScene()
        this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene() {
      this.renderer.render(this.escena, this.camara)
  }

  onMouseMove(event) {
    event.preventDefault()
    if(document.getElementById("text")){
      var text = document.getElementById("text");
      text.parentNode.removeChild(text);
    }
    var rect = this.renderer.domElement.getBoundingClientRect();
    var mouse = this.mouse;
    let raycasterMouse = new THREE.Raycaster();
    mouse.x = ( ( event.clientX - rect.left ) / ( rect.width ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.height ) ) * 2 + 1;
    raycasterMouse.setFromCamera( mouse, this.camara );
    var intersections = raycasterMouse.intersectObject(this.plano);
    var point = {x: intersections[0].point.x, y: - intersections[0].point.z}
    this.mouse = mouse;
    this.mousePoint = point; // Coordenadas del mouse en el world pero 2D x: eje x, y: -eje z
    //elemento HTML que indica las coordenadas en el plano
    var text2 = document.createElement('div');
    text2.setAttribute("id","text");
    text2.style.position = 'absolute';
    text2.style.width = 100;
    text2.style.height = 100;
    text2.style.backgroundColor = "#f0f0f0";
    text2.innerHTML = Math.round(point.x) + "," + Math.round(point.y);
    text2.style.top = (event.clientY) + 'px';
    text2.style.left = (event.clientX + 20) + 'px';
    document.body.appendChild(text2);

    if(this.dibujando){
      this.nuevoContexto();
    }
    if(this.seleccionando){
      intersections = raycasterMouse.intersectObjects(this.obstrucciones);
      if(intersections.length > 0){
        this.selectedObstruction = intersections[0].object;
        this.selectedObstructionMaterial = intersections[0].object.material.clone();
        this.selectedObstruction.material = this.obstruccionFantasma.material;
      }
      else if(this.selectedObstruction != null){
        debugger;
        this.selectedObstruction.material = this.selectedObstructionMaterial;
        this.selectedObstruction = null;
        this.selectedObstructionMaterial = null;
      }

    }
  }

  onClick(event){


  }

  onMouseDown(event){
    if(this.agregarContexto && event.button == 0){
      this.dibujando = true;
      this.puntoInicial = new THREE.Vector3(Math.round(this.mousePoint.x) , 0,
                                            -Math.round(this.mousePoint.y));
    }
  }
  onMouseUp(event){
    if(this.dibujando){
      let material = new THREE.MeshBasicMaterial({color: 0x000000});
      let obstruccion = this.obstruccionFantasma.clone();
      obstruccion.material = material;
      this.obstrucciones.push(obstruccion);
      this.escena.add(obstruccion);
      this.obstruccionFantasma.visible = false;
      this.dibujando = false;
      this.calcularFAR(this.ventanas);
    }
  }

  onMouseLeave(event){
    if(document.getElementById("text")){
      var text = document.getElementById("text");
      text.parentNode.removeChild(text);
    }
  }

  calcularFAR(ventanas){
    //let ventanas = this.state.ventanas;
    let axisY = new THREE.Vector3(0,1,0);
    let raycasterFAR = new THREE.Raycaster();
    for(let ventana of ventanas){
      let angleLeft = ventana.orientacion.clone().applyAxisAngle(axisY, Math.PI / 4);
      let angleRight = ventana.orientacion.clone().applyAxisAngle(axisY,-Math.PI / 4);
      let angle = angleLeft.clone();
      let obstruccionesVentana = [];
      for(let i = 0; i < 90; i++){
        angle = angle.normalize();
        raycasterFAR.set(ventana.pos, angle);
        let intersections = raycasterFAR.intersectObjects(this.obstrucciones);
        for(let intersection of intersections){
          if(! intersection.object.marked){
            intersection.object.pointStart = intersection.point;
            intersection.object.aDistance = intersection.object.geometry.parameters.height - ventana.pos.y;
            obstruccionesVentana.push(intersection.object);
            intersection.object.marked = true;
          }
          intersection.object.pointEnd = intersection.point;
          intersection.object.betaAngle = intersection.object.pointStart.angleTo(intersection.point) * 180 / Math.PI;
          let middlePoint = this.getPointInBetween(intersection.object.pointStart, intersection.object.pointEnd);
          let auxPoint = new THREE.Vector3(middlePoint.x, ventana.pos.y, ventana.pos.z);
          intersection.object.bDistance = middlePoint.distanceTo(auxPoint);
          intersection.object.far = Math.pow(0.2996,(intersection.object.aDistance/intersection.object.bDistance))
                                    * intersection.object.betaAngle / 90;
        }
        angle.applyAxisAngle(axisY, -Math.PI/180);
      }
      let firstElement = 90;
      let far = 0;
      for(let obstruccion of obstruccionesVentana){
        obstruccion.marked = false;
        firstElement = firstElement - obstruccion.betaAngle; //el primer elemento de la formula de FAR (90 - sum(beta)) / 90
        far += obstruccion.far;
        obstruccion.material.color.set(0xff0000);
        console.log("obstruccion", obstruccion);
      }
      ventana.obstrucciones = obstruccionesVentana;
      ventana.far = firstElement / 90 + far;
    }
    this.props.onFarChanged(ventanas);
  }

  getPointInBetween(pointA, pointB) {
    var dir = pointB.clone().sub(pointA);
    var len = dir.length();
    dir = dir.normalize().multiplyScalar(len*0.5);
    return pointA.clone().add(dir);
  }

  nuevoContexto(){
    let puntoActual = new THREE.Vector3(Math.round(this.mousePoint.x), 0,
                                        -Math.round(this.mousePoint.y));
    let dir = puntoActual.sub(this.puntoInicial);
    let largo = dir.length();
    let geometry = new THREE.BoxBufferGeometry(largo, 1,0.5);
    this.obstruccionFantasma.geometry = geometry;
    dir = dir.normalize().multiplyScalar(largo/2);
    let pos = this.puntoInicial.clone().add(dir);
    this.obstruccionFantasma.position.set(pos.x, 0, pos.z)
    var angleRadians = Math.atan2(-dir.z, dir.x);
    this.obstruccionFantasma.rotation.y = angleRadians;
    this.obstruccionFantasma.visible = true;
  }

  render() {
   return (
     <div
       ref={(mount) => { this.mount = mount }}
       onMouseMove={this.onMouseMove}
       onClick={this.onClick}
       onMouseDown={this.onMouseDown}
       onMouseUp={this.onMouseUp}
       onMouseEnter={this.onMouseEnter}
       onMouseLeave={this.onMouseLeave}
     />
   )
  }
}
export default Context
