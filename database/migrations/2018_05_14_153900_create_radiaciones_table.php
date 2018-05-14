<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRadiacionesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('radiaciones', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('tipo')->unsigned();
            $table->integer('comuna')->unsigned();
            $table->integer('mes')->unsigned();
            $table->float('valor');
            $table->foreign('tipo')->references('id')->on('tipos_radiacion');
            $table->foreign('comuna')->references('id')->on('comunas');
            $table->foreign('mes')->references('id')->on('meses');
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
        Schema::dropIfExists('global_horizontal');
    }
}
