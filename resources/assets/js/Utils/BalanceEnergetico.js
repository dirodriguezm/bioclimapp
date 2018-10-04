import * as THREE from 'three'
import Morfologia from "../components/Morfologia";
var SunCalc = require('suncalc');

//var periodo = [];
const diasMeses = [31,28,31,30,31,30,31,31,30,31,30,31];
const uso = 1407.12;
const resistenciasTermicasSuperficie = [
    [0.17 , 0.24] ,
    [0.17 , 0.24] ,
    [0.17 , 0.24] ,
    [0.14 , 0.10] ,
    [0.22 , 0.34] ];
const transmitanciaLineal = [1.4 , 1.2 , 1.0];

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

function transmitanciaSuperficie(elemento) {
    let transmitancia = 0,u;
    switch (elemento.userData.tipo) {
        case Morfologia.tipos.PARED:
            for(let capa of elemento.userData.capas){
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.userData.separacion];
            u = 1 / transmitancia;
            elemento.userData.transmitancia = u;
            elemento.userData.transSup = u * elemento.userData.superficie;
            break;
        case Morfologia.tipos.TECHO:
            for(let capa of elemento.userData.capas){
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.userData.separacion];
            u = 1 / transmitancia;
            elemento.userData.transmitancia = u;
            elemento.userData.transSup = u * elemento.userData.superficie;
            break;
        case Morfologia.tipos.VENTANA:
            elemento.userData.transSup = elemento.userData.info_material.u * elemento.userData.superficie;
            break;

        case Morfologia.tipos.PUERTA:
            transmitancia += elemento.userData.info_material.espesor / elemento.userData.info_material.conductividad;
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.parent.userData.separacion];

            u = 1 / transmitancia;

            elemento.userData.transmitancia = u;
            elemento.userData.transSup = u * elemento.userData.superficie;
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

function hourAngleToDate(angle, latitud, longitud) {
    let dif = (angle / 15) * 36e5;
    let solarNoon = SunCalc.getTimes(new Date(), latitud, longitud).solarNoon;
    let date = dif + solarNoon.getTime();
    return new Date(date);
}

function sign(x) {
    if (x > 0) return 1;
    if (x < 0) return -1;
    if (x === 0) return 0;
}

function calcularAngulos(gamma, beta, latitud, sunTimes) {
    let date = new Date();
    let phi = latitud;
    let omega = getHourAngle(date, sunTimes);
    let delta = 23.45 * Math.sin(toRadians(360 * (284 + getDayOfYear(date)) / 365));
    let w2 = toDegrees(Math.acos(-Math.tan(toRadians(phi)) * Math.tan(toRadians(delta))));
    let w1 = -w2;
    let theta = toDegrees(Math.acos(Math.sin(toRadians(delta)) * Math.sin(toRadians(phi)) * Math.cos(toRadians(beta))
        - Math.sin(toRadians(delta)) * Math.cos(toRadians(phi)) * Math.sin(toRadians(beta)) * Math.cos(toRadians(gamma))
        + Math.cos(toRadians(delta)) * Math.cos(toRadians(phi)) * Math.cos(toRadians(beta)) * Math.cos(toRadians(omega))
        + Math.cos(toRadians(delta)) * Math.sin(toRadians(phi)) * Math.sin(toRadians(beta)) * Math.cos(toRadians(gamma)) * Math.cos(toRadians(omega))
        + Math.cos(toRadians(delta)) * Math.sin(toRadians(beta)) * Math.sin(toRadians(gamma)) * Math.sin(toRadians(omega))));
    let costhetaz = Math.cos(toRadians(phi)) * Math.cos(toRadians(delta)) * Math.cos(toRadians(omega))
        + Math.sin(toRadians(phi)) * Math.sin(toRadians(delta));
    let thetaz = toDegrees(Math.acos(costhetaz));
    let alfa_solar = toDegrees(Math.asin(costhetaz));
    let gamma_solar = sign(omega) * Math.abs(toDegrees(Math.acos((Math.cos(toRadians(thetaz)) * Math.sin(toRadians(phi))
        - Math.sin(toRadians(delta))) / (Math.sin(toRadians(thetaz)) * Math.cos(toRadians(phi))))));
    return {
        date: date,
        phi: phi,
        omega: omega,
        delta: delta,
        w2: w2,
        w1: w1,
        theta: theta,
        costhetaz: costhetaz,
        alfa_solar: alfa_solar,
        gamma_solar: gamma_solar,
    }
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

function calcularOmegaPared(phi, delta, gamma, latitud, longitud) {
    let dif = 1;
    let omega_m = -180;
    let gamma_m = 0;
    while (Math.abs(dif) > 0.1) {
        dif = gamma - gamma_m;
        // let costhetaz = Math.cos(this.toRadians(phi)) * Math.cos(this.toRadians(delta)) * Math.cos(this.toRadians(omega_m))
        //                 + Math.sin(this.toRadians(phi)) * Math.sin(this.toRadians(delta));
        // let thetaz = Math.acos(costhetaz);
        // gamma_m = this.sign(omega_m) * Math.abs( this.toDegrees(Math.acos((Math.cos(this.toRadians(thetaz)) * Math.sin(this.toRadians(phi))
        //               - Math.sin(this.toRadians(delta))) / (Math.sin(this.toRadians(thetaz)) * Math.cos(this.toRadians(phi))))));
        let sun = SunCalc.getPosition(hourAngleToDate(omega_m,latitud, longitud), latitud, longitud);
        gamma_m = sun.azimuth * 180 / Math.PI;
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
            wm[0] = Math.min(w1,omega_m);
            wt[0] = Math.max(omega_m,w1);
        }
        else {
            wm[0] = 180;
            wt[0] = 180;
        }
        if (omega_t < w2) {
            wm[1] = Math.min(omega_t,w2);
            wt[1] = Math.max(w2,omega_t);
        }
        else {
            wm[1] = 180;
            wt[1] = 180;
        }
    }

    return {wm: wm, wt: wt}
}

function calcularRB(angulos, pared, omegas) {
    let a_Rb = [];
    let b_Rb = [];
    let R_ave = [];
    for (let i = 0; i < omegas.wm.length; i++) {
        let w1 = omegas.wm[i];
        let w2 = omegas.wt[i];
        a_Rb.push( (Math.sin(toRadians(angulos.delta)) * Math.sin(toRadians(angulos.phi))
            * Math.cos(toRadians(90)) - Math.sin(toRadians(angulos.delta))
            * Math.cos(toRadians(angulos.phi)) * Math.sin(toRadians(90))
            * Math.cos(toRadians(pared.userData.gamma))) * (w2 - w1) * (Math.PI / 180)
            + (Math.cos(toRadians(angulos.delta)) * Math.cos(toRadians(angulos.phi))
                * Math.cos(toRadians(90)) + Math.cos(toRadians(angulos.delta))
                * Math.sin(toRadians(angulos.phi)) * Math.sin(toRadians(90))
                * Math.cos(toRadians(pared.userData.gamma))) * (Math.sin(toRadians(w2)) - Math.sin(toRadians(w1)))
            - Math.cos(toRadians(angulos.delta)) * Math.sin(toRadians(90))
            * Math.sin(toRadians(pared.userData.gamma)) * (Math.cos(toRadians(w2)) - Math.cos(toRadians(w1))) );
        b_Rb.push( Math.cos(toRadians(angulos.phi)) * Math.cos(toRadians(angulos.delta))
            * (Math.sin(toRadians(w2)) - Math.sin(toRadians(w1)))
            + Math.sin(toRadians(angulos.delta)) * Math.sin(toRadians(angulos.phi))
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

function calcularF(ventana){
    let fm = ventana.userData.info_marco.fs;
    let fs = ventana.userData.info_material.fs;
    let um = ventana.userData.info_marco.u;
    return ventana.userData.far * ((1-fm) * fs + (fm * 0.04 * um * 0.35));
}

function calcularIgb(difusa, directa, rb){
    return difusa * ((1+Math.cos(toRadians(90)))/2 ) + directa * rb;
}

function calcularAporteSolar(ventanas, difusa, directa){
    let aporte_solar = 0;
    let igb_suma = 0;
    let area_ventanas_suma = 0;
    let f_suma = 0;
    for (let ventana of ventanas){
        let f = calcularF(ventana);
        f_suma += f;
        let pared = ventana.parent;
        let Igb = calcularIgb(difusa, directa, pared.userData.rb);
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

function calcularRbParedes(paredes, latitud, longitud, sunTimes) {
    for (let pared of paredes) {
        let angulos = calcularAngulos(pared.userData.gamma, 90,  latitud,  sunTimes);
        let sun = SunCalc.getPosition(hourAngleToDate(angulos.omega,  latitud,  longitud),  latitud,  longitud);
        let azimuth = sun.azimuth * 180 / Math.PI;
        let gammas = calcularGammasPared(pared.userData.gamma);
        let omega_mna = calcularOmegaPared(angulos.phi, angulos.delta, gammas.gamma1,  latitud,  longitud);
        let omega_tde = calcularOmegaPared(angulos.phi, angulos.delta, gammas.gamma2,  latitud,  longitud);
        let omegas = calcularHoraIncidencia(pared.userData.gamma, angulos.w1, angulos.w2, omega_mna, omega_tde);

        let omegasDate = {
            wm: {
                desde: omegas.wm[0] >= angulos.w1 && omegas.wm[0] <= angulos.w2 ?
                    hourAngleToDate(omegas.wm[0], latitud,  longitud) : null,
                hasta: omegas.wt[0] >= angulos.w1 && omegas.wt[0] <= angulos.w2 ?
                    hourAngleToDate(omegas.wt[0], latitud,  longitud) : null
            },
            wt: {
                desde: omegas.wm[1] >= angulos.w1 && omegas.wm[1] <= angulos.w2 ?
                    hourAngleToDate(omegas.wm[1], latitud,  longitud): null,
                hasta: omegas.wt[1] >= angulos.w1 && omegas.wt[1] <= angulos.w2 ?
                    hourAngleToDate(omegas.wt[1], latitud,  longitud): null
            }
        };

        let Rb = calcularRB(angulos, pared, omegas);
        pared.userData.omegas = omegasDate;
        pared.userData.rb = Rb;
    }
    return paredes;
}

export {perdidasConduccion, puenteTermico, cambioTransmitanciaSuperficie, transmitanciaSuperficie , aporteInterno , gradosDias, perdidasVentilacion, calcularF,
    calcularIgb, calcularAngulos, calcularHoraIncidencia, calcularOmegaPared, calcularRB,
    calcularGammasPared, hourAngleToDate, getHourAngle, calcularAporteSolar, calcularRbParedes};