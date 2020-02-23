import * as THREE from 'three'
import * as BalanceEnergetico from "./BalanceEnergetico";
import axios from "axios";
import Morfologia from "../components/Morfologia";

class ManagerCasas {
    constructor(escena, paredes, ventanas, puertas, pisos, allObjects, ocupantes, horasIluminacion, aireRenovado, heightWall) {
        this.escena = escena;
        this.paredes = paredes;
        this.paredesX = [];
        this.paredesZ = [];
        this.ventanas = ventanas;
        this.puertas = puertas;
        this.pisos = pisos;
        this.allObjects = allObjects;
        this.angleRotated = 0;

        this.ocupantes = ocupantes;
        this.horasIluminacion = horasIluminacion;
        this.aireRenovado = aireRenovado;
        this.aireRenovadoObjetivo = 7;
        this.gradoDias = 0;
        this.periodo = [];


        this.heightWall = heightWall;
        this.widthPredefinida = 5;
        this.depthPredefinida = 8;

        this.info_ventana = [];
        this.info_material = [];
        this.info_marcos = [];

        axios.get("http://bioclimatic.inf.udec.cl/api/info_materiales")
            .then(response => this.getJsonMateriales(response))

        axios.get("http://bioclimatic.inf.udec.cl/api/info_ventanas")
            .then(response => this.getJsonVentanas(response))

        axios.get("http://bioclimatic.inf.udec.cl/api/info_marcos")
            .then(response => this.getJsonMarcos(response))

        this.crearCasaVacia();

        //Materiales
        this.materialParedConstruccion = new THREE.MeshBasicMaterial({
            color: '#eaedc7',
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialPisoConstruccion = new THREE.MeshBasicMaterial({
            color: '#a1d1ee',
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialTechoConstruido = new THREE.MeshBasicMaterial({
            color: '#3d8179',
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialVentanaConstruccion = new THREE.MeshBasicMaterial({
            color: '#33ebed',
            opacity: 0.4,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialPuertaConstruccion = new THREE.MeshBasicMaterial({
            color: '#4b2400',
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialParedConstruida = new THREE.MeshLambertMaterial({
            color: '#eaedc7',
            side: THREE.DoubleSide,
        });

        this.materialVentanaConstruida = new THREE.MeshLambertMaterial({
            color: '#33ebed',
            side: THREE.DoubleSide,
        });

        this.materialPuertaConstruida = new THREE.MeshLambertMaterial({
            color: '#6b3403',
            side: THREE.DoubleSide,
        });

        this.materialPisoConstruido = new THREE.MeshLambertMaterial({
            color: '#a1d1ee',
            side: THREE.DoubleSide,
        });

        this.materialTechoConstruccion = new THREE.MeshLambertMaterial({
            color: '#B3B3B3',
            side: THREE.DoubleSide,
            opacity: 0.7,
            transparent: true,
        });

        this.materialError = new THREE.MeshBasicMaterial({
            color: '#FF0000',
            opacity: 0.4,
            transparent: true,
            side: THREE.DoubleSide,
        });


        this.materialSeleccionado = new THREE.MeshLambertMaterial({
            color: '#FF0000',

            side: THREE.DoubleSide,

        });

        //habitacion que dibuja nuevas habitaciones
        this.habitacionConstruccion = this.crearHabitacion(0, heightWall, 0, 1);
        this.habitacionConstruccion.visible = false;
        //Ventana que dibuja nuevas ventanas
        this.ventanaConstruccion = this.crearMeshVentana(0.9, 0.6);
        this.ventanaConstruccion.visible = false;
        this.ventanaConstruccion.error = false;
        //Puerta que dibuja nuevas puertas
        this.puertaConstruccion = this.crearMeshPuerta(0.6, 1.8);
        this.puertaConstruccion.visible = false;
        this.puertaConstruccion.error = false;
        //Techo que se dibuja arriba de las habitaciones
        this.techoConstruccion = this.crearMeshTecho(0,0,0);
        this.techoConstruccion.visible = false;
        this.techoConstruccion.error = false;

        escena.add(this.habitacionConstruccion);
        escena.add(this.ventanaConstruccion);
        escena.add(this.puertaConstruccion);
        escena.add(this.techoConstruccion);

        //raycaster
        var ray = new THREE.Raycaster();
        ray.linePrecision = 1;
        this.ray = ray;

        //arrows
        this.arrows = [];
    }

    getJsonMarcos(response) {
        this.info_marcos = response.data.slice();
        for (let i = 0; i < this.info_marcos.length; i++) {
            this.info_marcos[i].index = i;
            if (this.info_marcos[i].hasOwnProperty('tipos')) {
                for (let j = 0; j < this.info_marcos[i].tipos.length; j++) {
                    this.info_marcos[i].tipos[j].index = j;
                }
            } else {
                for (let k = 0; k < this.info_marcos[i].propiedades.length; k++) {
                    this.info_marcos[i].propiedades[k].index = k;
                }
            }
        }
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
        for (let i = 0; i < this.info_ventana.length; i++) {
            this.info_ventana[i].index = i;
            for (let j = 0; j < this.info_ventana[i].tipos.length; j++) {
                this.info_ventana[i].tipos[j].index = j;
                //PARA cuando las ventanas tengan mas propiedades
                /*for (let k = 0; k < this.info_material[i].tipos[j].propiedad.length; k++) {
                    this.info_material[i].tipos[j].propiedad[k].index = k;
                }*/
            }
        }
    }

    setZona(zona){
        this.zona = zona;
        //console.log("seteando zona",this.zona,zona);
    }

    setPersonas(personas){
        this.ocupantes = personas;
        for(let nivel of this.casa.children){
            for(let habitacion of nivel.children){
                this.recalcularBalancePorVolumen(habitacion);
            }
        }
    }
    setIluminacion(iluminacion){
        this.horasIluminacion = iluminacion;
        //let aporteInternoTotal = 0;
        for(let nivel of this.casa.children){
            for(let habitacion of nivel.children){
                this.recalcularBalancePorVolumen(habitacion);
            }
        }
        //this.casa.userData.aporteInterno = aporteInternoTotal;
    }
    setAire(aire){
        this.aireRenovado = aire;
        //let perdidaVentilacionTotal = 0;
        for(let nivel of this.casa.children){
            for(let habitacion of nivel.children){
                this.recalcularBalancePorVolumen(habitacion);
            }
        }
        //this.casa.userData.perdidaVentilacion = perdidaVentilacionTotal;
    }

    setGradosDias(gradoDias, periodo) {
        this.gradoDias = gradoDias;
        this.periodo = periodo;
        this.casa.userData.periodo = periodo;
        //let perdidaVentilacionTotal = 0;
        //let perdidaPorConduccionTotal = 0;
        for(let nivel of this.casa.children){
            for(let habitacion of nivel.children){
                this.recalcularBalancePorVolumen(habitacion);
                let piso = habitacion.getObjectByName('Piso');
                let paredes = habitacion.getObjectByName('Paredes');
                let techo = habitacion.getObjectByName('Techo');

                for(let pared of paredes.children){
                    this.actualizarTransmitanciaSuperficie(pared);
                    for(let estructura of pared.children){
                        this.actualizarTransmitanciaSuperficie(estructura);
                    }
                }
                this.actualizarTransmitanciaSuperficie(piso);
                if(techo) this.actualizarTransmitanciaSuperficie(techo);
            }
        }
        //this.casa.userData.perdidaVentilacion = perdidaVentilacionTotal;
        //this.casa.userData.perdidaPorConduccion = perdidaPorConduccionTotal;
    }

    setAngleRotated(angle){
        this.angleRotated = angle;
    }

    setStartHabitacion(start, raycaster) {
        this.habitacionConstruccion.userData.start = start.clone();
        this.habitacionConstruccion.userData.start.y = 0;
        this.habitacionConstruccion.visible = true;
    }

    setErrorConstruccion(error) {
        let paredes = this.habitacionConstruccion.getObjectByName("Paredes");
        let piso = this.habitacionConstruccion.getObjectByName("Piso");
        let techo = this.habitacionConstruccion.getObjectByName("Techo");
        for (let i = 0; i < paredes.children.length; i++) {
            let pared = paredes.children[i];
            if (error) {
                pared.material = this.materialError.clone();
            } else {
                pared.material = this.materialParedConstruccion.clone();
            }
        }
        if (error) {
            piso.material = this.materialError.clone();
            if(techo){
                techo.material = this.materialError.clone();
            }
        } else {
            piso.material = this.materialPisoConstruccion.clone();
            if(techo){
                techo.material = this.materialTechoConstruccion.clone();
            }
        }
        this.habitacionConstruccion.userData.error = error;


    }

    capasChanged(estructura) {
        this.actualizarTransmitanciaSuperficie(estructura);
        if(estructura.userData.tipo === Morfologia.tipos.PISO){
            this.actualizarTransmitanciaSuperficie(estructura.userData.techo);
        }
    }

    //para cuando se quita una estructura a una habitacion, se asume que no será piso por que si es piso o pared ya que
    //en esos casos se borra la habitacion.
    quitarTransmitanciaSuperficie(estructura, habitacion){

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;
        let transmitanciaSuperficiesObjetivo = habitacion.userData.transmitanciaSuperficiesObjetivo;

        transmitanciaSuperficies -= estructura.userData.transSup;
        transmitanciaSuperficiesObjetivo -= estructura.userData.transSupObjetivo;

        let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
            transmitanciaSuperficies,
            this.gradoDias,
            habitacion.userData.puenteTermico
        );
        let perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(
            transmitanciaSuperficiesObjetivo,
            this.gradoDias,
            habitacion.userData.puenteTermicoObjetivo
        );

        this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
        this.casa.userData.transmitanciaSuperficiesObjetivo -= habitacion.userData.transmitanciaSuperficiesObjetivo;
        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;

        habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
        habitacion.userData.transmitanciaSuperficiesObjetivo = transmitanciaSuperficiesObjetivo;
        habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;
        habitacion.userData.perdidaPorConduccionObjetivo = perdidaPorConduccionObjetivo;

        this.casa.userData.transmitanciaSuperficies += transmitanciaSuperficies;
        this.casa.userData.transmitanciaSuperficiesObjetivo += transmitanciaSuperficiesObjetivo;
        this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo += habitacion.userData.perdidaPorConduccionObjetivo;

    }

    //para cuando se agrega una estructura a una habitacion, aqui si se afecta al objetivo
    agregarTransmitanciaSuperficie(estructura){
        let habitacion;
        if(estructura.userData.tipo === Morfologia.tipos.PISO || estructura.userData.tipo === Morfologia.tipos.TECHO){
            habitacion = estructura.parent;
        }else if(estructura.userData.tipo === Morfologia.tipos.VENTANA || estructura.userData.tipo === Morfologia.tipos.PUERTA){
            habitacion = estructura.parent.parent.parent;
        }else{
            habitacion = estructura.parent.parent;
        }

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;
        let transmitanciaSuperficiesObjetivo = habitacion.userData.transmitanciaSuperficiesObjetivo;

        BalanceEnergetico.transmitanciaSuperficie(estructura,this.zona);

        transmitanciaSuperficies += estructura.userData.transSup;
        transmitanciaSuperficiesObjetivo += estructura.userData.transSupObjetivo;

        if(estructura.userData.tipo === Morfologia.tipos.PISO){
            BalanceEnergetico.puenteTermico(estructura);
            habitacion.userData.puenteTermico = estructura.userData.puenteTermico;
            habitacion.userData.puenteTermicoObjetivo = estructura.userData.puenteTermicoObjetivo;
        }
        let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
            transmitanciaSuperficies,
            this.gradoDias,
            habitacion.userData.puenteTermico
        );
        let perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(
            transmitanciaSuperficiesObjetivo,
            this.gradoDias,
            habitacion.userData.puenteTermicoObjetivo
        );

        this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
        this.casa.userData.transmitanciaSuperficiesObjetivo -= habitacion.userData.transmitanciaSuperficiesObjetivo;
        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;

        habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
        habitacion.userData.transmitanciaSuperficiesObjetivo = transmitanciaSuperficiesObjetivo;
        habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;
        habitacion.userData.perdidaPorConduccionObjetivo = perdidaPorConduccionObjetivo;

        this.casa.userData.transmitanciaSuperficies += transmitanciaSuperficies;
        this.casa.userData.transmitanciaSuperficiesObjetivo += transmitanciaSuperficiesObjetivo;
        this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo += habitacion.userData.perdidaPorConduccionObjetivo;
    }


    //Para cuando cambia algo de una estructura, como las capas, espesor, material. no se necesita recalcular el objetivo.
    actualizarTransmitanciaSuperficie(estructura){
        let habitacion;
        if(estructura.userData.tipo === Morfologia.tipos.PISO || estructura.userData.tipo === Morfologia.tipos.TECHO){
            habitacion = estructura.parent;
        }else if(estructura.userData.tipo === Morfologia.tipos.VENTANA || estructura.userData.tipo === Morfologia.tipos.PUERTA){
            habitacion = estructura.parent.parent.parent;
        }else{
            habitacion = estructura.parent.parent;
        }

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;


        transmitanciaSuperficies -= estructura.userData.transSup;
        BalanceEnergetico.transmitanciaSuperficie(estructura,this.zona);
        transmitanciaSuperficies += estructura.userData.transSup;
        if(estructura.userData.tipo === Morfologia.tipos.PISO){
            BalanceEnergetico.puenteTermico(estructura);
            habitacion.userData.puenteTermico = estructura.userData.puenteTermico;
        }
        let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, habitacion.userData.puenteTermico);


        this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;

        habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
        habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;

        this.casa.userData.transmitanciaSuperficies += transmitanciaSuperficies;
        this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;

        //console.log("estructura "+Morfologia.tipos_texto[estructura.userData.tipo],estructura.userData.transSup);
    }

    casasChocan(habitacion) {
        let start = new THREE.Vector3(
            habitacion.userData.start.x,
            0,
            habitacion.userData.start.z);
        let end = new THREE.Vector3(
            habitacion.userData.end.x,
            0,
            habitacion.userData.end.z);

        var dirX = new THREE.Vector3(0,0,1).normalize();
        var dirZ = new THREE.Vector3(1,0,0).normalize();
        let origin = new THREE.Vector3(0, habitacion.userData.height * (habitacion.userData.nivel-1)+0.5,0);

        var lenX = Math.abs(start.x - end.x);
        var lenZ = Math.abs(start.z - end.z);
        let x = Math.min(start.x, end.x);
        let z = Math.min(start.z, end.z);

        for(let arrow of this.arrows){
            this.escena.remove(arrow);
        }

        let paredes = habitacion.getObjectByName("Paredes");
        for(let pared of paredes.children){
            pared.userData.choques = {};
        }

        this.ray.far = lenZ + 0.2;
        origin.z = z - 0.1;
        for(let i = x+0.5; i <= x+lenX; i++){
            origin.x = i;
            this.ray.set(origin, dirX);
            var intersects = this.ray.intersectObjects(this.paredesX);
            if (intersects.length > 0) {
                for(let pared of intersects){
                    if(paredes.children.includes(pared.object)){
                        continue;
                    }
                    let distance = pared.distance;
                    distance = Math.round(distance);
                    if(distance > 0  &&  distance < lenZ){
                        return true;
                    }else{
                        let paredes = habitacion.getObjectByName("Paredes");
                        if(distance === 0){
                            let paredNueva = paredes.children[0];
                            if(paredNueva){
                                if(paredNueva.userData.choques[pared.object.id] === undefined){
                                    paredNueva.userData.choques[pared.object.id] = [i];
                                }else{
                                    paredNueva.userData.choques[pared.object.id].push(i);

                                }
                            }

                        }else{
                            let paredNueva = paredes.children[2];
                            if(paredNueva){
                                if(paredNueva.userData.choques[pared.object.id] === undefined){
                                    paredNueva.userData.choques[pared.object.id] = [i];
                                }else{
                                    if(paredNueva.userData.choques[pared.object.id].indexOf(i) === -1){
                                        paredNueva.userData.choques[pared.object.id].push(i);
                                    }
                                }
                            }

                        }
                    }
                }

            }
        }

        this.ray.far = lenX + 0.2;
        origin.x = x - 0.1;
        for(let i = z+0.5; i <= z+lenZ; i++){
            origin.z = i;
            this.ray.set(origin, dirZ);
            var intersects = this.ray.intersectObjects(this.paredesZ);
            if (intersects.length > 0) {
                for(let pared of intersects){
                    if(paredes.children.includes(pared.object)){
                        continue;
                    }
                    let distance = pared.distance;
                    distance = Math.round(distance);
                    if(distance > 0  &&  distance < lenX){
                        return true;
                    }else{
                        let paredes = habitacion.getObjectByName("Paredes");
                        if(distance === 0){
                            let paredNueva = paredes.children[1];
                            if(paredNueva){
                                if(paredNueva.userData.choques[pared.object.id] === undefined){
                                    paredNueva.userData.choques[pared.object.id] = [i];
                                }else{
                                    if(paredNueva.userData.choques[pared.object.id].indexOf(i) === -1){
                                        paredNueva.userData.choques[pared.object.id].push(i);
                                    }
                                }
                            }

                        }else{
                            let paredNueva = paredes.children[3];
                            if(paredNueva){
                                if(paredNueva.userData.choques[pared.object.id] === undefined){
                                    paredNueva.userData.choques[pared.object.id] = [i];
                                }else{
                                    if(paredNueva.userData.choques[pared.object.id].indexOf(i) === -1){
                                        paredNueva.userData.choques[pared.object.id].push(i);
                                    }
                                }
                            }

                        }
                    }
                }

            }
        }

        return false;

    }

    separarParedes(paredNueva, paredExistente, desde, hasta, orientacion){
        let widthChoque = Math.abs(hasta - desde);
        //hay cuatro casos de chque, que sea completo en ambas paredes, que la nueva sea mas grande, que la existente sea
        //mas grande o que ambas sean mas grandes que el choque
        if(widthChoque === paredNueva.userData.width && widthChoque === paredExistente.userData.width){
            paredNueva.parent.remove(paredNueva);
            paredExistente.userData.separacion = Morfologia.separacion.INTERIOR;
        }else if(widthChoque === paredNueva.userData.width){
            paredNueva.userData.separacion = Morfologia.separacion.INTERIOR;
            if(paredExistente.userData.point[1] > hasta){
                paredExistente.userData.width = paredExistente.userData.width - widthChoque;
                paredExistente.userData.superficie = paredExistente.userData.width * paredExistente.userData.height;
                paredExistente.geometry.dispose();
                paredExistente.geometry.dynamic = true;
                paredExistente.geometry = this.crearGeometriaPared(widthChoque, paredExistente.height);
                if(orientacion.z !== 0){
                    paredExistente.position.x = paredExistente.position.x + widthChoque;
                }else{
                    paredExistente.position.z = paredExistente.position.z + widthChoque;
                }
                paredExistente.userData.point[0] = paredNueva.userData.point[1];
            }else if(paredExistente.userData.point[0] < desde){
                paredExistente.userData.width = paredExistente.userData.width - widthChoque;
                paredExistente.userData.superficie = paredExistente.userData.width * paredExistente.userData.height;
                paredExistente.geometry.dispose();
                paredExistente.geometry.dynamic = true;
                paredExistente.geometry = this.crearGeometriaPared(widthChoque, paredExistente.height);
                paredExistente.userData.point[1] = paredNueva.userData.point[0];

            }else{
                let widthExistente = Math.abs(paredNueva.userData.point[0]- paredExistente.userData.point[0]);
                let widthExistenteNueva = Math.abs(paredExistente.userData.point[1] - paredNueva.userData.point[1]);
                paredExistente.userData.width =  widthExistente;
                paredExistente.userData.superficie = paredExistente.userData.width * paredExistente.userData.height;
                paredExistente.geometry.dispose();
                paredExistente.geometry.dynamic = true;
                paredExistente.geometry = this.crearGeometriaPared(widthExistente, paredExistente.height);
                paredExistente.userData.point[1] = paredNueva.userData.point[0];

                let paredExistenteNueva = paredExistente.clone();
                paredExistente.parent.add(paredExistenteNueva);

                paredExistenteNueva.userData.width =  widthExistenteNueva;
                paredExistenteNueva.userData.superficie = paredExistenteNueva.userData.width * paredExistenteNueva.userData.height;
                paredExistenteNueva.geometry.dispose();
                paredExistenteNueva.geometry.dynamic = true;
                paredExistenteNueva.geometry = this.crearGeometriaPared(widthExistenteNueva, paredExistenteNueva.height);

                if(orientacion.z !== 0){
                    paredExistenteNueva.position.x = paredExistenteNueva.position.x + widthChoque + widthExistente;
                }else{
                    paredExistenteNueva.position.z = paredExistenteNueva.position.z + widthChoque + widthExistente;
                }
                paredExistenteNueva.userData.point[0] = paredNueva.userData.point[1];

            }


        }else if(widthChoque === paredExistente.userData.width){

            paredExistente.userData.separacion = Morfologia.separacion.INTERIOR;
            if(paredNueva.userData.point[1] > hasta){
                paredNueva.userData.width = paredNueva.userData.width - widthChoque;
                paredNueva.userData.superficie = paredNueva.userData.width * paredNueva.userData.height;
                paredNueva.geometry.dispose();
                paredNueva.geometry.dynamic = true;
                paredNueva.geometry = this.crearGeometriaPared(widthChoque, paredNueva.height);
                if(orientacion.z !== 0){
                    paredNueva.position.x = paredNueva.position.x + widthChoque;
                }else{
                    paredNueva.position.z = paredNueva.position.z + widthChoque;
                }
                paredNueva.userData.point[0] = paredExistente.userData.point[1];
            }else if(paredNueva.userData.point[0] < desde){
                paredNueva.userData.width = paredNueva.userData.width - widthChoque;
                paredNueva.userData.superficie = paredNueva.userData.width * paredNueva.userData.height;
                paredNueva.geometry.dispose();
                paredNueva.geometry.dynamic = true;
                paredNueva.geometry = this.crearGeometriaPared(widthChoque, paredNueva.height);
                paredNueva.userData.point[1] = paredExistente.userData.point[0];

            }else{
                let widthNueva = Math.abs(paredExistente.userData.point[0]- paredNueva.userData.point[0]);
                let widthNuevaNueva = Math.abs(paredNueva.userData.point[1] - paredExistente.userData.point[1]);
                paredNueva.userData.width =  widthNueva;
                paredNueva.userData.superficie = paredNueva.userData.width * paredNueva.userData.height;
                paredNueva.geometry.dispose();
                paredNueva.geometry.dynamic = true;
                paredNueva.geometry = this.crearGeometriaPared(widthNueva, paredNueva.height);
                paredNueva.userData.point[1] = paredExistente.userData.point[0];

                let paredNuevaNueva = paredNueva.clone();
                paredNueva.parent.add(paredNuevaNueva);

                paredNuevaNueva.userData.width =  widthNuevaNueva;
                paredNuevaNueva.userData.superficie = paredNuevaNueva.userData.width * paredNuevaNueva.userData.height;
                paredNuevaNueva.geometry.dispose();
                paredNuevaNueva.geometry.dynamic = true;
                paredNuevaNueva.geometry = this.crearGeometriaPared(widthNuevaNueva, paredNuevaNueva.height);

                if(orientacion.z !== 0){
                    paredNuevaNueva.position.x = paredNuevaNueva.position.x + widthChoque + widthNueva;
                }else{
                    paredNuevaNueva.position.z = paredNuevaNueva.position.z + widthChoque + widthNueva;
                }
                paredNuevaNueva.userData.point[0] = paredNuevaNueva.userData.point[1];

            }

        }else{
            //TODO: ultimo caso
        }
    }

    agregarHabitacion(habitacion){
        let paredes = habitacion.getObjectByName("Paredes");

        let capas =
            [
                {
                    material: 1,
                    tipo: 0,
                    propiedad: 0,
                    conductividad: this.info_material[1].propiedades[0].conductividad,
                    espesor: 0.1
                },
                {
                    material: 3,
                    tipo: 0,
                    propiedad: 0,
                    conductividad: this.info_material[3].propiedades[0].conductividad,
                    espesor: 0.2
                }
            ];

        for(let pared of paredes.children){
            pared.material = this.materialParedConstruida.clone();
            pared.castShadow = true;
            pared.receiveShadow = true;
            pared.userData.superficie = pared.userData.width * pared.userData.height;
            pared.userData.capas = capas.slice();

            this.agregarTransmitanciaSuperficie(pared);
            //BalanceEnergetico.transmitanciaSuperficie(pared,this.zona);
            //transmitanciaSuperficies += pared.userData.transSup;
            //transmitanciaSuperficiesObjetivo += pared.userData.transSupObjetivo;

            this.paredes.push(pared);
            if(pared.userData.orientacion.z !== 0){
                this.paredesX.push(pared);
            }else{
                this.paredesZ.push(pared);
            }
            this.allObjects.push(pared);
        }
        let piso = habitacion.getObjectByName("Piso");
        this.pisos.push(piso);
        this.allObjects.push(piso);
        piso.userData.superficie = piso.userData.width * piso.userData.depth;
        piso.userData.perimetro = piso.userData.width * 2 + piso.userData.depth * 2;

        piso.userData.capas  =
            [
                {
                    material: 2,
                    tipo: null,
                    propiedad: 0,
                    conductividad: this.info_material[2].propiedades[0].conductividad,
                    espesor: 0.1
                },
                {
                    material: 11,
                    tipo: 2,
                    propiedad: 0,
                    conductividad: this.info_material[11].tipos[2].propiedades[0].conductividad,
                    espesor: 0.2
                }
            ];

        piso.material = this.materialPisoConstruido.clone();
        piso.castShadow = true;
        piso.receiveShadow = true;

        piso.userData.superficie = piso.userData.width * piso.userData.depth;

        this.agregarTransmitanciaSuperficie(piso);

        //BalanceEnergetico.transmitanciaSuperficie(piso,this.zona);
        //transmitanciaSuperficies += piso.userData.transSup;
        //transmitanciaSuperficiesObjetivo += piso.userData.transSupObjetivo;

        //let puenteTermico = BalanceEnergetico.puenteTermico(piso);

        //piso.userData.puenteTermico = puenteTermico.normal;
        //piso.userData.puenteTermicoObjetivo = puenteTermico.objetivo;


        let techo = habitacion.getObjectByName("Techo");
        if(techo){
            techo.userData.superficie = techo.userData.width * techo.userData.depth;

            this.agregarTransmitanciaSuperficie(techo);

            //BalanceEnergetico.transmitanciaSuperficie(techo,this.zona);
            //transmitanciaSuperficies += techo.userData.transSup;
            //transmitanciaSuperficiesObjetivo += techo.userData.transSup;

            piso.userData.techo = techo;
        }

        this.recalcularBalancePorVolumen(habitacion);
        //let aporteInterno = BalanceEnergetico.aporteInterno(this.ocupantes, piso.userData.superficie, this.horasIluminacion, this.periodo);

        //let perdidaVentilacion = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen, this.aireRenovado, this.gradoDias);
        //let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, puenteTermico.normal);
        //let perdidaVentilacionObjetivo = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen,this.aireRenovadoObjetivo,this.gradoDias);
        //let perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficiesObjetivo,this.gradoDias,puenteTermico.objetivo);
        //habitacion.userData.puenteTermico = puenteTermico.normal;
        //habitacion.userData.puenteTermicoObjetivo = puenteTermico.objetivo;
        //habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
        //habitacion.userData.transmitanciaSuperficiesObjetivo = transmitanciaSuperficiesObjetivo;
        //habitacion.userData.aporteInterno = aporteInterno;
        //habitacion.userData.perdidaVentilacion = perdidaVentilacion;
        //habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;
        //habitacion.userData.perdidaVentilacionObjetivo = perdidaVentilacionObjetivo;
        //habitacion.userData.perdidaPorConduccionObjetivo = perdidaPorConduccionObjetivo;
        //console.log("perdida objetivo",perdidaPorConduccionObjetivo,transmitanciaSuperficiesObjetivo,this.gradoDias,puenteTermico.objetivo);

        let nivel = this.casa.children[habitacion.userData.nivel - 1];
        nivel.add(habitacion);

        //this.casa.userData.aporteInterno += aporteInterno;
        //this.casa.userData.perdidaVentilacion += perdidaVentilacion;
        //this.casa.userData.perdidaPorConduccion += perdidaPorConduccion;
        //this.casa.userData.perdidaVentilacionObjetivo += perdidaVentilacionObjetivo;
        //this.casa.userData.perdidaPorConduccionObjetivo += perdidaPorConduccionObjetivo;
        this.casa.userData.area += habitacion.userData.depth * habitacion.userData.width;
        this.casa.userData.volumen += habitacion.userData.volumen;
        this.casa.updateMatrixWorld();

        //console.log(habitacion);
    }

    recalcularBalancePorVolumen(habitacion){
        let piso = habitacion.getObjectByName('Piso');

        this.casa.userData.aporteInterno -= habitacion.userData.aporteInterno;
        this.casa.userData.perdidaVentilacion -= habitacion.userData.perdidaVentilacion;
        this.casa.userData.perdidaVentilacionObjetivo -= habitacion.userData.perdidaVentilacionObjetivo;
        let aporteInterno, perdidaVentilacion, perdidaVentilacionObjetivo;
        if(this.periodo.length > 0) {
            aporteInterno = BalanceEnergetico.aporteInterno(this.ocupantes, piso.userData.superficie, this.horasIluminacion, this.periodo);
            perdidaVentilacion = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen, this.aireRenovado, this.gradoDias);
            perdidaVentilacionObjetivo = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen, this.aireRenovadoObjetivo, this.gradoDias);
        }
        else{
            aporteInterno = 0;
            perdidaVentilacion = 0
            perdidaVentilacionObjetivo = 0;
        }
        //console.log("calculando aporte interno", this.ocupantes, piso.userData.superficie, this.horasIluminacion, this.periodo, aporteInterno)
        //console.log("calculando perdida ventilacion",habitacion.userData.volumen, this.aireRenovado, this.gradoDias, perdidaVentilacion)

        habitacion.userData.aporteInterno = aporteInterno;
        habitacion.userData.perdidaVentilacion = perdidaVentilacion;
        habitacion.userData.perdidaVentilacionObjetivo = perdidaVentilacionObjetivo;

        this.casa.userData.aporteInterno += aporteInterno;
        this.casa.userData.perdidaVentilacion += perdidaVentilacion;
        this.casa.userData.perdidaVentilacionObjetivo += perdidaVentilacionObjetivo;

        //console.log("casa en recalculo aporte y perdida por volumen",this.casa);
    }

    aumentarNivelHabitacion(habitacion){
        
        let pos = habitacion.position.clone();
        let prevNivel = habitacion.userData.nivel;
        habitacion.userData.nivel = prevNivel + 1;
        let piso = habitacion.getObjectByName("Piso");
        piso.userData.separacion =  Morfologia.separacion.INTERIOR;

        this.actualizarTransmitanciaSuperficie(piso);

       //let puenteTermico = BalanceEnergetico.puenteTermico(piso);

        //piso.userData.puenteTermico = puenteTermico.normal;
        //piso.userData.puenteTermicoObjetivo = puenteTermico.objetivo;

        //let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;
        //habitacion.userData.puenteTermico = piso.userData.puenteTermico;
        //habitacion.userData.puenteTermicoObjetivo = puenteTermico.objetivo;




        //let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, habitacion.userData.puenteTermico);
        //this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
        //this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;

       //habitacion.position.y = (nivel - 1) *habitacion.userData.height;

        let nivel = habitacion.parent;
        nivel.remove(habitacion);

        nivel = this.casa.children[habitacion.userData.nivel-1];
        if(!nivel){
            nivel = new THREE.Group();
            this.casa.add(nivel);
            nivel.position.y = (habitacion.userData.nivel - 1) * habitacion.userData.height;
            nivel.userData.nivel = prevNivel + 1;
        }


        nivel.add(habitacion);


        this.casa.updateMatrixWorld();

    }

    agregarHabitacionDibujada() {
        if (this.habitacionConstruccion.userData.error) {
            this.crecerHabitacion(this.habitacionConstruccion.userData.start);
            this.habitacionConstruccion.userData.error = false;
            return;
        }

        var habitacion = this.habitacionConstruccion.clone();

        let paredes = habitacion.getObjectByName("Paredes");

        for(let pared of paredes.children){
            let keys = Object.keys(pared.userData.choques);
            if(keys.length > 0){
                for(let key of keys){
                    let paredChocada = this.escena.getObjectById(key);
                    let choques = pared.userData.choques[key];
                    let from = choques[0];
                    let to = choques[choques.length];
                    //TODO: MOver de aca todo desde el primer for.
                    //this.separarParedes(pared, paredChocada, from, to, pared.userData.orientacion);
                }
            }
        }
        if(habitacion.userData.start.x > habitacion.userData.end.x){
            let aux = habitacion.userData.start.x;
            habitacion.userData.start.x = habitacion.userData.end.x;
            habitacion.userData.end.x = aux;
        }
        if(habitacion.userData.start.z > habitacion.userData.end.z){
            let aux = habitacion.userData.start.z;
            habitacion.userData.start.z = habitacion.userData.end.z;
            habitacion.userData.end.z = aux;
        }

        this.agregarHabitacion(habitacion);

        //Se borra la habitacion de dibujo
        this.habitacionConstruccion.visible = false;

    }

    ocultarVentanaConstruccion() {
        this.ventanaConstruccion.visible = false;
    }

    ocultarPuertaConstruccion() {
        this.puertaConstruccion.visible = false;
    }

    handleCasaPredefinida(casaPredefinida){

        this.crearCasaVacia();
        switch(casaPredefinida) {
            case 0:
                this.crearCasaSimple();
                break;
            case 1:
                this.crearCasaDoble();
                break;
            case 2:
                this.crearCasaSimpleDosPisos();
                break;
            case 3:
                this.crearCasaDobleDosPisos();
                break;
        }

    }

    crearCasaDoble(){
        let habitacion1 = this.crearCasaSimple();
        let paredes1 = habitacion1.getObjectByName("Paredes");

        let pared;

        for(let paredAux of paredes1.children){
            if(paredAux.userData.orientacion.x === -1){
                pared = paredAux;
                break;
            }
        }

        let ventanas = pared.children;

        for(let ventana of ventanas){
            this.ventanas.splice(this.ventanas.indexOf(ventana),1);
            this.quitarTransmitanciaSuperficie(ventana,habitacion1);
            this.allObjects.splice(this.allObjects.indexOf(ventana),1);

        }

        pared.children = [];

        pared.userData.separacion = Morfologia.separacion.INTERIOR;

        var shape = pared.geometry.userData.shape.clone();
        shape.holes = [];

        pared.geometry.dispose();
        pared.geometry.dynamic = true;
        pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
        pared.geometry.userData.shape = shape;
        pared.geometry.verticesNeedUpdate = true;
        pared.userData.superficie = pared.userData.width * pared.userData.height;

        this.quitarTransmitanciaSuperficie(pared,habitacion1);

        let habitacion2 = this.crearCasaSimple();

        let paredes2 = habitacion2.getObjectByName("Paredes");

        pared;
        for(let paredAux of paredes2.children){
            if(paredAux.userData.orientacion.x === 1){
                pared = paredAux;
                break;
            }
        }

        ventanas = pared.children;

        for(let ventana of ventanas){
            this.quitarTransmitanciaSuperficie(ventana,habitacion2);
            this.ventanas.splice(this.ventanas.indexOf(ventana),1);
            this.allObjects.splice(this.allObjects.indexOf(ventana),1);
        }

        pared.visible = false;
        this.quitarTransmitanciaSuperficie(pared,habitacion2);

        this.paredes.splice( this.paredes.indexOf(pared), 1 );

        habitacion1.position.x = habitacion1.position.x - this.widthPredefinida/2 + 0.5;
        habitacion1.userData.start.x = habitacion1.userData.start.x - this.widthPredefinida/2 + 0.5;
        habitacion1.userData.end.x = habitacion1.userData.end.x - this.widthPredefinida/2 + 0.5;
        habitacion2.position.x = habitacion2.position.x + this.widthPredefinida/2 + 0.5;
        habitacion2.userData.start.x = habitacion2.userData.start.x + this.widthPredefinida/2 + 0.5;
        habitacion2.userData.end.x = habitacion2.userData.end.x + this.widthPredefinida/2 + 0.5;

        return [habitacion1, habitacion2];

    }

    crearCasaDobleDosPisos(){
        let habitaciones = this.crearCasaDoble();

        let habitacion = habitaciones[0];

        for(let habitacion of habitaciones){
            let techo = habitacion.getObjectByName("Techo");
            habitacion.remove(techo);
            this.quitarTransmitanciaSuperficie(techo,habitacion);
        }

        let nuevaHabitacion = this.crearCasaDoble();

        for(let habitacion of nuevaHabitacion){
            for(let pared of habitacion.getObjectByName("Paredes").children){
                for(let objeto of pared.children){
                    if(objeto.userData.tipo === Morfologia.tipos.PUERTA){
                        this.quitarObjetoPuerta(objeto);
                        this.quitarTransmitanciaSuperficie(objeto,habitacion);
                    }
                }
                this.actualizarTransmitanciaSuperficie(pared);
            }

            this.aumentarNivelHabitacion(habitacion);
        }

    }

    crearCasaSimpleDosPisos(){
        let habitacion = this.crearCasaSimple();

        let techo = habitacion.getObjectByName("Techo");

        this.quitarTransmitanciaSuperficie(techo, habitacion);
        habitacion.remove(techo);

        habitacion = this.crearCasaSimple();

        for(let pared of habitacion.getObjectByName("Paredes").children){
            for(let objeto of pared.children){
                if(objeto.userData.tipo === Morfologia.tipos.PUERTA){

                    this.quitarTransmitanciaSuperficie(objeto,habitacion);
                    this.quitarObjetoPuerta(objeto);
                }
            }
            this.actualizarTransmitanciaSuperficie(pared);
        }

        this.aumentarNivelHabitacion(habitacion);

    }

    borrarEstructura(objeto){
        switch (objeto.userData.tipo) {
            case Morfologia.tipos.PUERTA:
                this.quitarTransmitanciaSuperficie(objeto,objeto.parent.parent.parent);
                this.quitarObjetoPuerta(objeto);
                break;
            case Morfologia.tipos.VENTANA:
                this.quitarTransmitanciaSuperficie(objeto,objeto.parent.parent.parent);
                this.quitarObjetoVentana(objeto);
                break;
            case Morfologia.tipos.TECHO:
                this.quitarTransmitanciaSuperficie(objeto,objeto.parent);
                this.quitarObjetoVentana(objeto);
                break;
            case Morfologia.tipos.PARED:
            case Morfologia.tipos.PISO:
                this.borrarHabitacion(objeto);
                break;
        }
    }

    borrarHabitacion(objeto){
        let habitacion;
        if(objeto.userData.tipo === Morfologia.tipos.PARED){
            habitacion = objeto.parent.parent;
        }else if(objeto.userData.tipo === Morfologia.tipos.PISO){
            habitacion = objeto.parent;
        }else{
            return;
        }
        let piso = habitacion.getObjectByName('Piso');
        this.pisos.splice(this.pisos.indexOf(piso),1);
        this.allObjects.splice(this.allObjects.indexOf(piso),1);

        let paredes = habitacion.getObjectByName('Paredes');
        for(let pared of paredes.children){
            for(let estructura of pared.children){
                if(estructura.userData.tipo === Morfologia.tipos.VENTANA){
                    this.ventanas.splice(this.ventanas.indexOf(estructura),1);
                    this.allObjects.splice(this.allObjects.indexOf(estructura),1);
                }else{
                    this.puertas.splice(this.puertas.indexOf(estructura),1);
                    this.allObjects.splice(this.allObjects.indexOf(estructura),1);
                }
            }
            this.paredes.splice(this.paredes.indexOf(pared),1);
            if(pared.userData.orientacion.z !== 0){
                this.paredesX.splice(this.paredesX.indexOf(pared),1);
            }else{
                this.paredesZ.splice(this.paredesZ.indexOf(pared),1);
            }
            this.allObjects.splice(this.allObjects.indexOf(pared),1);
        }
        habitacion.parent.remove(habitacion);

        this.casa.userData.aporteInterno -= habitacion.userData.aporteInterno;
        this.casa.userData.perdidaVentilacion -= habitacion.userData.perdidaVentilacion;
        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaVentilacionObjetivo -= habitacion.userData.perdidaVentilacionObjetivo;
        this.casa.userData.perdidaPorConduccionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;
        this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
        this.casa.userData.transmitanciaSuperficiesObjetivo -= habitacion.userData.transmitanciaSuperficiesObjetivo;
        this.casa.userData.volumen -= habitacion.userData.volumen;
        this.casa.userData.area -= piso.userData.superficie;

    }



    quitarObjetoVentana(ventana){
        let pared = ventana.parent;
        let habitacion = pared.parent.parent;

        var shape = pared.geometry.userData.shape.clone();
        let currentPointVentana = ventana.userData.hole.currentPoint;
        for(let hole of shape.holes){
            if(hole.currentPoint.x === currentPointVentana.x && hole.currentPoint.y === currentPointVentana.y){
                var index = shape.holes.indexOf(hole);
                shape.holes.splice(index,1);
                break;
            }
        }

        pared.geometry.dispose();
        pared.geometry.dynamic = true;
        pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
        pared.geometry.userData.shape = shape;
        pared.geometry.verticesNeedUpdate = true;

        pared.userData.superficie += ventana.userData.superficie;
        pared.remove(ventana);

        this.ventanas.splice(this.ventanas.indexOf(ventana),1);
        this.allObjects.splice(this.allObjects.indexOf(ventana),1);
    }

    quitarObjetoPuerta(puerta){
        let pared = puerta.parent;
        let habitacion = pared.parent.parent;

        var shape = pared.geometry.userData.shape.clone();
        let currentPointPuerta = puerta.userData.hole.currentPoint;
        for(let hole of shape.holes){
            if(hole.currentPoint.x === currentPointPuerta.x && hole.currentPoint.y === currentPointPuerta.y){
                var index = shape.holes.indexOf(hole);
                shape.holes.splice(index,1);
                break;
            }
        }

        pared.geometry.dispose();
        pared.geometry.dynamic = true;
        pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
        pared.geometry.userData.shape = shape;
        pared.geometry.verticesNeedUpdate = true;

        pared.userData.superficie += puerta.userData.superficie;
        pared.remove(puerta);

        this.puertas.splice(this.puertas.indexOf(puerta),1);
        this.allObjects.splice(this.allObjects.indexOf(puerta),1);
    }

    crearCasaSimple(){
        let habitacion = this.crearHabitacion(this.widthPredefinida, this.heightWall, this.depthPredefinida, 1);

        habitacion.position.x = -0.5;
        habitacion.userData.start =  new THREE.Vector3(
            habitacion.position.x - this.widthPredefinida/2,
            habitacion.position.y,
            habitacion.position.z - this.depthPredefinida/2
        );

        habitacion.userData.end =  new THREE.Vector3(
            habitacion.position.x + this.widthPredefinida/2,
            habitacion.position.y,
            habitacion.position.z + this.depthPredefinida/2
        );

        this.agregarHabitacion(habitacion);

        this.agregarTecho(habitacion);

        let paredes = habitacion.getObjectByName("Paredes");
        for(let pared of paredes.children){
            if(pared.userData.orientacion.z !== 0){
                if(pared.userData.orientacion.z === 1 ){
                    let point = new THREE.Vector3(Math.floor(this.widthPredefinida/2)-1,1,-this.depthPredefinida/2);
                    this.moverVentanaConstruccion(pared, point.clone());
                    this.agregarVentana();

                    point = new THREE.Vector3(-(Math.floor(this.widthPredefinida/2)-1),1,-this.depthPredefinida/2);
                    this.moverVentanaConstruccion(pared, point);
                    this.agregarVentana();



                    point = point = new THREE.Vector3(-(Math.floor(this.widthPredefinida/2)-1),1,-this.depthPredefinida/2);
                }else{
                    let point = new THREE.Vector3(Math.floor(this.widthPredefinida/2)-1,1,this.depthPredefinida/2);
                    this.moverVentanaConstruccion(pared, point.clone());
                    this.agregarVentana();

                    point = new THREE.Vector3(-(Math.floor(this.widthPredefinida/2)-1),1,this.depthPredefinida/2);
                    this.moverVentanaConstruccion(pared, point);
                    this.agregarVentana();

                    point = new THREE.Vector3(0,1,this.depthPredefinida/2);
                    this.moverPuertaConstruccion(pared, point);
                    this.agregarPuerta();


                }
            }else{
                if(pared.userData.orientacion.x === 1){
                    let point = new THREE.Vector3(-Math.ceil(this.widthPredefinida/2),1,-(Math.floor(this.depthPredefinida/2)- 2));
                    this.moverVentanaConstruccion(pared, point.clone());
                    this.agregarVentana();

                    point = new THREE.Vector3(-Math.ceil(this.widthPredefinida/2),1,-(Math.floor(this.depthPredefinida/2)- 3));
                    this.moverVentanaConstruccion(pared, point);
                    this.agregarVentana();

                    point = new THREE.Vector3(-Math.ceil(this.widthPredefinida/2),1,Math.floor(this.depthPredefinida/2)- 1);
                    this.moverVentanaConstruccion(pared, point.clone());
                    this.agregarVentana();

                    point = new THREE.Vector3(-Math.ceil(this.widthPredefinida/2),1,Math.floor(this.depthPredefinida/2)- 2);
                    this.moverVentanaConstruccion(pared, point);
                    this.agregarVentana();
                }else{
                    let point = new THREE.Vector3(Math.ceil(this.widthPredefinida/2)-1,1,-(Math.floor(this.depthPredefinida/2)- 2));
                    this.moverVentanaConstruccion(pared, point.clone());
                    this.agregarVentana();

                    point = new THREE.Vector3(Math.ceil(this.widthPredefinida/2)-1,1,-(Math.floor(this.depthPredefinida/2)- 3));
                    this.moverVentanaConstruccion(pared, point);
                    this.agregarVentana();

                    point = new THREE.Vector3(Math.ceil(this.widthPredefinida/2)-1,1,Math.floor(this.depthPredefinida/2)- 1);
                    this.moverVentanaConstruccion(pared, point.clone());
                    this.agregarVentana();

                    point = new THREE.Vector3(Math.ceil(this.widthPredefinida/2)-1,1,Math.floor(this.depthPredefinida/2)- 2);
                    this.moverVentanaConstruccion(pared, point);
                    this.agregarVentana();
                }
            }
            this.ocultarPuertaConstruccion();
            this.ocultarVentanaConstruccion();
        }
        //habitacion.rotation.y = Math.PI ;
        return habitacion;
    }

    agregarPuerta() {
        if (this.puertaConstruccion.userData.error) {
            return;
        }
        let pared = this.puertaConstruccion.userData.pared;
        if (pared !== null) {
            let puerta = this.puertaConstruccion.clone();
            let habitacion = pared.parent.parent;
            let orientacion = pared.userData.orientacion;
            puerta.setRotationFromEuler(new THREE.Euler(0, 0, 0, 'XYZ'));
            puerta.castShadow = true;
            puerta.receiveShadow = true;
            pared.add(puerta);
            pared.worldToLocal(puerta.position);
            puerta.userData.superficie = puerta.userData.width * puerta.userData.height;
            puerta.geometry.computeBoundingBox();

            let bound = puerta.geometry.boundingBox;

            let vertices = [
                new THREE.Vector2(bound.min.x + puerta.position.x, bound.min.y + puerta.position.y),
                new THREE.Vector2(bound.min.x + puerta.position.x, bound.max.y + puerta.position.y),
                new THREE.Vector2(bound.max.x + puerta.position.x, bound.max.y + puerta.position.y),
                new THREE.Vector2(bound.max.x + puerta.position.x, bound.min.y + puerta.position.y),

            ];
            //TODO: revisar superposicion de hoyos

            let hole = new THREE.Path(vertices);

            puerta.userData.hole = hole;

            var shape = pared.geometry.userData.shape.clone();
            shape.holes.push(hole);

            pared.geometry.dispose();
            pared.geometry.dynamic = true;
            pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
            pared.geometry.userData.shape = shape;
            pared.geometry.verticesNeedUpdate = true;


            puerta.material = this.materialPuertaConstruida.clone();

            puerta.userData.tipo = Morfologia.tipos.PUERTA;

            puerta.userData.info_material = {
                material: 15,
                tipo: 4,
                propiedad: 0,
                conductividad: this.info_material[1].propiedades[0].conductividad,
                espesor: 0.1,
            };
            //Por ahora el calculo se hace sin marco

            pared.userData.superficie -= puerta.userData.superficie;

            this.agregarTransmitanciaSuperficie(puerta);
            this.actualizarTransmitanciaSuperficie(pared);

            this.puertas.push(puerta);
            this.allObjects.push(puerta);
        }
    }

    agregarTechoConstruccion(){
        if(this.techoConstruccion.userData.error){
            return;
        }else{
            let habitacion = this.techoConstruccion.userData.habitacion;
            this.techoConstruccion.visible = false;
            this.agregarTecho(habitacion);
        }

    }

    agregarTecho(habitacion){
        let width = habitacion.userData.width;
        let depth = habitacion.userData.depth;
        let height = habitacion.userData.height;
        var techo = this.crearMeshTecho(width, depth, height);
        techo.userData.tipo = Morfologia.tipos.TECHO;
        techo.userData.separacion = Morfologia.separacion.EXTERIOR;
        techo.userData.width = width;
        techo.userData.depth = depth;
        techo.userData.height = height;
        techo.userData.superficie = depth * width;
        techo.name = "Techo";
        techo.material = this.materialTechoConstruido.clone();

        techo.userData.capas  =
            [
                {
                    material: 10,
                    tipo: null,
                    propiedad: 0,
                    conductividad: this.info_material[2].propiedades[0].conductividad,
                    espesor: 0.1
                },
                {
                    material: 15,
                    tipo: 0,
                    propiedad: 0,
                    conductividad: this.info_material[11].tipos[2].propiedades[0].conductividad,
                    espesor: 0.2
                }
            ];

        let piso = habitacion.getObjectByName("Piso");
        piso.userData.techo = techo;

        habitacion.add(techo);

        this.agregarTransmitanciaSuperficie(techo);
    }

    agregarVentana() {
        if (this.ventanaConstruccion.userData.error) {
            return null;
        }

        let pared = this.ventanaConstruccion.userData.pared;
        if (pared !== null) {

            let ventana = this.ventanaConstruccion.clone();
            let habitacion = pared.parent.parent;
            let orientacion = pared.userData.orientacion;
            ventana.userData.orientacion = new THREE.Vector3(-orientacion.x, -orientacion.y, -orientacion.z);
            //ventana.userData.orientacion = pared.userData.orientacion;
            ventana.userData.pos = new THREE.Vector3();
            ventana.setRotationFromEuler(new THREE.Euler(0, 0, 0, 'XYZ'));
            //ventana.material = this.materialVentanaConstruida.clone();
            //ventana.visible = false;
            pared.worldToLocal(ventana.position);
            pared.add(ventana);

            ventana.geometry.computeBoundingBox();
            ventana.userData.superficie = ventana.userData.width * ventana.userData.height;

            let bound = ventana.geometry.boundingBox;

            let vertices = [
                new THREE.Vector2(bound.min.x + ventana.position.x, bound.min.y + ventana.position.y),
                new THREE.Vector2(bound.min.x + ventana.position.x, bound.max.y + ventana.position.y),
                new THREE.Vector2(bound.max.x + ventana.position.x, bound.max.y + ventana.position.y),
                new THREE.Vector2(bound.max.x + ventana.position.x, bound.min.y + ventana.position.y),

            ];
            //TODO: revisar superposicion de hoyos

            let hole = new THREE.Path(vertices);
            ventana.userData.hole = hole;
            var shape = pared.geometry.userData.shape.clone();
            shape.holes.push(hole);

            pared.geometry.dispose();
            pared.geometry.dynamic = true;
            pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
            pared.geometry.userData.shape = shape;
            pared.geometry.verticesNeedUpdate = true;

            pared.userData.superficie -= ventana.userData.superficie;

            ventana.userData.tipo = Morfologia.tipos.VENTANA;
            ventana.userData.info_material = {
                material: 0,
                tipo: 0,
                fs: this.info_ventana[0].tipos[0].propiedad.FS,
                fsObjetivo: 0.87,
                u: this.info_ventana[0].tipos[0].propiedad.U,
                uObjetivo: 5.8
            };
            ventana.userData.info_marco = {
                material: 0,
                tipo: null,
                propiedad: 0,
                fs: this.info_marcos[0].propiedades[0].FS,
                fsObjetivo: 0.8,
                u: this.info_marcos[0].propiedades[0].U,
                uObjetivo: 5.8
            };
            //Por ahora el calculo se hace sin marco

            this.agregarTransmitanciaSuperficie(ventana);
            this.actualizarTransmitanciaSuperficie(pared);

            this.ventanas.push(ventana);
            this.allObjects.push(ventana);
        }
    }

    getVentanas(){
        return this.ventanas;
    }

    moverVentanaConstruccion(pared, point) {
        point.round();

        this.ventanaConstruccion.visible = true;
        this.ventanaConstruccion.userData.pared = pared;
        this.ventanaConstruccion.setRotationFromEuler(pared.rotation);
        this.ventanaConstruccion.position.copy(point).round();
        this.ventanaConstruccion.position.y = (pared.parent.parent.userData.nivel - 1) * pared.parent.parent.userData.height + 1;

        if(pared.userData.orientacion.z !== 0){
            this.ventanaConstruccion.position.x = this.ventanaConstruccion.position.x - 0.5;
            if(this.ventanaConstruccion.position.x < (pared.position.x - pared.userData.width/2)){
                this.ventanaConstruccion.position.x = this.ventanaConstruccion.position.x + 1;
            }else if(this.ventanaConstruccion.position.x > (pared.position.x + pared.userData.width/2)){
                this.ventanaConstruccion.position.x = this.ventanaConstruccion.position.x - 1;
            }
        }else{
            this.ventanaConstruccion.position.z = this.ventanaConstruccion.position.z - 0.5;
            if(this.ventanaConstruccion.position.z < (pared.position.z - pared.userData.width/2)){
                this.ventanaConstruccion.position.z = this.ventanaConstruccion.position.z + 1;
            }else if(this.ventanaConstruccion.position.z > (pared.position.z + pared.userData.width/2)){
                this.ventanaConstruccion.position.z = this.ventanaConstruccion.position.z - 1;
            }
        }

        let pos = this.ventanaConstruccion.position.clone();
        pared.worldToLocal(pos);

        this.ventanaConstruccion.userData.error = false;
        for(let elementos of pared.children){
            if(elementos.position.x ===( Math.round( pos.x * 10) / 10)){

                this.ventanaConstruccion.material = this.materialError.clone();
                this.ventanaConstruccion.userData.error = true;
                break;
            }
        }
        if(!this.ventanaConstruccion.userData.error){
            this.ventanaConstruccion.material = this.materialVentanaConstruccion.clone();
        }
    }

    moverTechoConstruccion(elemento){
        let habitacion = elemento.userData.tipo === Morfologia.tipos.PARED ? elemento.parent.parent : elemento.parent;
        let {height, depth, width, nivel} = habitacion.userData;

        this.techoConstruccion.visible = true;
        this.techoConstruccion.userData.habitacion = habitacion;
        this.techoConstruccion.geometry = this.crearGeometriaTecho(width, depth, height);
        this.techoConstruccion.geometry.computeBoundingBox();
        let pos = new THREE.Vector3(0,0,0);
        habitacion.localToWorld(pos);
        this.techoConstruccion.position.copy(pos);
        this.techoConstruccion.position.y = height * (nivel-1);

        let techo = habitacion.getObjectByName("Techo");
        this.techoConstruccion.userData.error = !!techo;

    }
    ocultarTechoConstruccion(){
        this.techoConstruccion.visible = false;
    }

    moverPuertaConstruccion(pared, point) {
        let pos = point.clone();
        pared.worldToLocal(pos);

        this.puertaConstruccion.visible = true;
        this.puertaConstruccion.userData.pared = pared;
        this.puertaConstruccion.setRotationFromEuler(pared.rotation);
        this.puertaConstruccion.position.copy(point).round();
        this.puertaConstruccion.position.y = (pared.parent.parent.userData.nivel - 1) * pared.parent.parent.userData.height;

        if(pared.userData.orientacion.z !== 0){
            this.puertaConstruccion.position.x = this.puertaConstruccion.position.x - 0.5 ;
            if(this.puertaConstruccion.position.x < (pared.position.x - pared.userData.width/2)){
                this.puertaConstruccion.position.x = this.puertaConstruccion.position.x + 1;
            }else if(this.puertaConstruccion.position.x > (pared.position.x + pared.userData.width/2)){
                this.puertaConstruccion.position.x = this.puertaConstruccion.position.x - 1;
            }
        }else{
            this.puertaConstruccion.position.z = this.puertaConstruccion.position.z - 0.5;
            if(this.puertaConstruccion.position.z < (pared.position.z - pared.userData.width/2)){
                this.puertaConstruccion.position.z = this.puertaConstruccion.position.z + 1;
            }else if(this.puertaConstruccion.position.z > (pared.position.z + pared.userData.width/2)){
                this.puertaConstruccion.position.z = this.puertaConstruccion.position.z - 1;
            }
        }

        let posclone = this.puertaConstruccion.position.clone();
        pared.worldToLocal(posclone);

        this.puertaConstruccion.userData.error = false;
        for(let elementos of pared.children){
            if(elementos.position.x ===( Math.round( posclone.x * 10) / 10)){

                this.puertaConstruccion.material = this.materialError.clone();
                this.puertaConstruccion.userData.error = true;
                break;
            }
        }
        if(!this.puertaConstruccion.userData.error){
            this.puertaConstruccion.material = this.materialPuertaConstruccion.clone();
        }

    }
    modificarAlturaVentana(ventana, altura){
        let oldAltura = ventana.position.y;
        let height = ventana.userData.height;

        let pared = ventana.parent;

        if(altura !== oldAltura){
            if((height + altura) < pared.userData.height && altura >= 0.1){

                var shape = pared.geometry.userData.shape.clone();
                let currentPointVentana = ventana.userData.hole.currentPoint;
                for(let hole of shape.holes){
                    if(hole.currentPoint.x === currentPointVentana.x && hole.currentPoint.y === currentPointVentana.y){
                        var index = shape.holes.indexOf(hole);
                        shape.holes.splice(index,1);
                        break;
                    }
                }

                ventana.position.y = ( Math.round( altura * 10) / 10);

                let bound = ventana.geometry.boundingBox;

                let vertices = [
                    new THREE.Vector2(bound.min.x + ventana.position.x, bound.min.y + ventana.position.y),
                    new THREE.Vector2(bound.min.x + ventana.position.x, bound.max.y + ventana.position.y),
                    new THREE.Vector2(bound.max.x + ventana.position.x, bound.max.y + ventana.position.y),
                    new THREE.Vector2(bound.max.x + ventana.position.x, bound.min.y + ventana.position.y),

                ];

                let hole = new THREE.Path(vertices);

                ventana.userData.hole = hole;

                shape.holes.push(hole);

                pared.geometry.dispose();
                pared.geometry.dynamic = true;
                pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
                pared.geometry.userData.shape = shape;
                pared.geometry.verticesNeedUpdate = true;
            }
        }
    }

    modificarVentana(ventana, width, height){
        let oldWidth = ventana.userData.width;
        let oldHeight = ventana.userData.height;

        let pared = ventana.parent;

        let habitacion = pared.parent.parent;

        if(oldHeight !== height || oldWidth !== width){
            if((height + ventana.position.y) <= pared.userData.height && width <= 1 && height >= 0 && width >= 0){

                var shape = pared.geometry.userData.shape.clone();
                let currentPointVentana = ventana.userData.hole.currentPoint;
                for(let hole of shape.holes){
                    if(hole.currentPoint.x === currentPointVentana.x && hole.currentPoint.y === currentPointVentana.y){
                        var index = shape.holes.indexOf(hole);
                        shape.holes.splice(index,1);
                        break;
                    }
                }

                ventana.geometry = this.crearGeometriaVentana(width, height);
                ventana.geometry.computeBoundingBox();
                ventana.userData.width = width;
                ventana.userData.height = height;
                pared.userData.superficie += ventana.userData.superficie;
                ventana.userData.superficie = width * height;
                pared.userData.superficie -= ventana.userData.superficie;
                let bound = ventana.geometry.boundingBox;

                let vertices = [
                    new THREE.Vector2(bound.min.x + ventana.position.x, bound.min.y + ventana.position.y),
                    new THREE.Vector2(bound.min.x + ventana.position.x, bound.max.y + ventana.position.y),
                    new THREE.Vector2(bound.max.x + ventana.position.x, bound.max.y + ventana.position.y),
                    new THREE.Vector2(bound.max.x + ventana.position.x, bound.min.y + ventana.position.y),

                ];

                let hole = new THREE.Path(vertices);

                ventana.userData.hole = hole;

                shape.holes.push(hole);

                pared.geometry.dispose();
                pared.geometry.dynamic = true;
                pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
                pared.geometry.userData.shape = shape;
                pared.geometry.verticesNeedUpdate = true;

                this.actualizarTransmitanciaSuperficie(ventana);
                this.actualizarTransmitanciaSuperficie(pared);

            }
        }
    }


    modificarPuerta(puerta, width, height){
        let oldWidth = puerta.userData.width;
        let oldHeight = puerta.userData.height;

        let pared = puerta.parent;

        let habitacion = pared.parent.parent;

        if(oldHeight !== height || oldWidth !== width){
            if(height <= pared.userData.height && width <= 1 && height >= 0 && width >= 0){

                var shape = pared.geometry.userData.shape.clone();
                let currentPointPuerta = puerta.userData.hole.currentPoint;
                for(let hole of shape.holes){
                    if(hole.currentPoint.x === currentPointPuerta.x && hole.currentPoint.y === currentPointPuerta.y){
                        var index = shape.holes.indexOf(hole);
                        shape.holes.splice(index,1);
                        break;

                    }
                }
                puerta.geometry = this.crearGeometriaVentana(width, height);
                puerta.geometry.computeBoundingBox();
                puerta.userData.width = width;
                puerta.userData.height = height;
                pared.userData.superficie += puerta.userData.superficie;
                puerta.userData.superficie = width * height;
                pared.userData.superficie -= puerta.userData.superficie;
                let bound = puerta.geometry.boundingBox;

                let vertices = [
                    new THREE.Vector2(bound.min.x + puerta.position.x, bound.min.y + puerta.position.y),
                    new THREE.Vector2(bound.min.x + puerta.position.x, bound.max.y + puerta.position.y),
                    new THREE.Vector2(bound.max.x + puerta.position.x, bound.max.y + puerta.position.y),
                    new THREE.Vector2(bound.max.x + puerta.position.x, bound.min.y + puerta.position.y),

                ];

                let hole = new THREE.Path(vertices);

                puerta.userData.hole = hole;

                shape.holes.push(hole);

                pared.geometry.dispose();
                pared.geometry.dynamic = true;
                pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
                pared.geometry.userData.shape = shape;
                pared.geometry.verticesNeedUpdate = true;

                this.actualizarTransmitanciaSuperficie(puerta);
                this.actualizarTransmitanciaSuperficie(pared);

            }
        }
    }

    modificarParedHabitacion(pared, width, height) {
        let oldWidth = pared.userData.width;
        let oldHeight = pared.userData.height;

        let habitacion = pared.parent.parent;

        if (oldHeight !== height && height >= 1.9) {
            habitacion.userData.height = height;
            let oldVolume = habitacion.userData.volumen;
            this.casa.userData.volumen -= oldVolume;
            habitacion.userData.volumen = habitacion.userData.height * habitacion.userData.width * habitacion.userData.depth;
            this.casa.userData.volumen += habitacion.userData.volumen;

            let paredes = habitacion.getObjectByName("Paredes");

            for (let i = 0; i < paredes.children.length; i++) {
                let pared = paredes.children[i];
                let paredWidth = pared.userData.width;

                let superficieElementos = (pared.userData.width*pared.userData.height)-pared.userData.superficie;
                let killElements = [];
                for(let elemento of pared.children){
                    if(elemento.userData.tipo === Morfologia.tipos.VENTANA){
                        if(elemento.userData.height + elemento.position.y >= height){
                            killElements.push(elemento);
                        }
                    }else{
                        if(elemento.userData.height  >= height){
                            killElements.push(elemento);
                        }
                    }
                }
                var holes = pared.geometry.userData.shape.holes.slice(0);
                for(let element of killElements){
                    let index;
                    if(element.userData.tipo === Morfologia.tipos.VENTANA){
                        index = this.ventanas.indexOf(element);
                        this.ventanas.splice(index,1);

                    }else{
                        index = this.puertas.indexOf(element);
                        this.puertas.splice(index,1);
                    }
                    index = holes.indexOf(element.userData.hole);
                    holes.splice(index,1);
                    index = this.allObjects.indexOf(element);
                    this.allObjects.splice(index,1);
                    this.quitarTransmitanciaSuperficie(element);
                    pared.remove(element);
                    superficieElementos -= element.userData.superficie;
                }

                pared.geometry = this.crearGeometriaPared(paredWidth, height);
                var shape = pared.geometry.userData.shape.clone();
                shape.holes = holes;

                pared.geometry.dispose();
                pared.geometry.dynamic = true;
                pared.geometry = new THREE.ShapeBufferGeometry( shape ).clone();
                pared.geometry.userData.shape = shape;
                pared.geometry.verticesNeedUpdate = true;

                pared.userData.height = height;
                pared.userData.superficie = paredWidth * height - superficieElementos;

                this.actualizarTransmitanciaSuperficie(pared);

            }

            let techo = habitacion.getObjectByName("Techo");
            if(techo){
                if(pared.userData.orientacion.z !== 0){
                    techo.geometry = this.crearGeometriaTecho(width, habitacion.userData.depth, height);
                }else{
                    techo.geometry = this.crearGeometriaTecho(habitacion.userData.width, width, height);
                }
            }
            habitacion.userData.height = height;

            this.recalcularBalancePorVolumen(habitacion);

            let indiceNivel = habitacion.userData.nivel;

            for(let nivel of this.casa.children){
                if(nivel.userData.nivel > indiceNivel){
                    nivel.position.y += (height - oldHeight);
                }
            }
        }
        if (oldWidth !== width) {
            let end;
            let start = new THREE.Vector3(
                habitacion.userData.start.x,
                habitacion.userData.start.y,
                habitacion.userData.start.z
            );

            if (pared.userData.orientacion.z !== 0) {
                let x1 = start.x + width;
                let x2 = start.x - width;

                let dif = Math.abs(habitacion.userData.end.x - x1);
                let x = dif === 1 ? x1 : x2;

                end = new THREE.Vector3(
                    x,
                    habitacion.userData.end.y,
                    habitacion.userData.end.z
                );

            } else {
                let z1 = start.z + width;
                let z2 = start.z - width;

                let dif = Math.abs(habitacion.userData.end.z - z1);
                let z = dif === 1 ? z1 : z2;

                end = new THREE.Vector3(
                    habitacion.userData.end.x,
                    habitacion.userData.end.y,
                    z
                );

            }

            this.crecerHabitacionDibujada(habitacion, end, start);
        }
    }

    modificarHabitacionDesdePiso(piso, width, depth){
        let habitacion = piso.parent;
        let start = new THREE.Vector3(
            habitacion.userData.start.x,
            habitacion.userData.start.y,
            habitacion.userData.start.z
        );

        let end = new THREE.Vector3(
                start.x + width,
                start.y,
                start.z + depth,
            );

        this.crecerHabitacionDibujada(habitacion, end, start);
    }

    crecerHabitacionDibujada(habitacion, end, start) {
        let prevHabitacion = habitacion.clone();
        this.escena.remove(prevHabitacion);
        var dir = end.clone().sub(start);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len * 0.5);
        let pos = start.clone().add(dir);


        habitacion.position.copy(pos);
        habitacion.position.y = 0;

        habitacion.userData.end = end.clone();
        habitacion.userData.start = start.clone();

        //modificar geometrias paredes, piso y techo
        let paredes = habitacion.getObjectByName("Paredes");

        let width = Math.abs(start.x - end.x), depth = Math.abs(start.z - end.z);
        let widths = [width, depth, width, depth];
        let height = habitacion.userData.height;

        this.casa.userData.volumen -= habitacion.userData.volumen;
        habitacion.userData.volumen = width * height * depth;

        let oldWidth = habitacion.userData.width;
        let oldDepth = habitacion.userData.depth;

        habitacion.userData.height = height;
        habitacion.userData.width = width;
        habitacion.userData.depth = depth;
        habitacion.userData.area = depth * height;
        this.casa.userData.volumen += habitacion.userData.volumen;

        for (let i = 0; i < paredes.children.length; i++) {
            let pared = paredes.children[i];

            if(pared.userData.orientacion.z === 1) {
                pared.position.z = -depth / 2;
            }
            else if(pared.userData.orientacion.z === -1) {
                pared.position.z = depth / 2;
            }
            if(pared.userData.orientacion.x === 1){
                pared.position.x = -width / 2;
            }else if(pared.userData.orientacion.x === -1){
                pared.position.x = width / 2;
            }
            if(pared.userData.width !== widths[i]){
                pared.userData.width = widths[i];
                pared.userData.height = height;
                pared.userData.superficie = widths[i] * height;

                var holes = [];
                pared.geometry = this.crearGeometriaPared(widths[i], height);
                var shape = pared.geometry.userData.shape.clone();
                let killElements = [];
                for(let elemento of pared.children){
                    if (widths[i] < oldWidth) {
                        if (widths[i] % 2 === 0) {
                            if(pared.userData.orientacion.z !== 0){
                                elemento.position.x -= pared.userData.orientacion.z*0.5;
                            }else{
                                elemento.position.x += pared.userData.orientacion.x*0.5;
                            }
                        } else {
                            if(pared.userData.orientacion.z !== 0){
                                elemento.position.x += pared.userData.orientacion.z*0.5;
                            }else{
                                elemento.position.x -= pared.userData.orientacion.x*0.5;
                            }
                        }
                    } else {
                        if (widths[i] % 2 === 0) {
                            if(pared.userData.orientacion.z !== 0){
                                elemento.position.x -= pared.userData.orientacion.z*0.5;
                            }else{
                                elemento.position.x += pared.userData.orientacion.x*0.5;
                            }
                        } else {
                            if(pared.userData.orientacion.z !== 0){
                                elemento.position.x += pared.userData.orientacion.z*0.5;
                            }else{
                                elemento.position.x -= pared.userData.orientacion.x*0.5;
                            }
                        }
                    }

                    if(elemento.position.x < -pared.userData.width/2 || elemento.position.x > pared.userData.width/2){
                        killElements.push(elemento);
                    }else{
                        elemento.geometry.computeBoundingBox();
                        let bound = elemento.geometry.boundingBox;

                        let vertices = [
                            new THREE.Vector2(bound.min.x + elemento.position.x, bound.min.y + elemento.position.y),
                            new THREE.Vector2(bound.min.x + elemento.position.x, bound.max.y + elemento.position.y),
                            new THREE.Vector2(bound.max.x + elemento.position.x, bound.max.y + elemento.position.y),
                            new THREE.Vector2(bound.max.x + elemento.position.x, bound.min.y + elemento.position.y),
                        ];

                        elemento.userData.hole = new THREE.Path(vertices);

                        holes.push(elemento.userData.hole);
                        pared.userData.superficie -= elemento.userData.superficie;
                    }

                }
                for(let element of killElements){
                    let index;
                    if(element.userData.tipo === Morfologia.tipos.VENTANA){
                        index = this.ventanas.indexOf(element);
                        this.ventanas.splice(index,1);
                    }else{
                        index = this.puertas.indexOf(element);
                        this.puertas.splice(index,1);
                    }
                    index = this.allObjects.indexOf(element);
                    this.allObjects.splice(index,1);
                    this.quitarTransmitanciaSuperficie(element,habitacion);
                    pared.remove(element);
                }
                shape.holes = holes;

                pared.geometry.dispose();
                pared.geometry.dynamic = true;
                pared.geometry = new THREE.ShapeBufferGeometry( shape );
                pared.geometry.userData.shape = shape;
                pared.geometry.verticesNeedUpdate = true;

                this.actualizarTransmitanciaSuperficie(pared);
            }
        }

        if(oldWidth !== width){
            if(width < oldWidth){
                if(width % 2 === 0) habitacion.position.x += 1;
            }else{
                if(width % 2 !== 0) habitacion.position.x -= 1;
            }
        }
        if(oldDepth !== depth){
            if(depth < oldDepth){
                if(depth % 2 === 0) habitacion.position.z += 1;
            }else{
                if(depth % 2 !== 0) habitacion.position.z -= 1;
            }
        }

        habitacion.userData.start = new THREE.Vector3(habitacion.position.x-width/2,0,habitacion.position.z-depth/2).round();
        habitacion.userData.end = new THREE.Vector3(habitacion.position.x+width/2,0,habitacion.position.z+depth/2).round();

        let piso = habitacion.getObjectByName("Piso");
        this.casa.userData.area -= piso.userData.width * piso.userData.depth;
        piso.geometry = this.crearGeometriaPiso(width, depth);
        piso.userData.width = width;
        piso.userData.depth = depth;
        piso.userData.superficie = piso.userData.width * piso.userData.depth;
        this.casa.userData.area += piso.userData.superficie;
        piso.userData.perimetro = piso.userData.width * 2 + piso.userData.depth * 2;

        this.actualizarTransmitanciaSuperficie(piso);

        let techo = habitacion.getObjectByName("Techo");
        if(techo){
            techo.geometry = this.crearGeometriaTecho(width, depth, height);
            techo.userData.width = width;
            techo.userData.depth = depth;
            techo.userData.superficie = width * depth;

            this.actualizarTransmitanciaSuperficie(techo);
        }

        this.recalcularBalancePorVolumen(habitacion);

        habitacion.userData.error = this.casasChocan(habitacion);
        if(habitacion.userData.error){
            //console.log('yes');
            let prevEnd = new THREE.Vector3(
                prevHabitacion.userData.end.x,
                prevHabitacion.userData.end.y,
                prevHabitacion.userData.end.z,
            );
            let prevStart = new THREE.Vector3(
                prevHabitacion.userData.start.x,
                prevHabitacion.userData.start.y,
                prevHabitacion.userData.start.z,
            );
            this.crecerHabitacionDibujada(habitacion, prevEnd, prevStart);
            habitacion.position.copy(prevHabitacion.position);
        }
    }

    crecerHabitacion(nextPosition) {
        nextPosition.y = 0;
        let start = this.habitacionConstruccion.userData.start.clone();
        this.habitacionConstruccion.userData.end = nextPosition.clone();
        let end = nextPosition.clone();

        this.setErrorConstruccion(this.casasChocan(this.habitacionConstruccion));

        var dir = end.clone().sub(start);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len * 0.5);
        let pos = start.clone().add(dir);

        this.habitacionConstruccion.position.copy(pos);
        this.habitacionConstruccion.position.y = 0;

        //modificar geometrias paredes, piso y techo
        let paredes = this.habitacionConstruccion.getObjectByName("Paredes");

        let width = Math.abs(start.x - end.x), depth = Math.abs(start.z - end.z);
        let widths = [width, depth, width, depth];
        let height = this.habitacionConstruccion.userData.height;

        for (let i = 0; i < paredes.children.length; i++) {
            let pared = paredes.children[i];

            pared.geometry = this.crearGeometriaPared(widths[i], height);
            pared.userData.width = widths[i];
            pared.userData.height = height;
            if(pared.userData.orientacion.z === 1){
                pared.position.z = -depth / 2;
                if(start.x < end.x){
                    pared.userData.points = [start.x,end.x];
                }else{
                    pared.userData.points = [end.x,start.x];
                }
            }
            else if(pared.userData.orientacion.z === -1){
                pared.position.z = +depth / 2;
                if(start.x < end.x){
                    pared.userData.points = [start.x,end.x];
                }else {
                    pared.userData.points = [end.x, start.x];
                }
            }
            else if(pared.userData.orientacion.x === 1){
                pared.position.x = -width / 2;
                if(start.z < end.z){
                    pared.userData.points = [start.z,end.z];
                }else{
                    pared.userData.points = [end.z,start.z];
                }
            }
            else if(pared.userData.orientacion.x === -1){
                pared.position.x = +width / 2;
                if(start.z < end.z){
                    pared.userData.points = [start.z,end.z];
                }else{
                    pared.userData.points = [end.z,start.z];
                }
            }
        }

        let piso = this.habitacionConstruccion.getObjectByName("Piso");
        piso.geometry = this.crearGeometriaPiso(width, depth);
        piso.userData.width = width;
        piso.userData.depth = depth;

        let techo = this.habitacionConstruccion.getObjectByName("Techo");
        if(techo){
            techo.geometry = this.crearGeometriaTecho(width, depth, height);
            techo.userData.width = width;
            techo.userData.depth = depth;
        }

        this.habitacionConstruccion.userData.volumen = width * height * depth;
        this.habitacionConstruccion.userData.height = height;
        this.habitacionConstruccion.userData.width = width;
        this.habitacionConstruccion.userData.depth = depth;


    }

    crearCasaVacia()    {
        this.paredesX.splice(0, this.paredesX.length);
        this.paredesZ.splice(0, this.paredesZ.length);
        this.paredes.splice(0, this.paredes.length);
        this.ventanas.splice(0, this.ventanas.length);
        this.puertas.splice(0, this.puertas.length);
        this.pisos.splice(0, this.pisos.length);
        this.allObjects.splice(0, this.allObjects.length);
        let casa = this.escena.getObjectByName("casa");
        this.escena.remove(casa);
        this.casa = new THREE.Group();
        this.casa.name = "casa";
        var nivel = new THREE.Group();
        nivel.userData.nivel = 1;

        this.casa.add(nivel);

        this.escena.add(this.casa);

        this.casa.userData.aporteInterno = 0;
        this.casa.userData.perdidaVentilacion = 0;
        this.casa.userData.perdidaPorConduccion = 0;
        this.casa.userData.perdidaVentilacionObjetivo = 0;
        this.casa.userData.perdidaPorConduccionObjetivo = 0;
        this.casa.userData.transmitanciaSuperficies = 0;
        this.casa.userData.transmitanciaSuperficiesObjetivo = 0;
        this.casa.userData.volumen = 0;
        this.casa.userData.area = 0;

        this.casa.userData.periodo = this.periodo;
    }


    crearHabitacion(width, height, depth, nivel) {
        var habitacion = new THREE.Group();

        habitacion.userData.aporteInterno = 0;
        habitacion.userData.perdidaVentilacion = 0;
        habitacion.userData.perdidaVentilacionObjetivo = 0;
        habitacion.userData.perdidaPorConduccion = 0;
        habitacion.userData.perdidaPorConduccionObjetivo = 0;
        habitacion.userData.transmitanciaSuperficies = 0;
        habitacion.userData.transmitanciaSuperficiesObjetivo = 0;
        habitacion.userData.puenteTermico = 0;
        habitacion.userData.puenteTermicoObjetivo = 0;

        habitacion.position.y = (nivel - 1) * height;

        var paredes = new THREE.Group();
        paredes.name = "Paredes";

        var halfWidth = width / 2;
        var halfDepth = depth / 2;

        var pared1 = this.crearMeshPared(width, height);
        pared1.position.z = pared1.position.z + halfDepth;
        0 + this.angleRotated > -180 && 0 + this.angleRotated <= 180 ? pared1.userData.gamma = 0 + this.angleRotated : pared1.userData.gamma = 0+this.angleRotated -360;
        pared1.userData.orientacion = new THREE.Vector3(0,0,-1);
        pared1.userData.width = width;
        pared1.userData.height = height;
        pared1.userData.choques = {};
        pared1.userData.tipo = Morfologia.tipos.PARED;
        pared1.userData.separacion = Morfologia.separacion.EXTERIOR;
        //pared1.add(new THREE.AxesHelper(5));

        var pared2 = this.crearMeshPared(depth, height);
        pared2.rotation.y = Math.PI / 2;
        pared2.position.x = pared2.position.x + halfWidth;
        -90 + this.angleRotated > -180 && -90 + this.angleRotated <= 180 ? pared2.userData.gamma = -90 + this.angleRotated : pared2.userData.gamma = -90+this.angleRotated -360;
        pared2.userData.orientacion = new THREE.Vector3(-1,0,0);
        pared2.userData.width = depth;
        pared2.userData.height = height;
        pared2.userData.choques = {};
        pared2.userData.tipo = Morfologia.tipos.PARED;
        pared2.userData.separacion = Morfologia.separacion.EXTERIOR;
        //pared2.add(new THREE.AxesHelper(5));

        var pared3 = this.crearMeshPared(width, height);
        pared3.rotation.y = Math.PI;
        pared3.position.z = pared3.position.z - halfDepth;
        180 + this.angleRotated > -180 && 180 + this.angleRotated <= 180 ? pared3.userData.gamma = 180 + this.angleRotated : pared3.userData.gamma = 180+this.angleRotated -360;
        pared3.userData.orientacion = new THREE.Vector3(0,0,1);
        pared3.userData.width = width;
        pared3.userData.height = height;
        pared3.userData.choques = {};
        pared3.userData.tipo = Morfologia.tipos.PARED;
        pared3.userData.separacion = Morfologia.separacion.EXTERIOR;
        //pared3.add(new THREE.AxesHelper(5));

        var pared4 = this.crearMeshPared(depth, height);
        pared4.rotation.y = -Math.PI / 2;
        pared4.position.x = pared4.position.x - halfWidth;
        90 + this.angleRotated > -180 && 90 + this.angleRotated <= 180 ? pared4.userData.gamma = 90 + this.angleRotated : pared4.userData.gamma = 90+this.angleRotated -360;
        pared4.userData.orientacion = new THREE.Vector3(1,0,0);
        pared4.userData.width = depth;
        pared4.userData.height = height;
        pared4.userData.choques = {};
        pared4.userData.tipo = Morfologia.tipos.PARED;
        pared4.userData.separacion = Morfologia.separacion.EXTERIOR;
        //pared4.add(new THREE.AxesHelper(5));

        var piso = this.crearMeshPiso(width, depth);
        piso.name = "Piso";
        piso.userData.width = width;
        piso.userData.depth = depth;
        piso.userData.tipo = Morfologia.tipos.PISO;
        piso.userData.aislacion = Morfologia.aislacionPiso.CORRIENTE;

        if(nivel === 1){
            piso.userData.separacion =  Morfologia.separacion.EXTERIOR;
        }else{
            piso.userData.separacion =  Morfologia.separacion.INTERIOR;
        }

        /*var techo = this.crearMeshTecho(width, depth, height);
        techo.userData.tipo = Morfologia.tipos.TECHO;
        techo.userData.separacion = Morfologia.separacion.EXTERIOR;
        techo.userData.width = width;
        techo.userData.depth = depth;
        techo.userData.height = height;
        techo.name = "Techo";*/

        paredes.add(pared1);
        paredes.add(pared2);
        paredes.add(pared3);
        paredes.add(pared4);

        habitacion.add(paredes);
        habitacion.add(piso);
        //habitacion.add(techo);

        habitacion.userData.volumen = width * height * depth;
        habitacion.userData.height = height;
        habitacion.userData.width = width;
        habitacion.userData.depth = depth;
        habitacion.userData.nivel = nivel;

        return habitacion;

    }

    crearGeometriaPared(width, height) {
        let x1 = width / -2, x2 = width / 2, y1 = 0, y2 = height;
        let vertices = [
            new THREE.Vector2(x1,y1),
            new THREE.Vector2(x1,y2),
            new THREE.Vector2(x2,y2),
            new THREE.Vector2(x2,y1),

        ];
        let ParedShape = new THREE.Shape(vertices);
        ParedShape.holes = [];


        let geometria = new THREE.ShapeBufferGeometry(ParedShape);
        geometria.userData.shape = ParedShape;

        return geometria;
    }

    crearGeometriaPiso(width, depth) {
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

    crearGeometriaTecho(width, depth, heigth) {
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

    crearGeometriaVentana(width, height) {
        let x1 = width / -2, x2 = width / 2, y1 = 0, y2 = height;
        let vertices = [
            new THREE.Vector2(x1,y1),
            new THREE.Vector2(x1,y2),
            new THREE.Vector2(x2,y2),
            new THREE.Vector2(x2,y1),

        ];
        let VentanaShape = new THREE.Shape(vertices);
        VentanaShape.holes = [];


        let geometria = new THREE.ShapeBufferGeometry(VentanaShape);
        geometria.userData.shape = VentanaShape;

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

    crearMeshVentana(width, height) {
        let geometria = this.crearGeometriaVentana(width, height);

        let ventana = new THREE.Mesh(geometria, this.materialVentanaConstruccion);
        ventana.userData.width = width;
        ventana.userData.height = height;

        return ventana;
    }

    crearMeshPuerta(width, height) {
        //Como son cuadrados, se utiliza la misma para el caso de la pared.
        let geometria = this.crearGeometriaVentana(width, height);

        let puerta = new THREE.Mesh(geometria, this.materialPuertaConstruccion);
        puerta.userData.width = width;
        puerta.userData.height = height;

        return puerta;
    }

    getCasa() {
        return this.casa;
    }

}

export default ManagerCasas
