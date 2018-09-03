import * as THREE from 'three'
import * as BalanceEnergetico from "./BalanceEnergetico";

class ManagerCasas {
    constructor(escena, paredes, allObjects, aporteInterno, ocupantes, horasIluminacion, aireRenovado, perdidaPorVentilacion){
        this.escena = escena;
        this.paredes = paredes;
        this.allObjects = allObjects;

        this.ocupantes = ocupantes;
        this.horasIluminacion = horasIluminacion;
        this.aireRenovado = aireRenovado;
        this.gradoDias = 0;


        this.crearCasaVacia();

        //Materiales
        this.materialParedConstruccion = new THREE.MeshBasicMaterial({
            color: '#433F81',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });

        this.materialPisoConstruccion = new THREE.MeshBasicMaterial({
            color: '#392481',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });

        this.materialTechoConstruccion = new THREE.MeshBasicMaterial({
            color: '#3d8179',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });

        this.materialVentanaConstruccion = new THREE.MeshBasicMaterial({
            color: '#00ff00',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });

        this.materialParedConstruida = new THREE.MeshLambertMaterial({
            color: '#433F81',
            side : THREE.DoubleSide,

        });

        this.materialVentanaConstruida = new THREE.MeshLambertMaterial({
            color: '#00ff00',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });


        this.materialSeleccionado = new THREE.MeshLambertMaterial({
            color: '#FF0000',
            side : THREE.DoubleSide,

        });

        //habitacion que dibuja nuevas habitaciones
        this.habitacionConstruccion = this.crearHabitacion(0, 0, 0);
        this.habitacionConstruccion.visible = false;
        escena.add(this.habitacionConstruccion);


    }

    setGradosDias(gradoDias){
        this.gradoDias = gradoDias;
    }

    setStartHabitacion(start){
        this.habitacionConstruccion.userData.start = start;
        this.habitacionConstruccion.visible = true;
    }

    agregarHabitacionDibujada(){

        var habitacion = this.habitacionConstruccion.clone();

        //Se borra la habitacion de dibujo
        this.habitacionConstruccion = this.crearHabitacion(0, 0, 0);
        this.habitacionConstruccion.visible = false;

        let paredes = this.habitacionConstruccion.getObjectByName("Paredes");

        //Se agregan las paredes al arreglo de paredes y al de objetos
        for (let i = 0; i < paredes.children.length; i++){
            let pared = paredes.children[i];
            pared.material = this.materialParedConstruida.clone();
            pared.castShadow = true;
            pared.receiveShadow = false;
            pared.userData.tipo =  Morfologia.tipos.PARED;

            this.paredes.push(pared);
            this.allObjects.push(pared);
        }
        let piso = habitacion.getObjectByName("Piso");
        piso.userData.tipo = Morfologia.tipos.PISO;
        piso.userData.aislacion = Morfologia.aislacionPiso.CORRIENTE;

        let techo = habitacion.getObjectByName("Techo");
        techo.userData.tipo = Morfologia.tipos.TECHO;

        let aporteInterno = BalanceEnergetico.aporteInterno(this.ocupantes, piso.userData.superficie, this.horasIluminacion);
        let perdidaPorVentilacion = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen, this.aireRenovado, this.gradoDias);

        let nivel = this.casa.children[habitacion.userData.nivel - 1];
        nivel.add(habitacion);


        this.casa.userData.aporteInterno += aporteInterno;
        this.casa.userData.perdidaPorVentilacion += perdidaPorVentilacion;

