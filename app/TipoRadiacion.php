<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TipoRadiacion extends Model
{
  /**
   * The table associated with the model.
   *
   * @var string
   */
   protected $table = 'tipos_radiacion';

   /**
     * Obtener las radiaciones del Tipo.
     */
    public function radiaciones()
    {
        return $this->hasMany('App\Radiacion', 'tipo', 'id');
    }
}
