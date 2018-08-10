<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMarcoPropiedadTipoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('marco_propiedad_tipo', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('tipo_id');
            $table->unsignedInteger('marco_propiedad_id');
            $table->foreign('tipo_id')->references('id')->on('tipos_marcos');
            $table->foreign('marco_propiedad_id')->references('id')->on('marco_tiene_propiedades');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('marco_propiedad_tipo');
    }
}
