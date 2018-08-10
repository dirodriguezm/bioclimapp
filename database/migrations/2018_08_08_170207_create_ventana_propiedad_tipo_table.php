<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVentanaPropiedadTipoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ventana_propiedad_tipo', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('tipo_id');
            $table->unsignedInteger('ventana_propiedad_id');
            $table->foreign('tipo_id')->references('id')->on('tipos_ventana');
            $table->foreign('ventana_propiedad_id')->references('id')->on('ventana_tiene_propiedades');
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
        Schema::dropIfExists('ventana_propiedad_tipo');
    }
}
