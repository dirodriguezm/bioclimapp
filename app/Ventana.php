<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Ventana extends Model
{
    protected $table = 'ventanas';

    public function propiedades(){
        return $this->belongsToMany('App\PropiedadVentana','ventana_tiene_propiedades','ventana_id','propiedad_id');
    }
}
