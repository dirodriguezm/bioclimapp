import * as THREE from 'three'
import * as BalanceEnergetico from "./BalanceEnergetico";
import axios from "axios";
import Morfologia from "../components/Morfologia";

class ManagerCasas {
    constructor(escena, paredes, allObjects, ocupantes, horasIluminacion, aireRenovado){
        this.escena = escena;
        this.paredes = paredes;
        this.allObjects = allObjects;

        this.ocupantes = ocupantes;
        this.horasIluminacion = horasIluminacion;
        this.aireRenovado = aireRenovado;
        this.gradoDias = 0;

        this.info_ventana = [];
        this.info_material = [];

        axios.get("http://127.0.0.1:8000/api/info_materiales")
            .then(response => this.getJsonMateriales(response));

        axios.get("http://127.0.0.1:8000/api/info_ventanas")
            .then(response => this.getJsonVentanas(response));

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
        this.habitacionConstruccion = this.crearHabitacion(0, 1, 0, 1).clone();
        this.habitacionConstruccion.visible = false;
        escena.add(this.habitacionConstruccion);


    }

    getJsonMateriales(response) {
        this.info_material = response.data.slice();
        for (let i = 0; i < this.info_material.length; i++) {
            this.info_material[i].index = i;
            if (this.info_material[i].hasOwnProperty('tipos')) {
                for (let j = 0; j < this.info_material[i].tipos.length; j++) {
                    this.info_material[i].tipos[j].index = j;
                }
            } else {
                for (let k = 0; k < this.info_material[i].propiedades.length; k++) {
                    this.info_material[i].propiedades[k].index = k;
                }
            }
        }
    }

