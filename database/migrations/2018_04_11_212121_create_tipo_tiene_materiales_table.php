<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTipoTieneMaterialesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tipo_tiene_materiales', function (Blueprint $table) {
            $table->unsignedInteger('id_tipo');
            $table->unsignedInteger('id_estructura');
            $table->unsignedInteger('id_material');
            $table->timestamps();
            $table->primary(['id_tipo', 'id_estructura', 'id_material']);
            $table->foreign('id_material')->references('id')->on('materiales');
            $table->foreign(['id_tipo', 'id_estructura'])->references(['id', 'id_estructura'])->on('tipos');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tipo_tiene_materiales');
    }
}
