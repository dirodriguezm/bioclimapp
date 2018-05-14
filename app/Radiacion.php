<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Radiacion extends Model
{
  /**
   * The table associated with the model.
   *
   * @var string
   */
   protected $table = 'radiaciones';

   /**
     * Obtener la comuna de la radiacion.
     */
    public function comuna()
    {
        return $this->belongsTo('App\Comuna', 'comuna');
    }

    /**
    * Obtener el mes de la radiacion.
    */
    public function mes()
    {
      return $this->belongsTo('App\Mes', 'mes');
    }

    /**
    * Obtener el tipo de la radiacion.
    */
    public function mes()
    {
      return $this->belongsTo('App\TipoRadiacion', 'tipo');
    }
}
