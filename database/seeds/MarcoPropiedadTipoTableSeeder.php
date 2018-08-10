<?php

use Illuminate\Database\Seeder;

class MarcoPropiedadTipoTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('marco_propiedad_tipo')->insert(['id' => 1, 'marco_propiedad_id' => 3, 'tipo_id' => 1]);
        DB::table('marco_propiedad_tipo')->insert(['id' => 2, 'marco_propiedad_id' => 4, 'tipo_id' => 2]);
    }
}
