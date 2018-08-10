<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TipoMarco extends Model
{
    protected $table = 'tipos_marcos';

    public function ventana(){
        return $this->hasMany('App\MarcoTienePropiedad');
    }
}
