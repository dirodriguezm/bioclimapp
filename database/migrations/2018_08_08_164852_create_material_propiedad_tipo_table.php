<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMaterialPropiedadTipoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('material_propiedad_tipo', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('material_propiedad_id');
            $table->unsignedInteger('tipo_id');
            $table->foreign('tipo_id')->references('id')->on('tipos_materiales');
            $table->foreign('material_propiedad_id')->references('id')->on('material_tiene_propiedad');
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
        Schema::dropIfExists('material_propiedad_tipo');
    }
}
