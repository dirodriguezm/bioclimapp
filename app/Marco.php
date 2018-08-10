<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Marco extends Model
{
    protected $table = 'marcos';

    public function propiedades(){
        return $this->hasMany('App\PropiedadMarco');
    }
}
