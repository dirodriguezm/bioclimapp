<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PropiedadVentana extends Model
{

    protected $table = 'propiedades_ventanas';

    public function ventana(){
        return $this->belongsToMany('App\Ventana');
    }
}
