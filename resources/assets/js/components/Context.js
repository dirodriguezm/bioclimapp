import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as THREE from 'three'
import Orbitcontrols from 'orbit-controls-es6';
import { SpriteText2D, MeshText2D,textAlign } from 'three-text2d'

class Context extends Component {
    //Aqui se nomban objetos y se asocian a un metodo
    constructor(props) {
        super(props)
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.state = {
          height: props.height,
          width: props.width,
          dibujando: false,
        }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.ventanas != this.state.ventanas){
      this.ventanas = nextProps.ventanas;
      this.calcularFAR(nextProps.ventanas);
    }
    if(nextProps.agregarContexto){
      this.setState({ agregarContexto:true });
      var geometry = new THREE.BoxBufferGeometry(0.05,2,0.05);
      const material = new THREE.MeshBasicMaterial({ color: '#433F81', opacity: 0.5, transparent: true });
      var obstruccionFantasma = new THREE.Mesh( geometry, material );
      obstruccionFantasma.visible = false;
      this.escena.add( obstruccionFantasma );
      this.obstruccionFantasma = obstruccionFantasma;
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
  //   var this.camara = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
  // this.camara.position.set( 5, 8, 13 );
  // this.camara.lookAt( new THREE.Vector3() );
  // const this.control = new Orbitthis.controls( this.camara, renderer.domElement );
  // this.control.enabled = true;
  // this.control.maxDistance = 500;
  // this.this.control = this.control;

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

    // OBSTRUCCIONES POR DEFECTO
    let obstruccionGeom = new THREE.BoxBufferGeometry(6,5,0.5);
    let obstruccionMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
    let obstruccion1 = new THREE.Mesh(obstruccionGeom, obstruccionMaterial);
    obstruccion1.position.set(-10,0,-10);
    obstruccion1.name = "obstruccion";
    this.escena.add(obstruccion1);
    this.obstrucciones.push(obstruccion1);

    obstruccionGeom = new THREE.BoxBufferGeometry(6,5,0.5);
    obstruccionGeom.rotateY(-Math.PI / 4);
    let obstruccion2 = new THREE.Mesh(obstruccionGeom, obstruccionMaterial);
    obstruccion2.position.set(12,0,-12);
    this.escena.add(obstruccion2);
    this.obstrucciones.push(obstruccion2);

    obstruccionGeom = new THREE.BoxBufferGeometry(6,5,0.5);
    let obstruccion3 = new THREE.Mesh(obstruccionGeom, obstruccionMaterial);
    obstruccion3.position.set(3,0,-12);
    this.escena.add(obstruccion3);
    this.obstrucciones.push(obstruccion3);

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
    if(mouse.x <= 0.98 && mouse.x >= -0.98 && mouse.y <= 0.98 && mouse.y >= -0.98){
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
    }
    if(this.state.dibujando){
      this.agregarContexto();
    }
  }

  onClick(event){
    if(this.state.agregarContexto){
      this.setState(prevState => ({
        dibujando: !prevState.dibujando
      }));
      this.puntoInicial = new THREE.Vector3(Math.round(this.mousePoint.x) , 0,
                                            -Math.round(this.mousePoint.y));
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
  }

  getPointInBetween(pointA, pointB) {
    var dir = pointB.clone().sub(pointA);
    var len = dir.length();
    dir = dir.normalize().multiplyScalar(len*0.5);
    return pointA.clone().add(dir);
  }

  agregarContexto(){
    let puntoActual = new THREE.Vector3(Math.round(this.mousePoint.x), 0,
                                        -Math.round(this.mousePoint.y));
    let dir = puntoActual.sub(this.puntoInicial);
    let largo = dir.length();
    let geometry = new THREE.BoxBufferGeometry(largo, 1,0.5);
    this.obstruccionFantasma.geometry = geometry;
    dir = dir.normalize().multiplyScalar(largo/2);
    let pos = this.puntoInicial.clone().add(dir);
    this.obstruccionFantasma.position.set(pos.x, 0, pos.z)
    var angleRadians = Math.atan2(puntoActual.z - this.puntoInicial.z, puntoActual.x - this.puntoInicial.x);
    //this.obstruccionFantasma.rotation.y = -angleRadians;
    this.obstruccionFantasma.visible = true;
    // let material = new THREE.MeshLambertMaterial({ color: '#433F81', transparent: false });
    // let obstruccion = this.obstruccionFantasma.clone();
    // obstruccion.material = material;


  }

  render() {
   return (
     <div
       ref={(mount) => { this.mount = mount }}
       onMouseMove={this.onMouseMove}
       onClick={this.onClick}
     />
   )
  }
}
export default Context
