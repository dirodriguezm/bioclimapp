<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Ventana extends Model
{
    protected $table = 'ventanas';

    public function propiedades(){
        return $this->hasMany('App\PropiedadVentana');
    }
}
