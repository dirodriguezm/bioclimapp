import * as THREE from 'three'
import * as BalanceEnergetico from "./BalanceEnergetico";
import axios from "axios";
import Morfologia from "../components/Morfologia";

class ManagerCasas {
    constructor(escena, paredes, ventanas, puertas, allObjects, ocupantes, horasIluminacion, aireRenovado, heightWall, zona) {
        this.escena = escena;
        this.paredes = paredes;
        this.paredesX = [];
        this.paredesZ = [];
        this.ventanas = ventanas;
        this.puertas = puertas;
        this.pisos = [];
        this.allObjects = allObjects;

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
        this.zona = zona;

        axios.get("https://bioclimapp.host/api/info_materiales")
            .then(response => this.getJsonMateriales(response))

        axios.get("https://bioclimapp.host/api/info_ventanas")
            .then(response => this.getJsonVentanas(response))

        axios.get("https://bioclimapp.host/api/info_marcos")
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

        this.materialTechoConstruccion = new THREE.MeshBasicMaterial({
            color: '#3d8179',
            opacity: 0,
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

        this.materialTechoConstruido = new THREE.MeshLambertMaterial({
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
        this.habitacionConstruccion = this.crearHabitacion(0, heightWall, 0, 1).clone();
        this.habitacionConstruccion.visible = false;
        //Ventana que dibuja nuevas ventanas
        this.ventanaConstruccion = this.crearMeshVentana(0.9, 0.6);
        this.ventanaConstruccion.visible = false;
        //Puerta que dibuja nuevas puertas
        this.puertaConstruccion = this.crearMeshPuerta(0.6, 1.8);
        this.puertaConstruccion.visible = false;

        escena.add(this.habitacionConstruccion);
        escena.add(this.ventanaConstruccion);
        escena.add(this.puertaConstruccion);

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
    }

    setPersonas(personas){
        this.ocupantes = personas;
        let aporteInternoTotal = 0;
        for(let nivel of this.casa.children){
            for(let habitacion of nivel.children){
                let superficie = habitacion.userData.depth * habitacion.userData.width;
                let aporteInterno = BalanceEnergetico.aporteInterno(personas,superficie,this.horasIluminacion,this.periodo);
                habitacion.userData.aporteInterno = aporteInterno;
                aporteInternoTotal += aporteInterno;
            }
        }
        this.casa.userData.aporteInterno = aporteInternoTotal;
    }
    setIluminacion(iluminacion){
        this.horasIluminacion = iluminacion;
        let aporteInternoTotal = 0;
        for(let nivel of this.casa.children){
            for(let habitacion of nivel.children){
                let superficie = habitacion.userData.depth * habitacion.userData.width;
                let aporteInterno = BalanceEnergetico.aporteInterno(this.ocupantes,superficie,iluminacion,this.periodo);
                habitacion.userData.aporteInterno = aporteInterno;
                aporteInternoTotal += aporteInterno;
            }
        }
        this.casa.userData.aporteInterno = aporteInternoTotal;
    }
    setAire(aire){
        this.aireRenovado = aire;
        let perdidaPorVentilacionTotal = 0;
        for(let nivel of this.casa.children){
            for(let habitacion of nivel.children){
                let volumen = habitacion.userData.volumen;
                let perdidaVentilacion = BalanceEnergetico.perdidasVentilacion(volumen,aire,this.gradoDias);
                habitacion.userData.perdidaPorVentilacion = perdidaVentilacion;
                perdidaPorVentilacionTotal += perdidaVentilacion;
            }
        }
        this.casa.userData.perdidaPorVentilacion = perdidaPorVentilacionTotal;
    }

    setGradosDias(gradoDias, periodo) {
        this.gradoDias = gradoDias;
        this.periodo = periodo;
        this.casa.userData.periodo = periodo;
        let perdidaPorVentilacionTotal = 0;
        let perdidaPorConduccionTotal = 0;
        for(let nivel of this.casa.children){
            for(let habitacion of nivel.children){
                let volumen = habitacion.userData.volumen;
                let transSup = habitacion.userData.transmitanciaSuperficies;
                let perdidaVentilacion = BalanceEnergetico.perdidasVentilacion(volumen,this.aireRenovado,gradoDias);
                let perdidaConduccion = BalanceEnergetico.perdidasConduccion(transSup,gradoDias,habitacion.userData.puenteTermico)
                habitacion.userData.perdidaPorVentilacion = perdidaVentilacion;
                habitacion.userData.perdidaPorConduccion = perdidaConduccion;
                perdidaPorVentilacionTotal += perdidaVentilacion;
                perdidaPorConduccionTotal += perdidaConduccion;
            }
        }
        this.casa.userData.perdidaPorVentilacion = perdidaPorVentilacionTotal;
        this.casa.userData.perdidaPorConduccion = perdidaPorConduccionTotal;
    }

    setStartHabitacion(start, raycaster) {
        this.habitacionConstruccion.userData.start = start.clone();
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

        console.log(transmitanciaSuperficies);

        transmitanciaSuperficies -= estructura.userData.transSup;
        BalanceEnergetico.transmitanciaSuperficie(estructura,this.zona);
        transmitanciaSuperficies += estructura.userData.transSup;
        if(estructura.userData.tipo === Morfologia.tipos.PISO){
            let puenteTermico = BalanceEnergetico.puenteTermico(estructura);

            estructura.userData.puenteTermico = puenteTermico.normal;
            estructura.userData.puenteTermicoObjetivo = puenteTermico.objetivo;
        }
        let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, habitacion.userData.puenteTermico);

        console.log(transmitanciaSuperficies);
        console.log(estructura.userData.transSup);

        this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;

        habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
        habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;

        this.casa.userData.transmitanciaSuperficies += transmitanciaSuperficies;
        this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;
    }

    casasChocan(habitacion) {

        let start = habitacion.userData.start.clone();
        start.y = 0;
        let end = habitacion.userData.end.clone();
        end.y = 0;

        var dirX = new THREE.Vector3(0,0,1).normalize();
        var dirZ = new THREE.Vector3(1,0,0).normalize();
        let origin = new THREE.Vector3(0,0.5,0);

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
            let arrow = new THREE.ArrowHelper(this.ray.ray.direction, this.ray.ray.origin, this.ray.far, 0xff0000);
            this.arrows.push(arrow);
            this.escena.add(arrow);
            if (intersects.length > 0) {
                for(let pared of intersects){
                    let distance = pared.distance;
                    distance = Math.round(distance);
                    if(distance > 0  &&  distance < lenZ){
                        this.escena.remove(arrow);
                        this.arrows.splice(this.arrows.indexOf(arrow));
                        arrow = new THREE.ArrowHelper(this.ray.ray.direction, this.ray.ray.origin, this.ray.far, 0xffff00);
                        this.arrows.push(arrow);
                        this.escena.add(arrow);
                        return true;
                    }else{
                        let paredes = habitacion.getObjectByName("Paredes");
                        if(distance === 0){
                            let paredNueva = paredes.children[0];
                            if(paredNueva.userData.choques[pared.object.id] === undefined){
                                paredNueva.userData.choques[pared.object.id] = [i];
                            }else{
                                paredNueva.userData.choques[pared.object.id].push(i);

                            }
                        }else{
                            let paredNueva = paredes.children[2];
                            if(paredNueva.userData.choques[pared.object.id] === undefined){
                                paredNueva.userData.choques[pared.object.id] = [i];
                            }else{
                                if(paredNueva.userData.choques[pared.object.id].indexOf(i) === -1){
                                    paredNueva.userData.choques[pared.object.id].push(i);
                                }
                            }
                        }
                        this.escena.remove(arrow);
                        this.arrows.splice(this.arrows.indexOf(arrow));
                        arrow = new THREE.ArrowHelper(this.ray.ray.direction, this.ray.ray.origin, this.ray.far, 0xff00ff);
                        this.arrows.push(arrow);
                        this.escena.add(arrow);
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
            let arrow = new THREE.ArrowHelper(this.ray.ray.direction, this.ray.ray.origin, this.ray.far, 0xff0000);
            this.arrows.push(arrow);
            this.escena.add(arrow);
            if (intersects.length > 0) {
                for(let pared of intersects){
                    let distance = pared.distance;
                    distance = Math.round(distance);
                    if(distance > 0  &&  distance < lenX){
                        this.escena.remove(arrow);
                        this.arrows.splice(this.arrows.indexOf(arrow));
                        arrow = new THREE.ArrowHelper(this.ray.ray.direction, this.ray.ray.origin, this.ray.far, 0xffff00);
                        this.arrows.push(arrow);
                        this.escena.add(arrow);
                        return true;
                    }else{
                        let paredes = habitacion.getObjectByName("Paredes");
                        if(distance === 0){
                            let paredNueva = paredes.children[1];
                            if(paredNueva.userData.choques[pared.object.id] === undefined){
                                paredNueva.userData.choques[pared.object.id] = [i];
                            }else{
                                if(paredNueva.userData.choques[pared.object.id].indexOf(i) === -1){
                                    paredNueva.userData.choques[pared.object.id].push(i);
                                }
                            }
                        }else{
                            let paredNueva = paredes.children[3];
                            if(paredNueva.userData.choques[pared.object.id] === undefined){
                                paredNueva.userData.choques[pared.object.id] = [i];
                            }else{
                                if(paredNueva.userData.choques[pared.object.id].indexOf(i) === -1){
                                    paredNueva.userData.choques[pared.object.id].push(i);
                                }
                            }
                        }
                        this.escena.remove(arrow);
                        this.arrows.splice(this.arrows.indexOf(arrow));
                        arrow = new THREE.ArrowHelper(this.ray.ray.direction, this.ray.ray.origin, this.ray.far, 0xff00ff);
                        this.arrows.push(arrow);
                        this.escena.add(arrow);
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
        let transmitanciaSuperficies = 0;
        let transmitanciaSuperficiesObjetivo = 0;

        let paredes = habitacion.getObjectByName("Paredes");

        //Se agregan las paredes al arreglo de paredes y objetos

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


            BalanceEnergetico.transmitanciaSuperficie(pared,this.zona);
            transmitanciaSuperficies += pared.userData.transSup;
            transmitanciaSuperficiesObjetivo += pared.userData.transSupObjetivo;

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

        BalanceEnergetico.transmitanciaSuperficie(piso,this.zona);
        transmitanciaSuperficies += piso.userData.transSup;
        transmitanciaSuperficiesObjetivo += piso.userData.transSupObjetivo;

        let puenteTermico = BalanceEnergetico.puenteTermico(piso);

        piso.userData.puenteTermico = puenteTermico.normal;
        piso.userData.puenteTermicoObjetivo = puenteTermico.objetivo;


        let techo = habitacion.getObjectByName("Techo");
        if(techo){
            techo.userData.superficie = techo.userData.width * techo.userData.depth;

            BalanceEnergetico.transmitanciaSuperficie(techo,this.zona);
            transmitanciaSuperficies += techo.userData.transSup;
            transmitanciaSuperficiesObjetivo += techo.userData.transSup;

            piso.userData.techo = techo;
        }

        let aporteInterno = BalanceEnergetico.aporteInterno(this.ocupantes, piso.userData.superficie, this.horasIluminacion, this.periodo);

        let perdidaPorVentilacion = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen, this.aireRenovado, this.gradoDias);
        let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, puenteTermico.normal);
        let perdidaPorVentilacionObjetivo = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen,this.aireRenovadoObjetivo,this.gradoDias);
        let perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficiesObjetivo,this.gradoDias,puenteTermico.objetivo);
        habitacion.userData.puenteTermico = puenteTermico.normal;
        habitacion.userData.puenteTermicoObjetivo = puenteTermico.objetivo;
        habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
        habitacion.userData.transmitanciaSuperficiesObjetivo = transmitanciaSuperficiesObjetivo;
        habitacion.userData.aporteInterno = aporteInterno;
        habitacion.userData.perdidaPorVentilacion = perdidaPorVentilacion;
        habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;
        habitacion.userData.perdidaPorVentilacionObjetivo = perdidaPorVentilacionObjetivo;
        habitacion.userData.perdidaPorConduccionObjetivo = perdidaPorConduccionObjetivo;

        let nivel = this.casa.children[habitacion.userData.nivel - 1];
        nivel.add(habitacion);

        this.casa.userData.aporteInterno += aporteInterno;
        this.casa.userData.perdidaPorVentilacion += perdidaPorVentilacion;
        this.casa.userData.perdidaPorConduccion += perdidaPorConduccion;
        this.casa.userData.perdidaPorVentilacionObjetivo += perdidaPorVentilacionObjetivo;
        this.casa.userData.perdidaPorConduccionObjetivo += perdidaPorConduccionObjetivo;
        this.casa.userData.area += habitacion.userData.depth * habitacion.userData.width;
        this.casa.userData.volumen += habitacion.userData.volumen;
        this.casa.updateMatrixWorld();
    }

    aumentarNivelHabitacion(habitacion){
        
        let pos = habitacion.position.clone();
        let prevNivel = habitacion.userData.nivel;
        habitacion.userData.nivel = prevNivel + 1;
        let piso = habitacion.getObjectByName("Piso");
        piso.userData.separacion =  Morfologia.separacion.INTERIOR;

       let puenteTermico = BalanceEnergetico.puenteTermico(piso);

        piso.userData.puenteTermico = puenteTermico.normal;
        piso.userData.puenteTermicoObjetivo = puenteTermico.objetivo;

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;
        habitacion.userData.puenteTermico = piso.userData.puenteTermico;
        habitacion.userData.puenteTermicoObjetivo = puenteTermico.objetivo;




        let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, habitacion.userData.puenteTermico);
        this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;

       //habitacion.position.y = (nivel - 1) *habitacion.userData.height;

        let nivel = habitacion.parent;
        nivel.remove(habitacion);

        nivel = new THREE.Group();
        this.casa.add(nivel);

        nivel.position.y = (habitacion.userData.nivel - 1) * habitacion.userData.height;
        nivel.userData.nivel = prevNivel + 1;
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
        this.paredesX.splice(0, this.paredesX.length);
        this.paredesZ.splice(0, this.paredesZ.length);
        this.paredes.splice(0, this.paredes.length);
        this.ventanas.splice(0, this.ventanas.length);
        this.puertas.splice(0, this.puertas.length);
        this.pisos.splice(0, this.pisos.length);
        this.allObjects.splice(0, this.allObjects.length);
        let casa = this.escena.getObjectByName("casa");
        this.escena.remove(casa);
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

        let pared = paredes1.children[3];

        let ventanas = pared.children;

        //TODO: ver por que no se están borrando

        for(let ventana of ventanas){
            this.ventanas.splice(this.ventanas.indexOf(ventana),1);
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

        let habitacion2 = this.crearCasaSimple();

        let paredes2 = habitacion2.getObjectByName("Paredes");

        pared = paredes2.children[1];

        ventanas = pared.children;

        for(let ventana of ventanas){
            
            this.ventanas.splice(this.ventanas.indexOf(ventana),1);
            this.allObjects.splice(this.allObjects.indexOf(ventana),1);
        }

        

        paredes2.remove(pared);
        this.paredes.splice( this.paredes.indexOf(pared), 1 );


        habitacion1.position.x = habitacion1.position.x - this.widthPredefinida/2 + 0.5;
        habitacion2.position.x = habitacion2.position.x + this.widthPredefinida/2 + 0.5;

        return [habitacion1, habitacion2];
        //habitacion2.rotation.y = Math.PI ;

    }

    crearCasaDobleDosPisos(){
        let habitaciones = this.crearCasaDoble();

        let habitacion = habitaciones[0];

        for(let habitacion of habitaciones){
            let techo = habitacion.getObjectByName("Techo");
            habitacion.remove(techo);

        }

        let nuevaHabitacion = this.crearCasaDoble();

        for(let habitacion of nuevaHabitacion){
            for(let pared of habitacion.getObjectByName("Paredes").children){
                for(let objeto of pared.children){
                    if(objeto.userData.tipo === Morfologia.tipos.PUERTA){
                        this.quitarObjetoPuerta(objeto);
                    }
                }
            }

            this.aumentarNivelHabitacion(habitacion);
        }

    }

    crearCasaSimpleDosPisos(){
        let habitacion = this.crearCasaSimple();

        let techo = habitacion.getObjectByName("Techo");
        habitacion.remove(techo);

        habitacion = this.crearCasaSimple();

        let pared = habitacion.getObjectByName("Paredes").children[2];
        for(let objeto of pared.children){
            if(objeto.userData.tipo === Morfologia.tipos.PUERTA){
                this.quitarObjetoPuerta(objeto);
            }
        }
        this.aumentarNivelHabitacion(habitacion);

    }

    borrarEstructura(objeto){
        switch (objeto.userData.tipo) {
            case Morfologia.tipos.PUERTA:
                this.quitarObjetoPuerta(objeto);
                break;
            case Morfologia.tipos.VENTANA:
                this.quitarObjetoVentana(objeto);
                break;
        }
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

        pared.remove(ventana);

        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;

        habitacion.userData.transmitanciaSuperficies -= ventana.userData.transSup;
        habitacion.userData.transmitanciaSuperficiesObjetivo -= ventana.userData.transSupObjetivo;
        habitacion.userData.perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
            habitacion.userData.transmitanciaSuperficies,
            this.gradoDias,
            habitacion.userData.puenteTermico
        );
        habitacion.userData.perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(
            habitacion.userData.transmitanciaSuperficiesObjetivo,
            this.gradoDias,
            habitacion.userData.puenteTermicoObjetivo
        );

        pared.userData.superficie += ventana.userData.superficie;

        this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo += habitacion.userData.perdidaPorConduccionObjetivo;

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



        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;

        habitacion.userData.transmitanciaSuperficies -= puerta.userData.transSup;
        habitacion.userData.transmitanciaSuperficiesObjetivo -= puerta.userData.transSupObjetivo;
        habitacion.userData.perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
            habitacion.userData.transmitanciaSuperficies,
            this.gradoDias,
            habitacion.userData.puenteTermico
        );
        habitacion.userData.perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(
            habitacion.userData.transmitanciaSuperficiesObjetivo,
            this.gradoDias,
            habitacion.userData.puenteTermicoObjetivo
        );

        pared.userData.superficie += puerta.userData.superficie;

        this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo += habitacion.userData.perdidaPorConduccionObjetivo;

        this.puertas.splice(this.puertas.indexOf(puerta),1);
        this.allObjects.splice(this.allObjects.indexOf(puerta),1);
        pared.remove(puerta);
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

        this.agregarTecho(habitacion);

        this.agregarHabitacion(habitacion);

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

                    point = new THREE.Vector3(0,1,-this.depthPredefinida/2);
                    this.moverPuertaConstruccion(pared, point);
                    this.agregarPuerta();

                    point = point = new THREE.Vector3(-(Math.floor(this.widthPredefinida/2)-1),1,-this.depthPredefinida/2);
                }else{
                    let point = new THREE.Vector3(Math.floor(this.widthPredefinida/2)-1,1,this.depthPredefinida/2);
                    this.moverVentanaConstruccion(pared, point.clone());
                    this.agregarVentana();

                    point = new THREE.Vector3(-(Math.floor(this.widthPredefinida/2)-1),1,this.depthPredefinida/2);
                    this.moverVentanaConstruccion(pared, point);
                    this.agregarVentana();


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
        habitacion.rotation.y = Math.PI ;
        return habitacion;
    }

    agregarPuerta() {
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

            this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;

            BalanceEnergetico.transmitanciaSuperficie(puerta,this.zona);
            habitacion.userData.transmitanciaSuperficies += puerta.userData.transSup;
            habitacion.userData.transmitanciaSuperficiesObjetivo += puerta.userData.transSupObjetivo;
            habitacion.userData.perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
                habitacion.userData.transmitanciaSuperficies,
                this.gradoDias,
                habitacion.userData.puenteTermico
            );
            habitacion.userData.perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(
                habitacion.userData.transmitanciaSuperficiesObjetivo,
                this.gradoDias,
                habitacion.userData.puenteTermicoObjetivo
            );

            pared.userData.superficie -= puerta.userData.superficie;

            this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;
            this.casa.userData.perdidaPorConduccionObjetivo += habitacion.userData.perdidaPorConduccionObjetivo;


            this.puertas.push(puerta);
            this.allObjects.push(puerta);
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
    }

    agregarVentana() {
        let pared = this.ventanaConstruccion.userData.pared;
        if (pared !== null) {

            let ventana = this.ventanaConstruccion.clone();
            let habitacion = pared.parent.parent;
            let orientacion = pared.userData.orientacion;
            ventana.userData.orientacion = new THREE.Vector3(orientacion.x, orientacion.y, orientacion.z);
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

            this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;
            this.casa.userData.perdidaPorConduccionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;
            BalanceEnergetico.transmitanciaSuperficie(ventana,this.zona);
            habitacion.userData.transmitanciaSuperficies += ventana.userData.transSup;
            habitacion.userData.transmitanciaSuperficiesObjetivo += ventana.userData.transSupObjetivo;
            habitacion.userData.perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
                habitacion.userData.transmitanciaSuperficies,
                this.gradoDias,
                habitacion.userData.puenteTermico
            );
            habitacion.userData.perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(
                habitacion.userData.transmitanciaSuperficiesObjetivo,
                this.gradoDias,
                habitacion.userData.puenteTermicoObjetivo
            );

            pared.userData.superficie -= ventana.userData.superficie;

            this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;
            this.casa.userData.perdidaPorConduccionObjetivo += habitacion.userData.perdidaPorConduccionObjetivo;

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

        /*let pos = this.ventanaConstruccion.position.clone().round();
        pared.worldToLocal(pos);
        pos.round();

        let error = false;
        for(let elementos of pared.children){
            if(elementos.position.x === pos.x){

                this.ventanaConstruccion.material = this.materialError.clone();
                this.ventanaConstruccion.userData.error = true;
                error = true;
                break;
            }
        }
        if(!error){
            this.ventanaConstruccion.material = this.materialVentanaConstruccion.clone();
        }*/
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

        /*let posclone = this.puertaConstruccion.position.clone().round();
        pared.worldToLocal(posclone);
        posclone.round();

        let error = false;
        for(let elementos of pared.children){
            if(elementos.position.x === posclone.x){

                this.puertaConstruccion.material = this.materialError.clone();
                this.puertaConstruccion.userData.error = true;
                error = true;
                break;
            }
        }
        if(!error){
            this.puertaConstruccion.material = this.materialVentanaConstruccion.clone();
        }*/

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

                ventana.position.y = altura;

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

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;

        if(oldHeight !== height || oldWidth !== width){
            if((height + ventana.position.y) <= pared.userData.height && width <= 1){

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

                this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;

                habitacion.transmitanciaSuperficies -= ventana.userData.transSup;
                BalanceEnergetico.transmitanciaSuperficie(ventana,this.zona);
                habitacion.transmitanciaSuperficies += ventana.userData.transSup;
                habitacion.perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
                    habitacion.transmitanciaSuperficies,
                    this.gradoDias,
                    habitacion.puenteTermico
                );

                this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;

            }
        }
    }


    modificarPuerta(puerta, width, height){
        let oldWidth = puerta.userData.width;
        let oldHeight = puerta.userData.height;

        let pared = puerta.parent;

        let habitacion = pared.parent.parent;

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;

        if(oldHeight !== height || oldWidth !== width){
            if(height <= pared.userData.height && width <= 1){

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

                this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;

                habitacion.transmitanciaSuperficies -= puerta.userData.transSup;
                BalanceEnergetico.transmitanciaSuperficie(puerta,this.zona);
                habitacion.transmitanciaSuperficies += puerta.userData.transSup;
                habitacion.perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
                    habitacion.transmitanciaSuperficies,
                    this.gradoDias,
                    habitacion.puenteTermico
                );

                this.casa.userData.perdidaPorConduccion += habitacion.userData.perdidaPorConduccion;

            }
        }
    }

