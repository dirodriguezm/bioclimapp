<?php

use Illuminate\Database\Seeder;

class VentanaTienePropiedadTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('ventana_tiene_propiedades')->insert(['id' => 1, 'ventana_id' => 1, 'propiedad_id' => 1]);
        DB::table('ventana_tiene_propiedades')->insert(['id' => 2, 'ventana_id' => 2, 'propiedad_id' => 2]);
        DB::table('ventana_tiene_propiedades')->insert(['id' => 3, 'ventana_id' => 2, 'propiedad_id' => 3]);
        DB::table('ventana_tiene_propiedades')->insert(['id' => 4, 'ventana_id' => 2, 'propiedad_id' => 4]);
        DB::table('ventana_tiene_propiedades')->insert(['id' => 5, 'ventana_id' => 2, 'propiedad_id' => 5]);
    }
}
