<?php

namespace App\Http\Controllers;

use App\PropiedadVentana;
use App\Ventana;
use App\VentanaTienePropiedad;
use Illuminate\Http\Request;

class VentanaController extends Controller
{
    public function getAll(){
        return response(Ventana::all());
    }

    public function getPropiedades($id){
        return response(Ventana::find($id)->propiedades);
    }

    public function getTipos($id){
        $ventana_propiedades = VentanaTienePropiedad::where('ventana_id','=',$id)->get();
        $tipos = [];
        foreach ($ventana_propiedades as $item) {
            foreach ($item->tipo as $tipo){
                array_push($tipos,$tipo);
            }
        }
        return response($tipos);
    }

    public function getInfoVentanas(){
        $response = [];
        foreach (Ventana::all() as $ventana){
            $obj = new \stdClass();
            $obj->material = $ventana->nombre;
            $ventana_propiedades = VentanaTienePropiedad::where('ventana_id','=',$ventana->id)->get();
            $tipos = [];
            $propiedades = [];
            foreach ($ventana_propiedades as $item) {
                foreach ($item->tipo as $tipo){
                    $propiedad = PropiedadVentana::find($item->propiedad_id);
                    $tipo->propiedad = $propiedad;
                    array_push($tipos,$tipo);
                }
                if(count($tipos) > 0){
                    $obj->tipos = $tipos;
                }
                else{
                    $propiedad = PropiedadVentana::find($item->propiedad_id);
                    array_push($propiedades,$propiedad);
                    $obj->propiedades = $propiedades;
                }
            }
            array_push($response,$obj);
        }
        return response($response);
    }
}
