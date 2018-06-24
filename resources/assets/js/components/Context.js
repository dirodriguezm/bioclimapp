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

  componentDidMount() {
    const width = this.state.width;
    const height = this.state.height;
    var mouse = new THREE.Vector2();
    this.mouse = mouse;
    //arreglo de objetos visibles que podrían interactuar
    var objetos = [];
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


    //Camara
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

    //Plano
    var planoGeometria = new THREE.PlaneBufferGeometry( 80, 80);
    planoGeometria.rotateX( - Math.PI / 2 );
    var plano = new THREE.Mesh( planoGeometria, new THREE.MeshBasicMaterial( { visible: true } ) );
    escena.add( plano );
    objetos.push( plano );

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

    var centerBoxGeom = new THREE.BoxBufferGeometry( 1, 1, 1 );
    var centerBoxMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
    var centerBox = new THREE.Mesh( centerBoxGeom, centerBoxMaterial );
    escena.add( centerBox );

    //raycaster, usado para apuntar objetos
    var raycaster = new THREE.Raycaster();
    raycaster.linePrecision = 3;

    //Se agregan a state
    this.setState({
      escena: escena,
      camara: camara,
      control: control,
      renderer: renderer,
      objetos: objetos,
      mouse: new THREE.Vector2(),
      raycaster: raycaster,
    })

    this.mount.appendChild(renderer.domElement)
    this.start()
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
    var raycaster = new THREE.Raycaster();
    mouse.x = ( ( event.clientX - rect.left ) / ( rect.width ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.height ) ) * 2 + 1;
    raycaster.setFromCamera( this.state.mouse, this.state.camara );
    var intersections = raycaster.intersectObjects(this.state.objetos);
    var point = {x: intersections[0].point.x, y: - intersections[0].point.z}
    this.setState({
      mouse: mouse,
      raycaster:raycaster,
      mousePoint: point,
    });
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
