<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Grimzy\LaravelMysqlSpatial\Eloquent\SpatialTrait;

class Comuna extends Model
{
  use SpatialTrait;
  protected $fillable = [
        'nombre'
    ];
  protected $spatialFields = [
        'geometria'
  ];
  /**
   * The table associated with the model.
   *
   * @var string
   */
   protected $table = 'comunas';

   /**
     * Obtener las radiaciones de la comuna.
     */
    public function radiaciones()
    {
        return $this->hasMany('App\Radiacion', 'comuna', 'id');
    }

    /**
      * Obtener las temperaturas de la comuna.
      */
     public function temperaturas()
     {
         return $this->hasMany('App\Temperatura', 'comuna', 'id');
     }
}
