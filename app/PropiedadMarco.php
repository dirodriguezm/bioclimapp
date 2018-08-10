<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PropiedadMarco extends Model
{
    protected $table = 'propiedades_ventanas';

    public function marco(){
        return $this->belongsToMany('App\Marco','marco_tiene_propiedad','propiedad_id','marco_id');
    }
}
