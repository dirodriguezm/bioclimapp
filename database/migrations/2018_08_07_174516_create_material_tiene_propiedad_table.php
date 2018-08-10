<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMaterialTienePropiedadTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('material_tiene_propiedad', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('material_id');
            $table->unsignedInteger('propiedad_id');
            $table->timestamps();
            $table->foreign('material_id')->references('id')->on('materiales');
            $table->foreign('propiedad_id')->references('id')->on('propiedades_materiales');
//            $table->foreign('conductividad')->references('conductividad')->on('propiedades');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('material_tiene_propiedad');
    }
}
