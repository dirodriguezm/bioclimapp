<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TipoVentana extends Model
{
    protected $table = 'tipos_ventana';

    public function ventana(){
        return $this->hasMany('App\VentanaTienePropiedad');
    }
}
