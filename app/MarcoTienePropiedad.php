<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MarcoTienePropiedad extends Model
{
    protected $table = 'marco_tiene_propiedades';

    public function tipo(){
        return $this->belongsToMany('App\TipoMarco');
    }
}
