<?php

use Illuminate\Database\Seeder;

class VentanaPropiedadTipoTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('ventana_propiedad_tipo')->insert(['id' => 1, 'tipo_id' => 1, 'ventana_propiedad_id' => 1]);
        DB::table('ventana_propiedad_tipo')->insert(['id' => 2, 'tipo_id' => 2, 'ventana_propiedad_id' => 2]);
        DB::table('ventana_propiedad_tipo')->insert(['id' => 3, 'tipo_id' => 3, 'ventana_propiedad_id' => 3]);
        DB::table('ventana_propiedad_tipo')->insert(['id' => 4, 'tipo_id' => 4, 'ventana_propiedad_id' => 4]);
        DB::table('ventana_propiedad_tipo')->insert(['id' => 5, 'tipo_id' => 5, 'ventana_propiedad_id' => 5]);
    }
}
