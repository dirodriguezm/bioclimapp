<?php

namespace App\Http\Controllers;
use App\Marco;
use App\MarcoTienePropiedad;
use App\PropiedadMarco;
use Illuminate\Http\Request;

class MarcoController extends Controller
{
    public function getAll(){
        return response(Marco::all());
    }

    public function getPropiedades($id){
        return response(Marco::find($id)->propiedades);
    }

    public function getTipos($id){
        $marco_propiedades = MarcoTienePropiedad::where('marco_id','=',$id)->get();
        $tipos = [];
        foreach ($marco_propiedades as $item) {
            foreach ($item->tipo as $tipo){
                array_push($tipos,$tipo);
            }
        }
        return response($tipos);
    }

    public function getInfoMarcos(){
        $response = [];
        foreach (Marco::all() as $marco){
            $obj = new \stdClass();
            $obj->material = $marco->nombre;
            $marco_propiedades = MarcoTienePropiedad::where('marco_id','=',$marco->id)->get();
            $tipos = [];
            $propiedades = [];
            foreach ($marco_propiedades as $item) {
                foreach ($item->tipo as $tipo){
                    $propiedad = PropiedadMarco::find($item->propiedad_id);
                    $tipo->propiedad = $propiedad;
                    array_push($tipos,$tipo);
                }
                if(count($tipos) > 0){
                    $obj->tipos = $tipos;
                }
                else{
                    $propiedad = PropiedadMarco::find($item->propiedad_id);
                    array_push($propiedades,$propiedad);
                    $obj->propiedades = $propiedades;
                }
            }
            array_push($response,$obj);
        }
        return response($response);
    }
}
