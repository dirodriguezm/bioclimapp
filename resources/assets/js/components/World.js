import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';

class Scene extends Component {
    //Aqui se nomban objetos y se asocian a un metodo
    constructor(props) {
        super(props)
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this.animate = this.animate.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onClick = this.onClick.bind(this)
        this.agregarPared = this.agregarPared.bind(this)
  }

  componentDidMount() {
        //configuracion pantalla
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        //posicion de mouse en la pantalla
        var mouse = new THREE.Vector2();
        this.mouse = mouse;
        //arreglo de objetos visibles que podrían interactuar
        var objetos = [];
        var paredes = [];
        var ventanas = [];
        this.objetos = objetos;
        this.paredes = paredes;
        this.ventanas = ventanas;

        //Hay que cargar escena, camara, y renderer,
        //Escena
        const escena = new THREE.Scene();
        this.escena = escena;
        //Camara
        var camara = new THREE.PerspectiveCamera( 40, width / height, 1, 10000 );
    	camara.position.set( 5, 8, 13 );
    	camara.lookAt( new THREE.Vector3() );
        this.camara = camara;
        //Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor('#F0F0F0');
        renderer.setSize(width, height);
        this.renderer = renderer;
        //Controles para la camara
        const control = new OrbitControls( camara, renderer.domElement );
        control.enabled = true;
        control.maxDistance = 500;
        this.control = control;
        /*controls.minDistance = 10;*/

        //Plano se agrega a objetos //
        var planoGeometria = new THREE.PlaneBufferGeometry( 100, 100 );
		planoGeometria.rotateX( - Math.PI / 2 );
		var plano = new THREE.Mesh( planoGeometria, new THREE.MeshBasicMaterial( { visible: false } ) );
		escena.add( plano );
		objetos.push( plano );

        //Grid del plano
        var gridHelper = new THREE.GridHelper( 100, 100 );
        plano.add(gridHelper);

        //Indicador de la pared
        const geomeIndPared = new THREE.CylinderBufferGeometry(0.05, 0.05, 2, 32);
        const materialIndPared = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
        var indicadorPared = new THREE.Mesh(geomeIndPared, materialIndPared);
		escena.add( indicadorPared );
        this.indicadorPared = indicadorPared;

        //pared que dibuja nuevas paredes
        var geoParedFantasma = new THREE.BoxBufferGeometry(1,1,0.05);
        const materialParedFantasma = new THREE.MeshBasicMaterial({ color: '#433F81', opacity: 0.5, transparent: true });
        var paredFantasma = new THREE.Mesh( geoParedFantasma, materialParedFantasma );
        paredFantasma.visible = false;
        escena.add( paredFantasma );
        this.paredFantasma = paredFantasma;

        // Luces, es el sol, todavía no se si funcionan
        var sol = new THREE.DirectionalLight( 0xffffff,1 );
        sol.position.set( 50, 50, 50 );
        sol.lookAt( new THREE.Vector3() );
        escena.add( sol );
        this.sol = sol;

        //raycaster, usado para apuntar objetos
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 1;
        this.raycaster = raycaster


        var dibujando = false
        this.dibujando = dibujando
        //controles, ahora con teclas para probar

        this.mount.appendChild(this.renderer.domElement)
        this.start()
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
      if (this.dibujando) {
          this.dibujando = false;
          var endPosition = this.indicadorPared.position;
          var widthPared = endPosition.distanceTo( this.paredFantasma.position );
          //this.paredFantasma.width = widthPared;
          this.paredFantasma.scale.x = widthPared;
          //this.paredFantasma.rotateX( - Math.PI / 2 );
          //this.paredFantasma.position.copy(this.indicadorPared.position);
      }else {
          this.dibujando = true;
          this.paredFantasma.position.copy(this.indicadorPared.position);
          this.paredFantasma.visible = true;
          console.log(this.indicadorPared.position);
      }
  }

  onMouseMove(event) {
      event.preventDefault()
      var rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ( ( event.clientX - rect.left ) / ( rect.width ) ) * 2 - 1;
      this.mouse.y = - ( ( event.clientY - rect.top ) / ( rect.height - rect.top) ) * 2 + 1;
      this.raycaster.setFromCamera( this.mouse, this.camara );

      var intersects = this.raycaster.intersectObjects(this.objetos);

      if(intersects.length > 0){
          var intersect = intersects[0]
          this.indicadorPared.position.copy( intersect.point ).add( intersect.face.normal );
		  this.indicadorPared.position.floor()
      }
  }

  onClick(event) {
      event.preventDefault()
      this.agregarPared()

  }

 render() {
  return (
    <div
      onMouseMove={this.onMouseMove}
      onClick={this.onClick}
      style={{ width: '1080px', height: '800px' }}
      ref={(mount) => { this.mount = mount }}
    />
  )
 }
 }

 export default Scene
