<?php

use Illuminate\Database\Seeder;

class TiposMarcosTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('tipos_marcos')->insert(['id' => 1, 'nombre' => 'Sin ruptura de puente térmico', 'abreviatura' => 'Sin RPT']);
        DB::table('tipos_marcos')->insert(['id' => 2, 'nombre' => 'Con ruptura de puente térmico', 'abreviatura' => 'Con RPT']);
    }
}
