<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VentanaTienePropiedad extends Model
{
    protected $table = 'ventana_tiene_propiedades';

    public function tipo(){
        return $this->belongsToMany('App\TipoVentana','ventana_propiedad_tipo','ventana_propiedad_id','tipo_id');
    }
}
