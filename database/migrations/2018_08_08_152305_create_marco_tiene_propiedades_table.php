<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMarcoTienePropiedadesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('marco_tiene_propiedades', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('marco_id');
            $table->unsignedInteger('propiedad_id');
            $table->foreign('marco_id')->references('id')->on('marcos');
            $table->foreign('propiedad_id')->references('id')->on('propiedades_marcos');
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
        Schema::dropIfExists('marco_tiene_propiedades');
    }
}
