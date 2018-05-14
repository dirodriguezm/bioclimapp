<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Temperatura extends Model
{
  /**
   * The table associated with the model.
   *
   * @var string
   */
   protected $table = 'temperaturas';

   /**
     * Obtener la comuna de la temperatura.
     */
    public function comuna()
    {
        return $this->belongsTo('App\Comuna', 'comuna');
    }

    /**
    * Obtener el mes de la temperatura.
    */
    public function mes()
    {
      return $this->belongsTo('App\Mes', 'mes');
    }
}
