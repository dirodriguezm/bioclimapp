import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';
import { SpriteText2D, MeshText2D,textAlign } from 'three-text2d'

class Context extends Component {
    //Aqui se nomban objetos y se asocian a un metodo
    constructor(props) {
        super(props)
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.state = {
          height: props.height,
          width: props.width,
        }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.ventanas != this.state.ventanas){
      this.setState({
        ventanas: nextProps.ventanas
      });
      this.calcularFAR(nextProps.ventanas);
    }
  }

  componentDidMount() {
    const width = this.state.width;
    const height = this.state.height;
    var mouse = new THREE.Vector2();
    this.mouse = mouse;
    //arreglo de objetos de obstruccion
    var obstrucciones = [];
    //Hay que cargar escena, camara, y renderer,
    //Escena
    var escena = new THREE.Scene();
    escena.background = new THREE.Color( 0xf0f0f0 );

    //Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setClearColor('#F0F0F0');
    renderer.setSize(width,height);
    renderer.setPixelRatio( window.devicePixelRatio );


    // // 2D Camara
    var camara = new THREE.OrthographicCamera( width / -20 , width / 20, height / 20,  height / -20 , 1, 2000 );
    camara.position.set( 0, 10, 0 );
    camara.lookAt( new THREE.Vector3() );
    camara.zoom = 0.8;
    camara.updateProjectionMatrix();
    escena.add(camara);
    //Controles de camara
    const control = new OrbitControls( camara, renderer.domElement );
    control.maxPolarAngle = 0;
    control.maxAzimuthAngle = 0;
    control.minAzimuthAngle = 0;
    control.enabled = true;
    // 3D Camara
  //   var camara = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
  // camara.position.set( 5, 8, 13 );
  // camara.lookAt( new THREE.Vector3() );
  // const control = new OrbitControls( camara, renderer.domElement );
  // control.enabled = true;
  // control.maxDistance = 500;
  // this.control = control;

    //Plano
    var planoGeometria = new THREE.PlaneBufferGeometry( 80, 80);
    planoGeometria.rotateX( - Math.PI / 2 );
    var plano = new THREE.Mesh( planoGeometria, new THREE.MeshBasicMaterial( { visible: true } ) );
    escena.add( plano );

    //Grid del plano
    var gridHelper = new THREE.GridHelper( 80,80, 0xCCCCCC, 0xCCCCCC);
    escena.add(gridHelper);

    //Indicador de puntos cardinales
    var curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      25, 25,           // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );
    var points = curve.getPoints( 359 );
    var circleGeometry = new THREE.BufferGeometry().setFromPoints( points );
    var circleMaterial = new THREE.LineBasicMaterial( { color : 0xCCCCCC } );
    var cardinalPointsCircle = new THREE.Line( circleGeometry, circleMaterial );
    //Circulo de puntos cardinales con letras
    cardinalPointsCircle.rotateX(- Math.PI /2);
    cardinalPointsCircle.position.set(0,0.001,0);
    cardinalPointsCircle.name = "cardinalPointsCircle";
    this.cardinalPointsCircle = cardinalPointsCircle;
    this.circlePoints = points;
    escena.add(cardinalPointsCircle);
    var sprite = new MeshText2D("S", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
    sprite.scale.setX(0.03);
    sprite.scale.setY(0.03);
    sprite.position.set(0,0.3,25);
    sprite.rotateX(- Math.PI / 2);
    escena.add(sprite);
    var sprite = new MeshText2D("N", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
    sprite.scale.setX(0.03);
    sprite.scale.setY(0.03);
    sprite.position.set(0,0.3,-25);
    sprite.rotateX(- Math.PI / 2);
    escena.add(sprite);
    var sprite = new MeshText2D("E", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
    sprite.scale.setX(0.03);
    sprite.scale.setY(0.03);
    sprite.position.set(25,0.3,0);
    sprite.rotateX(- Math.PI / 2);
    escena.add(sprite);
    var sprite = new MeshText2D("O", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
    sprite.scale.setX(0.03);
    sprite.scale.setY(0.03);
    sprite.position.set(-25,0.3,0);
    sprite.rotateX(- Math.PI / 2);
    escena.add(sprite);
    //caja que representa la casa al centro del plano
    var centerBoxGeom = new THREE.BoxBufferGeometry( 1, 1, 1 );
    var centerBoxMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
    var centerBox = new THREE.Mesh( centerBoxGeom, centerBoxMaterial );
    escena.add( centerBox );

    // OBSTRUCCIONES POR DEFECTO
    var obstruccionGeom = new THREE.BoxBufferGeometry(6,5,0.5);
    var obstruccionMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
    var obstruccion1 = new THREE.Mesh(obstruccionGeom, obstruccionMaterial);
    obstruccion1.position.set(-10,0,-10);
    obstruccion1.name = "obstruccion";
    escena.add(obstruccion1);
    obstrucciones.push(obstruccion1);

    obstruccionGeom = new THREE.BoxBufferGeometry(6,5,0.5);
    obstruccionGeom.rotateY(-Math.PI / 4);
    var obstruccion2 = new THREE.Mesh(obstruccionGeom, obstruccionMaterial);
    obstruccion2.position.set(12,0,-12);
    escena.add(obstruccion2);
    obstrucciones.push(obstruccion2);

    obstruccionGeom = new THREE.BoxBufferGeometry(6,5,0.5);
    var obstruccion3 = new THREE.Mesh(obstruccionGeom, obstruccionMaterial);
    obstruccion3.position.set(3,0,-12);
    escena.add(obstruccion3);
    obstrucciones.push(obstruccion3);


    //Se agregan a state
    this.setState({
      escena: escena,
      camara: camara,
      control: control,
      renderer: renderer,
      plano: plano,
      obstrucciones: obstrucciones,
      mouse: mouse,
    });


    this.mount.appendChild(renderer.domElement);
    this.start();
  }

  componentWillUnmount() {
      this.stop()
      this.mount.removeChild(this.state.renderer.domElement)
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
      this.state.renderer.render(this.state.escena, this.state.camara)
  }

  onMouseMove(event) {
    event.preventDefault()
    if(document.getElementById("text")){
      var text = document.getElementById("text");
      text.parentNode.removeChild(text);
    }
    var rect = this.state.renderer.domElement.getBoundingClientRect();
    var mouse = this.state.mouse;
    let raycasterMouse = new THREE.Raycaster();
    mouse.x = ( ( event.clientX - rect.left ) / ( rect.width ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.height ) ) * 2 + 1;
    raycasterMouse.setFromCamera( mouse, this.state.camara );
    var intersections = raycasterMouse.intersectObject(this.state.plano);
    var point = {x: intersections[0].point.x, y: - intersections[0].point.z}
    this.setState({
      mouse: mouse,
      mousePoint: point,
    });
    //elemento HTML que indica las coordenadas en el plano
    if(mouse.x <= 0.98 && mouse.x >= -0.98 && mouse.y <= 0.98 && mouse.y >= -0.98){
      var text2 = document.createElement('div');
      text2.setAttribute("id","text");
      text2.style.position = 'absolute';
      //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
      text2.style.width = 100;
      text2.style.height = 100;
      text2.style.backgroundColor = "#f0f0f0";
      text2.innerHTML = Math.round(point.x) + "," + Math.round(point.y);
      text2.style.top = (event.clientY) + 'px';
      text2.style.left = (event.clientX + 20) + 'px';
      document.body.appendChild(text2);
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
        let intersections = raycasterFAR.intersectObjects(this.state.obstrucciones);
        var hex = 0xffff;
        var arrowHelper = new THREE.ArrowHelper( angle, ventana.pos, 10, hex );
        this.state.escena.add(arrowHelper);
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
        firstElement = firstElement - obstruccion.betaAngle;
        far += obstruccion.far;
      }
      ventana.obstrucciones = obstruccionesVentana;
      ventana.far = firstElement / 90 + far;
    }
    debugger;
  }

  getPointInBetween(pointA, pointB) {
    var dir = pointB.clone().sub(pointA);
    var len = dir.length();
    dir = dir.normalize().multiplyScalar(len*0.5);
    return pointA.clone().add(dir);
  }

  render() {
   return (
     <div
       ref={(mount) => { this.mount = mount }}
       onMouseMove={this.onMouseMove}
     />
   )
  }
}
export default Context
