<?php

use Illuminate\Database\Seeder;

class PropiedadesVentanasTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('propiedades_ventanas')->insert(['id' => 1, 'U' => 5.8, 'FS' => 0.87]);
        DB::table('propiedades_ventanas')->insert(['id' => 2, 'U' => 3.28, 'FS' => 0.77]);
        DB::table('propiedades_ventanas')->insert(['id' => 3, 'U' => 3.01, 'FS' => 0.77]);
        DB::table('propiedades_ventanas')->insert(['id' => 4, 'U' => 2.85, 'FS' => 0.77]);
        DB::table('propiedades_ventanas')->insert(['id' => 5, 'U' => 2.8, 'FS' => 0.77]);
    }
}
