<?php

use Illuminate\Database\Seeder;

class PropiedadesMarcosTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('propiedades_marcos')->insert(['id' => 1, 'U' => 2.6, 'FM' => 0.95]);
        DB::table('propiedades_marcos')->insert(['id' => 2, 'U' => 2.8, 'FM' => 0.85]);
        DB::table('propiedades_marcos')->insert(['id' => 3, 'U' => 5.8, 'FM' => 0.8]);
        DB::table('propiedades_marcos')->insert(['id' => 4, 'U' => 3.3, 'FM' => 0.8]);
    }
}