        //TODO: determinar paredes externas
        //console.log(casa);
        //this.escena.add(casas);


    }

    crecerHabitacion(nextPosition){
        let start = this.habitacionConstruccion.userData.start.clone();
        let end = nextPosition.clone();

        var dir = end.clone().sub(start);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len * 0.5);
        let pos = start.clone().add(dir);

        this.habitacionConstruccion.position.copy(pos);
        this.habitacionConstruccion.position.y = 0;
        this.habitacionConstruccion.userData.end = end.clone();

        //modificar geometrias paredes, piso y techo
        let paredes = this.habitacionConstruccion.getObjectByName("Paredes");

        let width = Math.abs(start.x - end.x), depth = Math.abs(start.z - end.z);
        let widths = [ width, depth, width, depth ];
        let height = this.habitacionConstruccion.userData.height;

        for (let i = 0; i < paredes.children.length; i++){
            let pared = paredes.children[i];

            pared.geometry = this.crearGeometriaPared(widths[i], height);
            switch (i) {
                case 0:
                    pared.position.z = - depth/2;
                    break;
                case 1:
                    pared.position.x = - width/2;
                    break;
                case 2:
                    pared.position.z =  + depth/2;
                    break;
                case 3:
                    pared.position.x = + width/2;
                    break;
            }
        }

        let piso = this.habitacionConstruccion.getObjectByName("Piso");
        piso.geometry = this.crearGeometriaPiso(width, depth);

        let techo = this.habitacionConstruccion.getObjectByName("Techo");
        techo.geometry = this.crearGeometriaTecho(width, depth, height);

    }

    crearCasaVacia() {
        var casa = new THREE.Group();

        var nivel = new THREE.Group();

        casa.add(nivel);

        this.escena.add(casa);

        this.casa = casa;
    }

    crearHabitacion(width, height, depth, nivel){
        var habitacion = new THREE.Group();

        nivel.position.y = (nivel - 1) * height;

        var paredes = new THREE.Group();
        paredes.name = "Paredes";

        var halfWidth = width / 2;

        var pared1 = this.crearMeshPared(width, height);
        pared1.position.z = pared1.position.z + halfWidth;
        pared1.userData.orientacion = new THREE.Vector3(0,0,1);

        var pared2 = this.crearMeshPared(width, height);
        pared2.rotation.y = Math.PI / 2;
        pared2.position.x = pared2.position.x + halfWidth;
        pared2.userData.orientacion = new THREE.Vector3(1,0,0);

        var pared3 = this.crearMeshPared(width, height);
        pared3.rotation.y = Math.PI;
        pared3.position.z = pared3.position.z - halfWidth;
        pared3.userData.orientacion = new THREE.Vector3(0,0,-1);

        var pared4 = this.crearMeshPared(width, height);
        pared4.rotation.y = -Math.PI / 2;
        pared4.position.x = pared4.position.x - halfWidth;
        pared4.userData.orientacion = new THREE.Vector3(-1,0,0);

        var piso = this.crearMeshPiso(width, depth);
        piso.name = "Piso";

        var techo = this.crearMeshTecho(width, depth, height);
        techo.name = "Techo";
        paredes.add(pared1);
        paredes.add(pared2);
        paredes.add(pared3);
        paredes.add(pared4);

        piso.userData.superficie = width * depth;

        habitacion.add(paredes);
        habitacion.add(piso);
        habitacion.add(techo);

        habitacion.userData.volumen = width * height * depth;
        habitacion.userData.height = height;
        habitacion.userData.nivel = nivel;

        return habitacion;

    }

    crearGeometriaPared(width, height) {
        let geometria = new THREE.Geometry();

        let x1 = width / -2, x2 = width / 2, y1 = 0, y2 = height;

        geometria.vertices.push(new THREE.Vector3(x1, y1, 0));
        geometria.vertices.push(new THREE.Vector3(x1, y2, 0));
        geometria.vertices.push(new THREE.Vector3(x2, y1, 0));
        geometria.vertices.push(new THREE.Vector3(x2, y2, 0));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        geometria.computeFaceNormals();
        geometria.computeVertexNormals();

        return geometria;
    }

    crearGeometriaPiso(width, depth){
        let geometria = new THREE.Geometry();
        let offset = 0.01;
        let x1 = width / -2, x2 = width / 2, y = offset, z1 = depth / -2, z2 = depth / 2;

        geometria.vertices.push(new THREE.Vector3(x1, y, z1));
        geometria.vertices.push(new THREE.Vector3(x1, y, z2));
        geometria.vertices.push(new THREE.Vector3(x2, y, z1));
        geometria.vertices.push(new THREE.Vector3(x2, y, z2));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        return geometria;
    }

    crearGeometriaTecho(width, depth, heigth){
        let geometria = new THREE.Geometry();

        let x1 = width / -2, x2 = width / 2, y = heigth, z1 = depth / -2, z2 = depth / 2;

        geometria.vertices.push(new THREE.Vector3(x1, y, z1));
        geometria.vertices.push(new THREE.Vector3(x1, y, z2));
        geometria.vertices.push(new THREE.Vector3(x2, y, z1));
        geometria.vertices.push(new THREE.Vector3(x2, y, z2));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        return geometria;
    }

    crearMeshPared(width, height) {
        let geometria = this.crearGeometriaPared(width, height);

        return new THREE.Mesh(geometria, this.materialParedConstruccion.clone());
    }

    crearMeshPiso(width, depth) {
        //piso representa el numero de piso donde se encuentra el piso
        let geometria = this.crearGeometriaPiso(width, depth);

        return new THREE.Mesh(geometria, this.materialPisoConstruccion);
    }

    crearMeshTecho(width, depth, heigth) {
        let geometria = this.crearGeometriaTecho(width, depth, heigth);

        return new THREE.Mesh(geometria, this.materialTechoConstruccion);
    }

}
export default ManagerCasas