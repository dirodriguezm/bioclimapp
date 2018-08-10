<?php

use Illuminate\Database\Seeder;

class MarcoTienePropiedadTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('marco_tiene_propiedades')->insert(['id' => 1, 'marco_id' => 1, 'propiedad_id' => 1]);
        DB::table('marco_tiene_propiedades')->insert(['id' => 2, 'marco_id' => 2, 'propiedad_id' => 2]);
        DB::table('marco_tiene_propiedades')->insert(['id' => 3, 'marco_id' => 3, 'propiedad_id' => 3]);
        DB::table('marco_tiene_propiedades')->insert(['id' => 4, 'marco_id' => 3, 'propiedad_id' => 4]);
    }
}
