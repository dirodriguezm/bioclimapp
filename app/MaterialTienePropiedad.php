<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Builder;

class MaterialTienePropiedad extends Model
{
    protected $table = 'material_tiene_propiedad';

    public function tipo(){
        return $this->belongsToMany('App\TipoMaterial','material_propiedad_tipo','material_propiedad_id','tipo_id');
    }
}
