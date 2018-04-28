import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';

class Scene extends Component {
  constructor(props) {
    super(props)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)
    this.myRef = React.createRef();
  }

  componentDidMount() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    //Hay que cargar camara, escena y renderer,

    //Escena
    const escena = new THREE.Scene()
    //Camara
    var camara = new THREE.PerspectiveCamera( 40, width / height, 1, 10000 );
	  camara.position.set( 5, 8, 13 );
	  camara.lookAt( new THREE.Vector3() );
    //Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    //Controles para la camara
    const controls = new OrbitControls( camara, renderer.domElement )
    controls.enabled = true;
    controls.maxDistance = 500;
    /*controls.minDistance = 10;*/

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: '#433F81' })
    const cube = new THREE.Mesh(geometry, material)
    //const pared = new Pared()

    var gridHelper = new THREE.GridHelper( 100, 20 );
    escena.add( cube )
	  escena.add( gridHelper );

    // Lights
    /*var ambientLight = new THREE.AmbientLight( 0x606060 );
    escena.add( ambientLight );*/
    var directionalLight = new THREE.DirectionalLight( 0xffffff,1 );
    directionalLight.position.set( 50, 50, 50 );
    escena.add( directionalLight );


    // We will use 2D canvas element to render our HUD.
    //this.getElementsByName('name')
    console.log(this.myRef)
    //var hudCanvas = this.myRef.createElement('canvas')
    //var hudCanvas = React.createElement('canvas')

    //var hudCanvas = ReactDOM.createElement('canvas')

    //var hudCanvas = this.createElement('canvas')
    //hudCanvas.width = width;
    //hudCanvas.height = height;

    // Get 2D context and draw something supercool.
    //var hudBitmap = hudCanvas.getContext('2d');
	//hudBitmap.font = "Normal 40px Arial";
    //hudBitmap.textAlign = 'center';
    //hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
    //hudBitmap.fillText('Initializing...', width / 2, height / 2);

    // Create the camara and set the viewport to match the screen dimensions.
    //var camaraHUD = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 30 );

    // Create also a custom escena for HUD.
    //escenaHUD = new THREE.Scene();
    // Create texture from rendered graphics.
	//var hudTexture = new THREE.Texture(hudCanvas)
	//hudTexture.needsUpdate = true;

    // Create HUD material.
    //var material_text = new THREE.MeshBasicMaterial( {map: hudTexture} );
    //material.transparent = true;

    // Create plane to render the HUD. This plane fill the whole screen.
    //var planeGeometry = new THREE.PlaneGeometry( width, height );
    //var plane = new THREE.Mesh( planeGeometry, material_text );
    //escenaHUD.add( plane );

    //escena.add(pared)
    renderer.setClearColor('#F0F0F0')
    renderer.setSize(width, height)

    this.escena = escena
    this.camara = camara
    this.renderer = renderer
    this.material = material
    this.cube = cube
    //this.control = control

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
    this.cube.rotation.y += 0.01
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene() {
    this.renderer.render(this.escena, this.camara)
  }



  render() {
    return (
      <div
        style={{ width: '1080px', height: '800px' }}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default Scene
