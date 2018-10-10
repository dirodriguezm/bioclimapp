import * as THREE from 'three'
import Morfologia from "../components/Morfologia";
var SunCalc = require('suncalc');

var periodo = [];
const diasMeses = [31,28,31,30,31,30,31,31,30,31,30,31];
const uso = 1407.12;
const resistenciasTermicasSuperficie = [
    [0.17 , 0.24] ,
    [0.17 , 0.24] ,
    [0.17 , 0.24] ,
    [0.14 , 0.10] ,
    [0.22 , 0.34] ];
const transmitanciaLineal = [1.4 , 1.2 , 1.0];
const uObjetivoMuro = [4,3,1.9,1.7,1.6,1.1,0.6];
const uObjetivoTecho = [0.84,0.6,0.47,0.38,0.33,0.28,0.25];
const uObjetivoPiso = [3.6,0.87,0.7,0.6,0.5,0.39,0.32];
//se simplifico el calculo del uso ya que es constante el multiplicar el perfilde uso con el coeficiente de usuario
function aporteInterno(ocupantes, superficie, horasIluminacion, periodo) {
    const ilumuinacion = 1.5 * horasIluminacion * superficie;
    const aporte_usuarios = uso * ocupantes;
    const aportes = ilumuinacion + aporte_usuarios;

    let valor = 0;

    for(let i = periodo[0]; i < periodo[1]; i++){
        valor +=(aportes)*diasMeses[i];
    }

    return valor;
}

function gradosDias(temperaturasMes, temperaturaConfort){
    let gd = 0;
    let periodo = [];
    for(let i = 0 ; i < temperaturasMes.length - 1 ; i++){
        if((temperaturaConfort - temperaturasMes[i]) > 0){
            if(periodo.length === 0){
                periodo.push(i);
            }
            gd = gd + (temperaturaConfort - temperaturasMes[i])*diasMeses[i];
        }else{
            if(periodo.length === 1){
                periodo.push(i-1);
            }
        }
    }
    if(periodo.length === 1){
        periodo.push(temperaturasMes.length - 2);
    }

    return [gd,periodo];
}

function transmitanciaSuperficie(elemento,zona) {
    let transmitancia = 0,u;
    switch (elemento.userData.tipo) {
        case Morfologia.tipos.PARED:
            for(let capa of elemento.userData.capas){
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.userData.separacion];
            u = 1 / transmitancia;
            elemento.userData.transmitancia = u;
            elemento.userData.transmitanciaObjetivo = uObjetivoMuro[zona-1];
            elemento.userData.transSup = u * elemento.userData.superficie;
            elemento.userData.transSupObjetivo = uObjetivoMuro[zona-1] * elemento.userData.superficie;
            break;
        case Morfologia.tipos.TECHO:
            for(let capa of elemento.userData.capas){
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.userData.separacion];
            u = 1 / transmitancia;
            elemento.userData.transmitancia = u;
            elemento.userData.transmitanciaObjetivo = uObjetivoTecho[zona-1];
            elemento.userData.transSup = u * elemento.userData.superficie;
            elemento.userData.transSupObjetivo = uObjetivoTecho[zona-1] * elemento.userData.superficie;
            break;
        case Morfologia.tipos.VENTANA:
            /*let casa = elemento.parent.parent.parent.parent.parent;
            let superficieParedes  = 0;
            let superficieVentanas = 0;
            for(let nivel of casa.children){
                for(let habitacion of nivel.children){
                    for(let paredes of habitacion.children){
                        for (let pared of paredes.children){
                            superficieParedes += pared.userData.superficie;
                            for(let ventana of pared.children){
                                superficieVentanas += ventana.superficie;
                            }
                        }
                    }
                }
            }*/
            elemento.userData.transSupObjetivo = 5.8 * elemento.userData.superficie;
            elemento.userData.transSup = elemento.userData.info_material.u * elemento.userData.superficie;
            break;

        case Morfologia.tipos.PUERTA:
            transmitancia += elemento.userData.info_material.espesor / elemento.userData.info_material.conductividad;
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.parent.userData.separacion];

            u = 1 / transmitancia;

            elemento.userData.transmitancia = u;
            elemento.userData.transmitanciaObjetivo = uObjetivoMuro[zona-1];
            elemento.userData.transSup = u * elemento.userData.superficie;
            elemento.userData.transSupObjetivo = uObjetivoMuro[zona-1] * elemento.userData.superficie;
            break;
    }

}

