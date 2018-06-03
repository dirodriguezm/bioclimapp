<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Comuna;
use Grimzy\LaravelMysqlSpatial\Types\Point;
use DB;

class ComunaController extends Controller
{
    /**
    * Obtener la comuna segun latitud
    * @param int $latitud
    * @return Response
    */
    public function getComunaByPoint($lat,$lng){
      $point = new Point($lat,$lng);
      $ret = Comuna::contains('geometria',$point)->get();
      return response($ret);
    }

    public function getTemperaturesById($id){
       $temps = Comuna::find($id)->temperaturas;
       return response($temps);
    }




}