    getJsonVentanas(response) {
        this.info_ventana = response.data.slice();
        for(let i = 0; i < this.info_ventana.length; i++){
            this.info_ventana[i].index = i;
            for(let j = 0; j < this.info_ventana[i].tipos.length ; j++){
                this.info_ventana[i].tipos[j].index = j;
                //PARA cuando las ventanas tengan mas propiedades
                /*for (let k = 0; k < this.info_material[i].tipos[j].propiedad.length; k++) {
                    this.info_material[i].tipos[j].propiedad[k].index = k;
                }*/
            }
        }
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
        let transmitanciaSuperficies = 0;

        let paredes = habitacion.getObjectByName("Paredes");

        //Se agregan las paredes al arreglo de paredes y al de objetos

        for (let i = 0; i < paredes.children.length; i++){
            let pared = paredes.children[i];
            pared.material = this.materialParedConstruida.clone();
            pared.castShadow = true;
            pared.receiveShadow = false;
            pared.userData.superficie = pared.userData.width * pared.userData.height;

            //TODO: DETERMINAR CUALES SON EXTERIORES, TANTO PARA PAREDES COMO PARA PISO TECHO VENTANA Y PUERTAS.
            pared.userData.separacion = Morfologia.separacion.EXTERIOR;

            pared.userData.tipo =  Morfologia.tipos.PARED;
            pared.userData.capas =
                [
                    {
                        material : 1,
                        tipo : null,
                        propiedad : 0,
                        conductividad : this.info_material[1].propiedades[0].conductividad,
                        espesor : 0.1
                    },
                    {
                        material : 3,
                        tipo : null,
                        propiedad : 0,
                        conductividad : this.info_material[3].propiedades[0].conductividad,
                        espesor : 0.2
                    }
                ];
            BalanceEnergetico.transmitanciaSuperficie(pared);



            transmitanciaSuperficies += pared.userData.transSup;

            this.paredes.push(pared);
            this.allObjects.push(pared);
        }
        let piso = habitacion.getObjectByName("Piso");
        piso.userData.tipo = Morfologia.tipos.PISO;
        piso.userData.aislacion = Morfologia.aislacionPiso.CORRIENTE;
        piso.userData.superficie = piso.userData.width * piso.userData.depth;
        piso.userData.perimetro = piso.userData.width * 2 + piso.userData.depth * 2;
        piso.userData.puenteTermico = BalanceEnergetico.puenteTermico(piso);

        let puenteTermico = piso.userData.puenteTermico;

        let techo = habitacion.getObjectByName("Techo");
        techo.userData.tipo = Morfologia.tipos.TECHO;
        techo.userData.superficie = techo.userData.width * techo.userData.depth;
        techo.userData.separacion = Morfologia.separacion.EXTERIOR;
        techo.userData.capas =
            [
                {
                    material : 2,
                    tipo : null,
                    propiedad : 0,
                    conductividad : this.info_material[2].propiedades[0].conductividad,
                    espesor : 0.1
                },
                {
                    material : 11,
                    tipo : 2,
                    propiedad : 0,
                    conductividad : this.info_material[11].tipos[2].propiedad.conductividad,
                    espesor : 0.2
                }
            ];
        BalanceEnergetico.transmitanciaSuperficie(techo);
        transmitanciaSuperficies += techo.userData.transSup;

        let aporteInterno = BalanceEnergetico.aporteInterno(this.ocupantes, piso.userData.superficie, this.horasIluminacion);

        let perdidaPorVentilacion = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen, this.aireRenovado, this.gradoDias);
        let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, puenteTermico);

        habitacion.userData.puenteTermico = puenteTermico;
        habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
        habitacion.userData.aporteIntero = aporteInterno;
        habitacion.userData.perdidaPorVentilacion = perdidaPorVentilacion;
        habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;

        let nivel = this.casa.children[habitacion.userData.nivel - 1];
        nivel.add(habitacion);

        this.casa.userData.aporteInterno += aporteInterno;
        this.casa.userData.perdidaPorVentilacion += perdidaPorVentilacion;
        this.casa.userData.perdidaPorConduccion += perdidaPorConduccion;

        //Se borra la habitacion de dibujo
        this.habitacionConstruccion.visible = false;

    }

    modificarParedHabitacion(pared, width, height){
        let oldWidth = pared.userData.width;
        let oldHeight = pared.userData.height;

        let habitacion = pared.parent.parent;

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;

        if(oldHeight !== height){
            habitacion.userData.height = height;
            habitacion.userData.volumen = habitacion.userData.height * habitacion.userData.width * habitacion.userData.depth;

            let paredes = habitacion.getObjectByName("Paredes");

            for (let i = 0; i < paredes.children.length; i++){
                let pared = paredes.children[i];
                let paredWidth = pared.userData.width;
                pared.geometry = this.crearGeometriaPared(paredWidth, height);
                pared.userData.height = height;
                pared.userData.superficie = paredWidth * height;

                transmitanciaSuperficies -= pared.userData.transSup;
                BalanceEnergetico.transmitanciaSuperficie(pared);
                transmitanciaSuperficies += pared.userData.transSup;
            }

            let techo = habitacion.getObjectByName("Techo");
            techo.geometry = this.crearGeometriaTecho(width,habitacion.userData.depth, height );

            let perdidaPorVentilacion = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen, this.aireRenovado, this.gradoDias);
            let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, habitacion.userData.puenteTermico);

            this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
            this.casa.userData.perdidaPorVentilacion -= habitacion.userData.perdidaPorVentilacion;
            this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;

            habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
            habitacion.userData.perdidaPorVentilacion = perdidaPorVentilacion;
            habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;

            this.casa.userData.transmitanciaSuperficies += transmitanciaSuperficies;
            this.casa.userData.perdidaPorVentilacion += perdidaPorVentilacion;
            this.casa.userData.perdidaPorConduccion += perdidaPorConduccion;
        }
        if(oldWidth !== width){
            let paredes = habitacion.getObjectByName("Paredes");
            console.log(pared);
            let orientacion = new THREE.Vector3(
                pared.userData.orientacion.x,
                pared.userData.orientacion.y,
                pared.userData.orientacion.z
            );
            let index = paredes.children.indexOf(pared);
            for (let i = 0; i < paredes.children.length; i++) {
                let pared = paredes.children[i];
                if(index === i){
                    pared.geometry = this.crearGeometriaPared(width, height);
                }else{
                    let auxOrientacion = orientacion.clone();
                    auxOrientacion.add(pared.userData.orientacion);
                    if(auxOrientacion.x === 0 && auxOrientacion.y === 0 && auxOrientacion.z === 0){
                        pared.geometry = this.crearGeometriaPared(width, height);
                    }
                }
            }
        }
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
            pared.userData.width = widths[i];
            pared.userData.height = height;
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
        piso.userData.width = width;
        piso.userData.depth = depth;

        let techo = this.habitacionConstruccion.getObjectByName("Techo");
        techo.geometry = this.crearGeometriaTecho(width, depth, height);
        techo.userData.width = width;
        techo.userData.depth = depth;

        this.habitacionConstruccion.userData.volumen = width * height * depth;
        this.habitacionConstruccion.userData.height = height;
        this.habitacionConstruccion.userData.width = width;
        this.habitacionConstruccion.userData.depth = depth;
    }

    crearCasaVacia() {
        var casa = new THREE.Group();

        var nivel = new THREE.Group();

        casa.add(nivel);

        this.escena.add(casa);

        casa.userData.aporteInterno = 0;
        casa.userData.perdidaPorVentilacion = 0;
        casa.userData.perdidaPorConduccion = 0;

        this.casa = casa;
    }

    crearHabitacion(width, height, depth, nivel){
        var habitacion = new THREE.Group();

        habitacion.position.y = (nivel - 1) * height;

        var paredes = new THREE.Group();
        paredes.name = "Paredes";

        var halfWidth = width / 2;

        var pared1 = this.crearMeshPared(width, height);
        pared1.position.z = pared1.position.z + halfWidth;
        pared1.userData.orientacion = new THREE.Vector3(0,0,-1);
        pared1.userData.width = width;
        pared1.userData.height = height;

        var pared2 = this.crearMeshPared(width, height);
        pared2.rotation.y = Math.PI / 2;
        pared2.position.x = pared2.position.x + halfWidth;
        pared2.userData.orientacion = new THREE.Vector3(-1,0,0);
        pared2.userData.width = width;
        pared2.userData.height = height;

        var pared3 = this.crearMeshPared(width, height);
        pared3.rotation.y = Math.PI;
        pared3.position.z = pared3.position.z - halfWidth;
        pared3.userData.orientacion = new THREE.Vector3(0,0,1);
        pared3.userData.width = width;
        pared3.userData.height = height;

        var pared4 = this.crearMeshPared(width, height);
        pared4.rotation.y = -Math.PI / 2;
        pared4.position.x = pared4.position.x - halfWidth;
        pared4.userData.orientacion = new THREE.Vector3(1,0,0);
        pared4.userData.width = width;
        pared4.userData.height = height;

        var piso = this.crearMeshPiso(width, depth);
        piso.name = "Piso";
        piso.userData.width = width;
        piso.userData.depth = depth;

        var techo = this.crearMeshTecho(width, depth, height);
        techo.userData.width = width;
        techo.userData.depth = depth;
        techo.userData.height = height;

        techo.name = "Techo";
        paredes.add(pared1);
        paredes.add(pared2);
        paredes.add(pared3);
        paredes.add(pared4);

        habitacion.add(paredes);
        habitacion.add(piso);
        habitacion.add(techo);

        habitacion.userData.volumen = width * height * depth;
        habitacion.userData.height = height;
        habitacion.userData.width = width;
        habitacion.userData.depth = depth;

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

    getCasa(){
        return this.casa;
    }

}
export default ManagerCasas