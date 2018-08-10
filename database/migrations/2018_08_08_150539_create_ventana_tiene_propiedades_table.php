<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVentanaTienePropiedadesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ventana_tiene_propiedades', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('ventana_id');
            $table->unsignedInteger('propiedad_id');
            $table->foreign('ventana_id')->references('id')->on('ventanas');
            $table->foreign('propiedad_id')->references('id')->on('propiedades_ventanas');
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
        Schema::dropIfExists('ventana_tiene_propiedades');
    }
}
