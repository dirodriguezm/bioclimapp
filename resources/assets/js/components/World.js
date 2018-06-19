import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';

class Scene extends Component {
    //Aqui se nomban objetos y se asocian a un metodo
    constructor(props) {
        super(props)
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.agregarPared = this.agregarPared.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.state = {
          height: props.height,
          width: props.width,
          paredes: [],
        }
  }

  componentDidMount() {
        //configuracion pantalla

        const width = this.state.width;
        const height = this.state.height;

        //posicion de mouse en la pantalla
        var mouse = new THREE.Vector2();
        this.mouse = mouse;
        //arreglo de objetos visibles que podrían interactuar
        var objetos = [];
        var paredes = [];
        var ventanas = [];


        //Hay que cargar escena, camara, y renderer,
        //Escena
        var escena = new THREE.Scene();
        escena.background = new THREE.Color( 0xf0f0f0 );
        this.escena = escena;

        //Camara
        var camara = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
    	camara.position.set( 5, 8, 13 );
    	camara.lookAt( new THREE.Vector3() );
        this.camara = camara;
        //Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.shadowMap.enabled = true;
        renderer.setClearColor('#F0F0F0');
        renderer.setSize(width,height);
        renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer = renderer;
        //Controles para la camara
        const control = new OrbitControls( camara, renderer.domElement );
        control.enabled = true;
        control.maxDistance = 500;
        this.control = control;
        /*controls.minDistance = 10;*/

        //Plano se agrega a objetos //
        var planoGeometria = new THREE.PlaneBufferGeometry( 50, 50 );
    		planoGeometria.rotateX( - Math.PI / 2 );
        var plano = new THREE.Mesh( planoGeometria, new THREE.MeshBasicMaterial( { visible: true } ) );
    		escena.add( plano );
    		objetos.push( plano );

        //Grid del plano
        var gridHelper = new THREE.GridHelper( 50, 50 );
        escena.add(gridHelper);

        //Indicador de puntos cardinales
        var curve = new THREE.EllipseCurve(
        	0,  0,            // ax, aY
        	20, 20,           // xRadius, yRadius
        	0,  2 * Math.PI,  // aStartAngle, aEndAngle
        	false,            // aClockwise
        	0                 // aRotation
        );
        var points = curve.getPoints( 359 );
        var circleGeometry = new THREE.BufferGeometry().setFromPoints( points );
        var circleMaterial = new THREE.LineBasicMaterial( { color : 0x808080 } );
        var cardinalPointsCircle = new THREE.Line( circleGeometry, circleMaterial );
        cardinalPointsCircle.rotateX(- Math.PI /2);
        cardinalPointsCircle.position.set(0,0.001,0);
        cardinalPointsCircle.name = "cardinalPointsCircle";
        this.cardinalPointsCircle = cardinalPointsCircle;
        this.circlePoints = points;
        escena.add(cardinalPointsCircle);
        //objetos.push(cardinalPointsCircle);


        //Indicador de la pared
        const geomeIndPared = new THREE.CylinderBufferGeometry(0.05, 0.05, 2, 32);
        const geo = new THREE.BoxBufferGeometry(1,1,1);
        const materialIndPared = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
        var indicadorPared = new THREE.Mesh(geomeIndPared, materialIndPared);
        indicadorPared.visible = false;
		    escena.add( indicadorPared );
        this.indicadorPared = indicadorPared;

        //pared que dibuja nuevas paredes
        var geoParedFantasma = new THREE.BoxBufferGeometry(0.05,2,0.05);
        const materialParedFantasma = new THREE.MeshBasicMaterial({ color: '#433F81', opacity: 0.5, transparent: true });
        var paredFantasma = new THREE.Mesh( geoParedFantasma, materialParedFantasma );
        paredFantasma.visible = false;
        escena.add( paredFantasma );
        this.paredFantasma = paredFantasma;
        this.materialParedFantasma = materialParedFantasma

        // Luces, es el sol, todavía no se si funcionan
        var light = new THREE.AmbientLight( 0x404040 ); // soft white light
        escena.add( light );
        const factor = 1
        var directionalLight = new THREE.DirectionalLight( 0xffffff );
    		directionalLight.position.x = factor*(Math.random() - 0.5);
    		directionalLight.position.y = factor*(Math.random() - 0.5);
    		directionalLight.position.z = factor*(Math.random() - 0.5);
    		directionalLight.position.normalize();
    		escena.add( directionalLight );
    		var directionalLight = new THREE.DirectionalLight( 0x808080 );
    		directionalLight.position.x = factor*(Math.random() - 0.5);
    		directionalLight.position.y = factor*(Math.random() - 0.5);
    		directionalLight.position.z = factor*(Math.random() - 0.5);
    		directionalLight.position.normalize();
    		escena.add( directionalLight );

        //raycaster, usado para apuntar objetos
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 3;
        this.raycaster = raycaster


        var construyendo = false
        this.construyendo = construyendo
        var construirPared = false
        this.construirPared = construirPared
        var construirVentana = false
        this.construirVentana = construirVentana
        //controles, ahora con teclas para probar

        this.mount.appendChild(this.renderer.domElement)
        this.start()
        this.setState({
          objetos: objetos,
          paredes: paredes,
          ventanas: ventanas,
        });
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

  agregarPared() {
      if (this.state.dibujando) {
          var pared = this.paredFantasma.clone();
          var material = new THREE.MeshLambertMaterial({ color: '#433F81', transparent: false });
          pared.material = material
          this.paredFantasma.visible = false;
          pared.castShadow = true;
          this.orientacion = this.orientacion.normalize();
          var hex = 0xffff;
          var arrowHelper = new THREE.ArrowHelper( this.orientacion, pared.position, 5, hex );
          this.escena.add( arrowHelper );
          this.orientacion = this.orientacion.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
          pared.orientacion = this.orientacion;
          var hex = 0xffff00;
          var arrowHelper = new THREE.ArrowHelper( this.orientacion, pared.position, 5, hex );
          this.escena.add( arrowHelper );
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
      }else {
          var geomeIndPared = new THREE.BoxBufferGeometry(0.05, 2, 0.05);
          this.paredFantasma.geometry = geomeIndPared
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
      if(code == 49){
          this.control.enabled = false;
          this.construirPared = true
          this.construirVentana = false
          this.renderScene()
          this.indicadorPared.visible = true
      }else if (code == 50) {
          this.control.enabled = false;
          this.construirPared = false
          this.construirVentana = true
          this.indicadorPared.visible = false
      }else if (code == 48) {
          this.control.enabled = true;
          this.construirPared = false
          this.construirVentana = false
          this.indicadorPared.visible = false
      }
      console.log(code);
  }

  onMouseMove(event) {
      event.preventDefault()
      var rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ( ( event.clientX - rect.left ) / ( rect.width ) ) * 2 - 1;
      this.mouse.y = - ( ( event.clientY - rect.top ) / ( rect.height ) ) * 2 + 1;
      this.raycaster.setFromCamera( this.mouse, this.camara );

      var intersects = 0;

      //console.log("x: "+this.mouse.x+"\ny: "+this.mouse.y);

      if(this.construirPared){
          intersects = this.raycaster.intersectObjects(this.state.objetos);
      }else if (this.construirVentana) {
          intersects = this.raycaster.intersectObjects(this.state.paredes);
      }

      if(intersects.length > 0){
          var intersect = intersects[0]
          //console.log(intersect.point);
          if(this.construirVentana){
              console.log(intersect);

          }else if (this.construirPared) {
              this.indicadorPared.position.copy( intersect.point ).add( intersect.face.normal );
              this.indicadorPared.position.floor()
              if(this.indicadorPared.position.y < 1){
                  this.indicadorPared.position.y = 1
              }
          }

          if(this.state.dibujando) {
              var nexPosition = this.indicadorPared.position.clone();
              var dir = nexPosition.clone().sub(this.startPosition);
              this.orientacion = dir.clone();
              var widthPared = this.startPosition.distanceTo(nexPosition);
              var geomeIndPared = new THREE.BoxBufferGeometry(widthPared, 2, 0.05);
              this.paredFantasma.geometry = geomeIndPared
              var len = dir.length();
              dir = dir.normalize().multiplyScalar(len*0.5);
              var pos = this.startPosition.clone().add(dir);
              this.paredFantasma.position.copy(pos);
              var angleRadians = Math.atan2(nexPosition.z - this.startPosition.z, nexPosition.x - this.startPosition.x);
              this.paredFantasma.rotation.y = -angleRadians


          }

      }
  }

  calcularGammaParedes(paredes){
    for (let pared of paredes){
      var orientacionRaycaster = new THREE.Raycaster();
      orientacionRaycaster.set(new THREE.Vector3(),pared.orientacion);
      var inter = orientacionRaycaster.intersectObject(this.cardinalPointsCircle);
      let interPoint = inter[11].point.add(inter[10].point);
      interPoint = interPoint.multiplyScalar(0.5);
      // var hex = 0xffff;
      // var arrowHelper = new THREE.ArrowHelper( inter[11].point, new THREE.Vector3(), 10, hex );
      // this.escena.add(arrowHelper);
      let closestDistance = 99;
      let closestPoint = {};
      let i = 0;
      let index = 0;
      for (let point of this.circlePoints){
        let circlePoint = new THREE.Vector3(point.x,0.001,point.y);
        let temp = circlePoint.distanceTo(interPoint);
        if(temp < closestDistance){
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

  transformDegreeToGamma(degree){
    if (degree >270 && degree <= 360) degree = 180 - degree;
    else degree -= 90;
    return degree;
  }

  onClick(event){
      event.preventDefault()
      if(this.construirPared){
          this.agregarPared();
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
      onKeyDown={this.onKeyDown}
      tabIndex="0"
      onMouseMove={this.onMouseMove}
      onClick={this.onClick}
      ref={(mount) => { this.mount = mount }}
    />
  )
 }
 }

 export default Scene
