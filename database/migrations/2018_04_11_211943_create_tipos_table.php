<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTiposTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tipos', function (Blueprint $table) {
            $table->unsignedInteger('id');
            $table->unsignedInteger('id_estructura');
            $table->string('nombre');
            $table->timestamps();
            $table->primary(['id', 'id_estructura']);
            $table->foreign('id_estructura')->references('id')->on('estructuras');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tipos');
    }
}
