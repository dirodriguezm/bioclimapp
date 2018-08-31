import * as THREE from 'three'

class ManagerCasas {
    constructor(escena){
        this.escena = escena;
        this.casa = null;
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

        this.casa = casa;

        return casa;

    }

}
export default ManagerCasas