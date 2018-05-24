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
    // public function getComunaByPoint($lat,$lng){
    //   $R = 6371; // radio de la Tierra en metros
    //   $comuna_cercana = Comuna::first();
    //   $dist_mas_cercana = 1000;
    //   foreach (Comuna::all() as $comuna){
    //     $phi1 = deg2rad($lat);
    //     $phi2 = deg2rad( $comuna->centroide->getLat() );
    //     $delta_phi = deg2rad($comuna->centroide->getLat() - $lat );
    //     $delta_lambda = deg2rad($comuna->centroide->getLng() - $lng);
    //     $a = sin($delta_phi / 2) * sin($delta_phi / 2) +
    //          cos($phi1) * cos($phi2) * sin($delta_lambda / 2) * sin($delta_lambda /2);
    //     $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    //     $d = $R * $c;
    //     if($d < $dist_mas_cercana){
    //       $comuna_cercana = $comuna;
    //       $dist_mas_cercana = $d;
    //     }
    //   }
    //   return response($comuna_cercana);
    // }

    public function getComunaByPoint($lat,$lng){
      $point = new Point($lat,$lng);
      $ret = Comuna::contains('geometria',$point)->get();
      return response($ret);
    }




}
