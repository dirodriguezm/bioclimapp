<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Material extends Model
{

    protected $table = 'materiales';

    public function propiedades(){
        return $this->belongsToMany('App\PropiedadMaterial','material_tiene_propiedad','material_id','propiedad_id');
    }
}
