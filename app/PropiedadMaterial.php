<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
class PropiedadMaterial extends Model
{
    protected $table = 'propiedades_materiales';

    public function material(){
        return $this->belongsToMany('App\Material','material_tiene_propiedad','propiedad_id','material_id');
    }

}