function cambioTransmitanciaSuperficie(tramitanciaSuperficie, elementoCambio) {
    tramitanciaSuperficie -= elementoCambio.userData.tramitancia;
    return tramitanciaSuperficie(tramitanciaSuperficie, elementoCambio);

}

function puenteTermico(piso){
    return piso.userData.perimetro * transmitanciaLineal[piso.userData.aislacion];
}

function perdidasVentilacion(volumenInterno, volmenAire, gradosDias) {
    return 24 * (0.34 * volmenAire * gradosDias * volumenInterno);
}

function perdidasConduccion(transmitanciaSuperficies, gradosDias, puenteTermico){
    return 24 * ((transmitanciaSuperficies + puenteTermico) * gradosDias );
}


function transformDegreeToGamma(degree) {
    if (degree > 270 && degree <= 360) degree = 180 - degree;
    else degree -= 90;
    return degree;
}

function transformGammaToDegree(gamma) {
    if (gamma < -90) gamma += 450;
    else gamma += 90;
    return gamma;
}

function getDayOfYear(date) {
    var now = date;
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);

}

function getHourAngle(date, sunTimes) {
    let dif = date - sunTimes.solarNoon;
    return (dif / 36e5) * 15;
}

function hourAngleToDate(date, angle, latitud, longitud) {
    let dif = (angle / 15) * 36e5;
    let solarNoon = SunCalc.getTimes(date, latitud, longitud).solarNoon;
    let solardate = dif + solarNoon.getTime();
    return new Date(solardate);
}

function sign(x) {
    if (x > 0) return 1;
    if (x < 0) return -1;
    if (x === 0) return 0;
}

function calcularAngulos(periodo, beta, latitud) {
    let now = new Date().getFullYear();
    let angulos=[];
    for(let date = new Date(now,periodo[0],15); date <= new Date(now,periodo[1],15); date.setMonth(date.getMonth()+1)){
        //
        let phi = latitud;
        let delta = 23.45 * Math.sin(toRadians(360 * (284 + getDayOfYear(date)) / 365));
        let w2 = toDegrees(Math.acos(-Math.tan(toRadians(phi)) * Math.tan(toRadians(delta))));
        angulos.push({
            date: new Date(date),
            phi: phi,
            delta: delta,
            w2: w2,
            w1: -w2
        });
    }

    //let theta = toDegrees(Math.acos(Math.sin(toRadians(delta)) * Math.sin(toRadians(phi)) * Math.cos(toRadians(beta))
    //    - Math.sin(toRadians(delta)) * Math.cos(toRadians(phi)) * Math.sin(toRadians(beta)) * Math.cos(toRadians(gamma))
    //    + Math.cos(toRadians(delta)) * Math.cos(toRadians(phi)) * Math.cos(toRadians(beta)) * Math.cos(toRadians(omega))
    //    + Math.cos(toRadians(delta)) * Math.sin(toRadians(phi)) * Math.sin(toRadians(beta)) * Math.cos(toRadians(gamma)) * Math.cos(toRadians(omega))
    //    + Math.cos(toRadians(delta)) * Math.sin(toRadians(beta)) * Math.sin(toRadians(gamma)) * Math.sin(toRadians(omega))));
    //let costhetaz = Math.cos(toRadians(phi)) * Math.cos(toRadians(delta)) * Math.cos(toRadians(omega))
    //    + Math.sin(toRadians(phi)) * Math.sin(toRadians(delta));
    //let thetaz = toDegrees(Math.acos(costhetaz));
    //let alfa_solar = toDegrees(Math.asin(costhetaz));
    //let gamma_solar = sign(omega) * Math.abs(toDegrees(Math.acos((Math.cos(toRadians(thetaz)) * Math.sin(toRadians(phi))
    //    - Math.sin(toRadians(delta))) / (Math.sin(toRadians(thetaz)) * Math.cos(toRadians(phi))))));
    return angulos;
}

function calcularGammasPared(gamma) {
    let gammas = {
        gamma1: 0,
        gamma2: 0
    };
    if (90 < gamma && gamma <= 180) {       // Cuadrante 1
        gammas.gamma1 = -270 + gamma;
        gammas.gamma2 = gamma - 90;
    }
    if (-180 < gamma && gamma <= -90) { // Cuadrante 2
        gammas.gamma1 = gamma + 90;
        gammas.gamma2 = 270 + gamma;
    }
    if (0 < gamma && gamma <= 90) { // Cuadrante 3
        gammas.gamma1 = -90 + gamma;
        gammas.gamma2 = 90 + gamma;
    }
    if (-90 < gamma && gamma <= 0) { // Cuadrante 4
        gammas.gamma1 = -90 + gamma;
        gammas.gamma2 = 90 + gamma;
    }
    return gammas;
}