    modificarParedHabitacion(pared, width, height) {
        let oldWidth = pared.userData.width;
        let oldHeight = pared.userData.height;

        let habitacion = pared.parent.parent;

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;
        let transmitanciaSuperficiesObjetivo = habitacion.userData.transmitanciaSuperficiesObjetivo;

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

                transmitanciaSuperficies -= pared.userData.transSup;
                transmitanciaSuperficiesObjetivo -= pared.userData.transSupObjetivo;
                BalanceEnergetico.transmitanciaSuperficie(pared,this.zona);
                transmitanciaSuperficies += pared.userData.transSup;
                transmitanciaSuperficiesObjetivo += pared.userData.transSupObjetivo;

            }

            let techo = habitacion.getObjectByName("Techo");
            if(techo){
                if(pared.userData.orientacion.z !== 0){
                    techo.geometry = this.crearGeometriaTecho(width, habitacion.userData.depth, height);
                }else{
                    techo.geometry = this.crearGeometriaTecho(habitacion.userData.width, width, height);
                }

            }


            let perdidaPorVentilacion = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen, this.aireRenovado, this.gradoDias);
            let perdidaPorVentilacionObjetivo = BalanceEnergetico.perdidasVentilacion(habitacion.userData.volumen,this.aireRenovadoObjetivo,this.gradoDias);
            let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficies, this.gradoDias, habitacion.userData.puenteTermico);
            let perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(transmitanciaSuperficiesObjetivo, this.gradoDias,habitacion.userData.puenteTermicoObjetivo);
            this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
            this.casa.userData.transmitanciaSuperficiesObjetivo -= habitacion.userData.transmitanciaSuperficiesObjetivo;
            this.casa.userData.perdidaPorVentilacion -= habitacion.userData.perdidaPorVentilacion;
            this.casa.userData.perdidaPorVentilacionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;
            this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;
            this.casa.userData.perdidaPorConduccionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;

            habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
            habitacion.userData.transmitanciaSuperficiesObjetivo = transmitanciaSuperficiesObjetivo;
            habitacion.userData.perdidaPorVentilacion = perdidaPorVentilacion;
            habitacion.userData.perdidaPorVentilacionObjetivo = perdidaPorVentilacionObjetivo;
            habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;
            habitacion.userData.perdidaPorConduccionObjetivo = perdidaPorConduccionObjetivo;

            this.casa.userData.transmitanciaSuperficies += transmitanciaSuperficies;
            this.casa.userData.transmitanciaSuperficiesObjetivo += transmitanciaSuperficiesObjetivo;
            this.casa.userData.perdidaPorVentilacion += perdidaPorVentilacion;
            this.casa.userData.perdidaPorVentilacionObjetivo += perdidaPorVentilacionObjetivo;
            this.casa.userData.perdidaPorConduccion += perdidaPorConduccion;
            this.casa.userData.perdidaPorConduccionObjetivo += perdidaPorConduccionObjetivo;
            habitacion.userData.height = height;

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

        if(oldWidth !== width){
            if(width < oldWidth){
                if(width % 2 === 0) habitacion.parent.position.x += 1;
            }else{
                if(width % 2 !== 0) habitacion.parent.position.x -= 1;
            }
        }
        if(oldDepth !== depth){
            if(depth < oldDepth){
                if(depth % 2 === 0) habitacion.parent.position.z += 1;
            }else{
                if(depth % 2 !== 0) habitacion.parent.position.z -= 1;
            }
        }

        habitacion.userData.height = height;
        habitacion.userData.width = width;
        habitacion.userData.depth = depth;
        this.casa.userData.volumen += habitacion.userData.volumen;

        let transmitanciaSuperficies = habitacion.userData.transmitanciaSuperficies;
        let transmitanciaSuperficiesObjetivo = habitacion.userData.transmitanciaSuperficiesObjetivo;

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
                        transmitanciaSuperficies -= elemento.userData.transSup;
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
                    pared.remove(element);
                }
                shape.holes = holes;

                pared.geometry.dispose();
                pared.geometry.dynamic = true;
                pared.geometry = new THREE.ShapeBufferGeometry( shape );
                pared.geometry.userData.shape = shape;
                pared.geometry.verticesNeedUpdate = true;

                transmitanciaSuperficies -= pared.userData.transSup;
                transmitanciaSuperficiesObjetivo -= pared.userData.transSupObjetivo;
                BalanceEnergetico.transmitanciaSuperficie(pared,this.zona);
                transmitanciaSuperficies += pared.userData.transSup;
                transmitanciaSuperficiesObjetivo += pared.userData.transSupObjetivo;
            }



        }

        let piso = habitacion.getObjectByName("Piso");
        this.casa.userData.area -= piso.userData.width * piso.userData.depth;
        piso.geometry = this.crearGeometriaPiso(width, depth);
        piso.userData.width = width;
        piso.userData.depth = depth;
        piso.userData.superficie = piso.userData.width * piso.userData.depth;
        this.casa.userData.area += piso.userData.superficie;
        piso.userData.perimetro = piso.userData.width * 2 + piso.userData.depth * 2;
        piso.userData.puenteTermico = BalanceEnergetico.puenteTermico(piso);

        transmitanciaSuperficies -= piso.userData.transSup;
        BalanceEnergetico.transmitanciaSuperficie(piso, this.zona);
        transmitanciaSuperficies += piso.userData.transSup;


        let puenteTermico = BalanceEnergetico.puenteTermico(piso);
        piso.userData.puenteTermico = puenteTermico.normal;
        piso.userData.puenteTermicoObjetivo = puenteTermico.objetivo;

        let techo = habitacion.getObjectByName("Techo");
        if(techo){
            techo.geometry = this.crearGeometriaTecho(width, depth, height);
            techo.userData.width = width;
            techo.userData.depth = depth;
            techo.userData.superficie = width * depth;

            transmitanciaSuperficies -= techo.userData.transSup;
            transmitanciaSuperficiesObjetivo -= techo.userData.transSupObjetivo;
            BalanceEnergetico.transmitanciaSuperficie(techo, this.zona);
            transmitanciaSuperficies += techo.userData.transSup;
            transmitanciaSuperficiesObjetivo += techo.userData.transSupObjetivo;
        }


        let perdidaPorVentilacion = BalanceEnergetico.perdidasVentilacion(
            habitacion.userData.volumen,
            this.aireRenovado,
            this.gradoDias);
        let perdidaPorVentilacionObjetivo = BalanceEnergetico.perdidasVentilacion(
            habitacion.userData.volumen,
            this.aireRenovadoObjetivo,
            this.gradoDias);
        let perdidaPorConduccion = BalanceEnergetico.perdidasConduccion(
            transmitanciaSuperficies,
            this.gradoDias,
            puenteTermico.normal);
        let perdidaPorConduccionObjetivo = BalanceEnergetico.perdidasConduccion(
            transmitanciaSuperficiesObjetivo,
            this.gradoDias,
            puenteTermico.objetivo);

        let aporteInterno = BalanceEnergetico.aporteInterno(
            this.ocupantes,
            piso.userData.superficie,
            this.horasIluminacion,
            this.periodo);

        this.casa.userData.transmitanciaSuperficies -= habitacion.userData.transmitanciaSuperficies;
        this.casa.userData.transmitanciaSuperficiesObjetivo -= habitacion.userData.transmitanciaSuperficiesObjetivo;
        this.casa.userData.aporteInterno -= habitacion.userData.aporteInterno;
        this.casa.userData.perdidaPorVentilacion -= habitacion.userData.perdidaPorVentilacion;
        this.casa.userData.perdidaPorVentilacionObjetivo -= habitacion.userData.perdidaPorVentilacionObjetivo;
        this.casa.userData.perdidaPorConduccion -= habitacion.userData.perdidaPorConduccion;
        this.casa.userData.perdidaPorConduccionObjetivo -= habitacion.userData.perdidaPorConduccionObjetivo;

        habitacion.userData.puenteTermico = puenteTermico.normal;
        habitacion.userData.puenteTermicoObjetivo = puenteTermico.objetivo;
        habitacion.userData.transmitanciaSuperficies = transmitanciaSuperficies;
        habitacion.userData.transmitanciaSuperficiesObjetivo = transmitanciaSuperficiesObjetivo;
        habitacion.userData.aporteIntero = aporteInterno;
        habitacion.userData.perdidaPorVentilacion = perdidaPorVentilacion;
        habitacion.userData.perdidaPorVentilacionObjetivo = perdidaPorVentilacionObjetivo;
        habitacion.userData.perdidaPorConduccion = perdidaPorConduccion;
        habitacion.userData.perdidaPorConduccionObjetivo = perdidaPorConduccionObjetivo;

        this.casa.userData.transmitanciaSuperficies += transmitanciaSuperficies;
        this.casa.userData.transmitanciaSuperficiesObjetivo += transmitanciaSuperficiesObjetivo;
        this.casa.userData.aporteInterno += aporteInterno;
        this.casa.userData.perdidaPorVentilacion += perdidaPorVentilacion;
        this.casa.userData.perdidaPorVentilacionObjetivo += perdidaPorVentilacionObjetivo;
        this.casa.userData.perdidaPorConduccion += perdidaPorConduccion;
    }

    crecerHabitacion(nextPosition) {
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
            switch (i) {
                case 0:
                    pared.position.z = -depth / 2;
                    if(start.x < end.x){
                        pared.userData.points = [start.x,end.x];
                    }else{
                        pared.userData.points = [end.x,start.x];
                    }

                    break;
                case 1:
                    pared.position.x = -width / 2;
                    if(start.z < end.z){
                        pared.userData.points = [start.z,end.z];
                    }else{
                        pared.userData.points = [end.z,start.z];
                    }

                    break;
                case 2:
                    pared.position.z = +depth / 2;
                    if(start.x < end.x){
                        pared.userData.points = [start.x,end.x];
                    }else{
                        pared.userData.points = [end.x,start.x];
                    }
                    break;
                case 3:
                    pared.position.x = +width / 2;
                    if(start.z < end.z){
                        pared.userData.points = [start.z,end.z];
                    }else{
                        pared.userData.points = [end.z,start.z];
                    }
                    break;
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
        this.casa != null ? this.casa.children = [] : this.casa;
        var casa = new THREE.Group();
        casa.name = "casa";
        var nivel = new THREE.Group();
        nivel.userData.nivel = 1;

        casa.add(nivel);

        this.escena.add(casa);

        casa.userData.aporteInterno = 0;
        casa.userData.perdidaPorVentilacion = 0;
        casa.userData.perdidaPorConduccion = 0;
        casa.userData.perdidaPorVentilacionObjetivo = 0;
        casa.userData.perdidaPorConduccionObjetivo = 0;
        casa.userData.volumen = 0;
        casa.userData.area = 0;

        this.casa = casa;
        this.casa.userData.periodo = this.periodo;
    }


    crearHabitacion(width, height, depth, nivel) {
        var habitacion = new THREE.Group();

        habitacion.position.y = (nivel - 1) * height;

        var paredes = new THREE.Group();
        paredes.name = "Paredes";

        var halfWidth = width / 2;
        var halfDepth = depth / 2;

        var pared1 = this.crearMeshPared(width, height);
        pared1.position.z = pared1.position.z + halfDepth;
        pared1.userData.gamma = 180;
        pared1.userData.orientacion = new THREE.Vector3(0,0,-1);
        pared1.userData.width = width;
        pared1.userData.height = height;
        pared1.userData.choques = {};
        pared1.userData.tipo = Morfologia.tipos.PARED;
        pared1.userData.separacion = Morfologia.separacion.EXTERIOR;

        var pared2 = this.crearMeshPared(depth, height);
        pared2.rotation.y = Math.PI / 2;
        pared2.position.x = pared2.position.x + halfWidth;
        pared2.userData.gamma = 90;
        pared2.userData.orientacion = new THREE.Vector3(-1,0,0);
        pared2.userData.width = depth;
        pared2.userData.height = height;
        pared2.userData.choques = {};
        pared2.userData.tipo = Morfologia.tipos.PARED;
        pared2.userData.separacion = Morfologia.separacion.EXTERIOR;

        var pared3 = this.crearMeshPared(width, height);
        pared3.rotation.y = Math.PI;
        pared3.position.z = pared3.position.z - halfDepth;
        pared3.userData.gamma = 0;
        pared3.userData.orientacion = new THREE.Vector3(0,0,1);
        pared3.userData.width = width;
        pared3.userData.height = height;
        pared3.userData.choques = {};
        pared3.userData.tipo = Morfologia.tipos.PARED;
        pared3.userData.separacion = Morfologia.separacion.EXTERIOR;

        var pared4 = this.crearMeshPared(depth, height);
        pared4.rotation.y = -Math.PI / 2;
        pared4.position.x = pared4.position.x - halfWidth;
        pared4.userData.gamma = -90;
        pared4.userData.orientacion = new THREE.Vector3(1,0,0);
        pared4.userData.width = depth;
        pared4.userData.height = height;
        pared4.userData.choques = {};
        pared4.userData.tipo = Morfologia.tipos.PARED;
        pared4.userData.separacion = Morfologia.separacion.EXTERIOR;

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
