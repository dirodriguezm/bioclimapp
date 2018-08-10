<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Marco extends Model
{
    protected $table = 'marcos';

    public function propiedades(){
        return $this->belongsToMany('App\PropiedadMarco','marco_tiene_propiedades','marco_id','propiedad_id');
    }
}
