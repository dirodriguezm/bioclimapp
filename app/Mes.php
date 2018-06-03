<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Mes extends Model
{
  /**
   * The table associated with the model.
   *
   * @var string
   */
   protected $table = 'meses';

   /**
     * Obtener las radiaciones del Mes.
     */
    public function radiaciones()
    {
        return $this->hasMany('App\Radiacion', 'mes', 'id');
    }

    /**
      * Obtener las temperaturas del Mes.
      */
     public function temperaturas()
     {
         return $this->hasMany('App\Temperatura', 'mes', 'id');
     }
}
