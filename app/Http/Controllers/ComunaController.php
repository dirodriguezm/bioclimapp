<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;

class ComunaController extends Controller
{
    /**
    * Obtener la comuna segun latitud
    * @param int $latitud
    * @return Response
    */
    public function getComunaByLat($latitud){
      $result = DB::table('comunas')
            ->select('*', DB::raw("ABS(latitud + $latitud) AS distance"))
            ->orderBy('distance')
            ->limit(1)
            ->get();
      return response($result);
    }
}
