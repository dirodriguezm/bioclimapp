<?php

namespace App\Http\Controllers;

use App\MaterialTienePropiedad;
use App\PropiedadMaterial;
use Illuminate\Http\Request;
use App\Material;

class MaterialController extends Controller
{
    public function getAll(){
        return response(Material::all());
    }
    public function getPropiedades($id){
        return response(Material::find($id)->propiedades);
    }

    public function getTipos($id){
        $material_propiedades = MaterialTienePropiedad::where('material_id','=',$id)->get();
        $tipos = [];
        foreach ($material_propiedades as $item) {
            foreach ($item->tipo as $tipo){
                array_push($tipos,$tipo);
            }
        }
        return response($tipos);
    }

    public function getInfoMateriales(){
        $response = [];

        foreach (Material::all() as $material){
            $obj = new \stdClass();
            $obj->material = $material->nombre;
            $obj->color = $material->color;
            $material_propiedades = MaterialTienePropiedad::where('material_id','=',$material->id)->get();
            $tipos = [];
            $propiedades = [];
            foreach ($material_propiedades as $item) {
                foreach ($item->tipo as $tipo){
                    $propiedad = PropiedadMaterial::find($item->propiedad_id);
                    if(count($tipos) > 0){
                        if($tipos[count($tipos)-1]->id == $tipo->id){
                            $propiedadesTipo = $tipos[count($tipos)-1]->propiedades;
                            array_push($propiedadesTipo, $propiedad);
                            $tipos[count($tipos)-1]->propiedades = $propiedadesTipo;
                        }else{
                            $tipo->propiedades = [];
                            $propiedadesTipo = $tipo->propiedades;
                            array_push($propiedadesTipo, $propiedad);
                            $tipo->propiedades = $propiedadesTipo;
                            array_push($tipos,$tipo);
                        }
                    }else{
                        $tipo->propiedades = [];
                        $propiedadesTipo = $tipo->propiedades;
                        array_push($propiedadesTipo, $propiedad);
                        $tipo->propiedades = $propiedadesTipo;
                        array_push($tipos,$tipo);
                    }
                }
                if(count($tipos) > 0){
                    $obj->tipos = $tipos;
                }
                else{
                    $propiedad = PropiedadMaterial::find($item->propiedad_id);
                    array_push($propiedades,$propiedad);
                    $obj->propiedades = $propiedades;
                }
            }

            array_push($response,$obj);
        }
        return response($response);
    }
}
