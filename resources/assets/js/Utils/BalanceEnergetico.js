import * as THREE from 'three'

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
function aporteInterno(ocupantes, superficie, horasIluminacion) {
    const ilumuinacion = 1.5 * horasIluminacion * superficie;
    const aporte_usuarios = uso * ocupantes;
    const aportes = ilumuinacion + aporte_usuarios;

    let valor = 0;

    for(let dias of diasMeses){
        valor +=(aportes)*dias;
    }

    return valor;
}

function gradosDias(temperaturasMes, temperaturaConfort){
    let gd = 0;
    for(let i = 0 ; i < diasMeses.length ; i++){
        gd = gd + (temperaturaConfort - temperaturasMes[i])*diasMeses[i];
    }

    return gd;
}

function transmitanciaSuperficie(transmitanciaSuperficies, elementoNuevo) {
    let transmitancia = 0;
    for(let capa of elementoNuevo.userData.capas){
        transmitancia += capa.espesor / capa.conductividad;
    }
    transmitancia += resistenciasTermicasSuperficie[elementoNuevo.userData.tipo][elementoNuevo.userData.separacion];
    let u = 1 / transmitancia;
    elementoNuevo.userData.tramitancia = u * elementoNuevo.userData.superficie;
    return transmitanciaSuperficies + elementoNuevo.userData.tramitancia;
}

function cambioTransmitanciaSuperficie(tramitanciaSuperficie, elementoCambio) {
    tramitanciaSuperficie -= elementoCambio.userData.tramitancia;
    return tramitanciaSuperficie(tramitanciaSuperficie, elementoCambio);

}

function puenteTermico(piso){
    return piso.perimetro * transmitanciaLineal[piso.userData.aislacionPiso];
}

function perdidasVentilacion(volumenInterno, volmenAire, gradosDias) {
    return 24 * (0.34 * volmenAire * gradosDias * volumenInterno);
}

function perdidasConduccion(transmitanciaSuperficies, gradosDias, puenteTermico){
    return 24 * ((transmitanciaSuperficies + puenteTermico) * gradosDias );
}

function calcularGammaParedes(paredes, cardinalPointsCircle, circlePoints) {
    for (let pared of paredes) {
        var orientacionRaycaster = new THREE.Raycaster();
        orientacionRaycaster.set(new THREE.Vector3(), pared.userData.orientacion);
        var inter = orientacionRaycaster.intersectObject(cardinalPointsCircle);
        let interPoint = inter[0].point.add(inter[1].point);
        interPoint = interPoint.multiplyScalar(0.5);

        // var hex = 0xffff;
        // var arrowHelper = new THREE.ArrowHelper( inter[11].point, new THREE.Vector3(), 10, hex );
        // this.escena.add(arrowHelper);
        let closestDistance = 99;
        let closestPoint = {};
        let i = 0;
        let index = 0;

        for (let point of circlePoints) {
            let circlePoint = new THREE.Vector3(point.x, 0.001, point.y);
            let temp = circlePoint.distanceTo(interPoint);
            if (temp < closestDistance) {
                closestDistance = temp;
                closestPoint = circlePoint;
                index = i;
            }
            i++;
        }
        pared.gamma = transformDegreeToGamma(index);
    }
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

export { calcularGammaParedes , aporteInterno , gradosDias, perdidasVentilacion, perdidasConduccion, puenteTermico, cambioTransmitanciaSuperficie, transmitanciaSuperficie};