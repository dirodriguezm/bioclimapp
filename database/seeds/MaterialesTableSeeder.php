<?php

use Illuminate\Database\Seeder;

class MaterialesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('materiales')->insert(['id' => 1, 'nombre' => 'Aire quieto a 0°C']);
        DB::table('materiales')->insert(['id' => 2, 'nombre' => 'Adobe']);
        DB::table('materiales')->insert(['id' => 3, 'nombre' => 'Aluminio']);
        DB::table('materiales')->insert(['id' => 4, 'nombre' => 'Arcilla']);
        DB::table('materiales')->insert(['id' => 5, 'nombre' => 'Aserrín de madera']);
        DB::table('materiales')->insert(['id' => 6, 'nombre' => 'Asfaltos']);
        DB::table('materiales')->insert(['id' => 7, 'nombre' => 'Azulejos']);
        DB::table('materiales')->insert(['id' => 8, 'nombre' => 'Baldosas cerámicas']);
        DB::table('materiales')->insert(['id' => 9, 'nombre' => 'Enlucido de yeso']);
        DB::table('materiales')->insert(['id' => 10, 'nombre' => 'Fibro-cemento']);
        DB::table('materiales')->insert(['id' => 11, 'nombre' => 'Grava rodada o de machaqueo']);
        DB::table('materiales')->insert(['id' => 12, 'nombre' => 'Hormigón ']);
        DB::table('materiales')->insert(['id' => 13, 'nombre' => 'Ladrillo ']);
        DB::table('materiales')->insert(['id' => 14, 'nombre' => 'Láminas bituminosas']);
        DB::table('materiales')->insert(['id' => 15, 'nombre' => 'Lana mineral']);
        DB::table('materiales')->insert(['id' => 16, 'nombre' => 'Madera']);
        DB::table('materiales')->insert(['id' => 17, 'nombre' => 'Mármol']);
        DB::table('materiales')->insert(['id' => 18, 'nombre' => 'Moquetas,alfombras']);
        DB::table('materiales')->insert(['id' => 19, 'nombre' => 'Mortero']);
        DB::table('materiales')->insert(['id' => 20, 'nombre' => 'Papel']);
        DB::table('materiales')->insert(['id' => 21, 'nombre' => 'Plancha de corcho']);
        DB::table('materiales')->insert(['id' => 22, 'nombre' => 'Poliestireno expandido']);
        DB::table('materiales')->insert(['id' => 23, 'nombre' => 'Poliuretano expandido']);
        DB::table('materiales')->insert(['id' => 24, 'nombre' => 'Yeso-Cartón']);
    }
}
