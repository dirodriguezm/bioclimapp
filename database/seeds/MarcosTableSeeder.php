<?php

use Illuminate\Database\Seeder;

class MarcosTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('marcos')->insert(['id' => 1, 'nombre' => 'Madera', 'abreviatura' => 'Madera']);
        DB::table('marcos')->insert(['id' => 2, 'nombre' => 'Policloruro de Vinilo', 'abreviatura' => 'PVC']);
        DB::table('marcos')->insert(['id' => 3, 'nombre' => 'Metal', 'abreviatura' => 'Metal']);
    }
}
