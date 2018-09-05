import * as THREE from 'three'

const diasMeses = [31,28,31,30,31,30,31,31,30,31,30,31];
const uso = 1407.12;

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

function perdidasVentilacion(volumenInterno, volmenAire, gradosDias) {
    return 24 * (0.34 * volmenAire * gradosDias * volumenInterno);
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

export { calcularGammaParedes , aporteInterno , gradosDias, perdidasVentilacion};