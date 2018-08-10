<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PropiedadMarco extends Model
{
    protected $table = 'propiedades_ventanas';

    public function marco(){
        return $this->belongsToMany('App\Marco');
    }
}