function calcularOmegaPared(date, delta, gamma, latitud, longitud) {
    let dif = 100;
    let omega_m = -180;
    let gamma_sol = 0;
    while (Math.abs(dif) > 0.1 && omega_m < 180) {
        dif = gamma - gamma_sol;
        //let solardate = (omega_m / 15) * 36e5 + solarNoon.getTime();
        // let costhetaz = Math.cos(this.toRadians(phi)) * Math.cos(this.toRadians(delta)) * Math.cos(this.toRadians(omega_m))
        //                 + Math.sin(this.toRadians(phi)) * Math.sin(this.toRadians(delta));
        // let thetaz = Math.acos(costhetaz);
        // gamma_sol = this.sign(omega_m) * Math.abs( this.toDegrees(Math.acos((Math.cos(this.toRadians(thetaz)) * Math.sin(this.toRadians(phi))
        //               - Math.sin(this.toRadians(delta))) / (Math.sin(this.toRadians(thetaz)) * Math.cos(this.toRadians(phi))))));
        //let sun = SunCalc.getPosition(new Date(solardate),latitud,longitud);
        let sun = SunCalc.getPosition(hourAngleToDate(date,omega_m,latitud, longitud), latitud, longitud);
        gamma_sol = sun.azimuth * 180 / Math.PI;
        omega_m += 0.07;
    }
    return omega_m;
}

function calcularHoraIncidencia(gamma, w1, w2, omega_m, omega_t) {
    let wm = [0, 0]; // hora de incidencia en la mañana
    let wt = [0, 0]; // hora de incidencia en la tarde
    if ((90 < gamma && gamma <= 180) || (-180 < gamma && gamma <= -90)) {  //primer y segundo cuadrante
        wm = [Math.max(w1, omega_m)];
        wt = [Math.min(w2, omega_t)];
    }
    else { // tercer y cuarto cuadrante
        if (omega_m > w1) {
            wm[0] = w1;
            wt[0] = omega_m;
        }
        else {
            wm[0] = 180;
            wt[0] = 180;
        }
        if (omega_t < w2) {
            wm[1] = omega_t;
            wt[1] = w2;
        }
        else {
            wm[1] = 180;
            wt[1] = 180;
        }
    }

    return {wm: wm, wt: wt}
}

function calcularRB(angulo, gamma, omegas) {
    let a_Rb = [];
    let b_Rb = [];
    let R_ave = [];
    for (let i = 0; i < omegas.wm.length; i++) {
        let w1 = omegas.wm[i];
        let w2 = omegas.wt[i];
        a_Rb.push( (Math.sin(toRadians(angulo.delta)) * Math.sin(toRadians(angulo.phi))
            * Math.cos(toRadians(90)) - Math.sin(toRadians(angulo.delta))
            * Math.cos(toRadians(angulo.phi)) * Math.sin(toRadians(90))
            * Math.cos(toRadians(gamma))) * (w2 - w1) * (Math.PI / 180)
            + (Math.cos(toRadians(angulo.delta)) * Math.cos(toRadians(angulo.phi))
                * Math.cos(toRadians(90)) + Math.cos(toRadians(angulo.delta))
                * Math.sin(toRadians(angulo.phi)) * Math.sin(toRadians(90))
                * Math.cos(toRadians(gamma))) * (Math.sin(toRadians(w2)) - Math.sin(toRadians(w1)))
            - Math.cos(toRadians(angulo.delta)) * Math.sin(toRadians(90))
            * Math.sin(toRadians(gamma)) * (Math.cos(toRadians(w2)) - Math.cos(toRadians(w1))) );
        b_Rb.push( Math.cos(toRadians(angulo.phi)) * Math.cos(toRadians(angulo.delta))
            * (Math.sin(toRadians(w2)) - Math.sin(toRadians(w1)))
            + Math.sin(toRadians(angulo.delta)) * Math.sin(toRadians(angulo.phi))
            * (w2 - w1) * (Math.PI / 180) );
        R_ave.push( b_Rb[i] !== 0 ? a_Rb[i] / b_Rb[i] : 0 );
    }
    if (R_ave.length === 2 ) {
        if(R_ave[0] === 0) return Math.abs(R_ave[1]);
        if(R_ave[1] === 0) return Math.abs(R_ave[0]);
        return (R_ave[0] + R_ave[1]) / 2;
    }
    else {
        return Math.abs(R_ave[0]);
    }

}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}




