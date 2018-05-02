<?php

use Illuminate\Database\Seeder;

class EstructurasTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('estructuras')->insert([
           'nombre' => 'Pared'
        ]);
        DB::table('estructuras')->insert([
           'nombre' => 'Ventana'
        ]);
        DB::table('estructuras')->insert([
           'nombre' => 'Piso'
        ]);
        DB::table('estructuras')->insert([
           'nombre' => 'Techo'
        ]);
    }
}
