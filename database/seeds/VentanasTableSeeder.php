<?php

use Illuminate\Database\Seeder;

class VentanasTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('ventanas')->insert(['id' => 1, 'nombre' => 'Vidrio Monolítico', 'abreviatura' => 'VM']);
        DB::table('ventanas')->insert(['id' => 2, 'nombre' => 'DVH', 'abreviatura' => 'DVH']);
    }
}
