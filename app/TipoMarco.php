<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TipoMarco extends Model
{
    protected $table = 'tipos_marcos';

    public function ventana(){
        return $this->belongsToMany('App\MarcoTienePropiedad','marco_propiedad_tipo','tipo_id','marco_propiedad_id');
    }
}