function calcularRbParedes(paredes, latitud, longitud) {
    let periodo = paredes[0].parent.parent.parent.parent.userData.periodo;
    let angulos = calcularAngulos( periodo, 90,  latitud);
    for (let [index,pared] of paredes.entries()) {
        if(pared.userData.separacion === Morfologia.separacion.EXTERIOR) {
            let rbPared = [];
            let gammas = calcularGammasPared(pared.userData.gamma);
            for (let angulo of angulos) {
                let omega_mna = calcularOmegaPared(angulo.date, angulo.delta, gammas.gamma1, latitud, longitud);
                let omega_tde = calcularOmegaPared(angulo.date, angulo.delta, gammas.gamma2, latitud, longitud);
                let omegas = calcularHoraIncidencia(pared.userData.gamma, angulo.w1, angulo.w2, omega_mna, omega_tde);
                let Rb = calcularRB(angulo, pared.userData.gamma, omegas);
                rbPared.push(Rb);
                if (angulo.date.getMonth() === new Date().getMonth()) {
                    let omegasDate = {
                        wm: {
                            desde: omegas.wm[0] >= angulo.w1 && omegas.wm[0] <= angulo.w2 ?
                                hourAngleToDate(angulo.date, omegas.wm[0], latitud, longitud) : null,
                            //new Date((omegas.wm[0] / 15) * 36e5) : null,
                            hasta: omegas.wt[0] >= angulo.w1 && omegas.wt[0] <= angulo.w2 ?
                                hourAngleToDate(angulo.date, omegas.wt[0], latitud, longitud) : null,
                            //new Date((omegas.wt[0] / 15) * 36e5) : null
                        },
                        wt: {
                            desde: omegas.wm[1] >= angulo.w1 && omegas.wm[1] <= angulo.w2 ?
                                hourAngleToDate(angulo.date, omegas.wm[1], latitud, longitud) : null,
                            //new Date((omegas.wm[1] / 15) * 36e5): null,
                            hasta: omegas.wt[1] >= angulo.w1 && omegas.wt[1] <= angulo.w2 ?
                                hourAngleToDate(angulo.date, omegas.wt[1], latitud, longitud) : null,
                            //new Date((omegas.wt[1] / 15) * 36e5): null
                        },
                        rb: Rb
                    };
                    pared.userData.omegas = omegasDate;
                }
            }
            pared.userData.rb = rbPared;
        }
    }
    return paredes;
}

function calcularAporteSolar(periodo, ventanas, difusa, directa){
    let aporte_solar = 0;
    let igb_suma = 0;
    let area_ventanas_suma = 0;
    let f_suma = 0;
    for (let ventana of ventanas){
        let f = calcularF(ventana);
        f_suma += f;
        let pared = ventana.parent;
        let Igb = 0;
        for(let i = 0; i < (periodo[1]-periodo[0]); i++){
            Igb += calcularIgb(difusa,directa,pared.userData.rb[i]);
        }
        igb_suma += Igb;
        let area_ventana = Math.abs( (ventana.geometry.boundingBox.max.x - ventana.geometry.boundingBox.min.x) *
            (ventana.geometry.boundingBox.max.y - ventana.geometry.boundingBox.min.y) );
        area_ventanas_suma += area_ventana;
        aporte_solar += Igb * area_ventana * f;
    }
    return aporte_solar;

    // return {
    //     'Aporte Solar':aporte_solar,
    //     'Radiacion Solar': igb_suma,
    //     'Area de Ventanas': area_ventanas_suma,
    //     'Factor de Asoleamiento': f_suma
    // };
}

function calcularF(ventana){
    let fm = ventana.userData.info_marco.fs;
    let fs = ventana.userData.info_material.fs;
    let um = ventana.userData.info_marco.u;
    return ventana.userData.far * ((1-fm) * fs + (fm * 0.04 * um * 0.35));
}

function calcularIgb(difusa, directa, rb){
    return difusa * ((1+Math.cos(toRadians(90)))/2 ) + directa * rb;
}

export {perdidasConduccion, puenteTermico, cambioTransmitanciaSuperficie, transmitanciaSuperficie , aporteInterno , gradosDias, perdidasVentilacion, calcularF,
    calcularIgb, calcularAngulos, calcularHoraIncidencia, calcularOmegaPared, calcularRB,
    calcularGammasPared, hourAngleToDate, getHourAngle, calcularAporteSolar, calcularRbParedes};