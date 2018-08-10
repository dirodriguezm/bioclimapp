<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TipoMaterial extends Model
{
    protected $table = 'tipos_materiales';

    public function material(){
        return $this->belongsToMany('App\MaterialTienePropiedad','material_propiedad_tipo','tipo_id','material_propiedad_id');
    }
}
