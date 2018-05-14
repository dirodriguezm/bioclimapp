<?php

use Illuminate\Database\Seeder;

class TiposRadiacionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('tipos_radiacion')->insert(['nombre' => 'Global Horizontal']);
        DB::table('tipos_radiacion')->insert(['nombre' => 'Difusa Horizontal']);
        DB::table('tipos_radiacion')->insert(['nombre' => 'Directa']);
    }
}
