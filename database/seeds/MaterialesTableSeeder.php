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
        DB::table('materiales')->insert(['id' => 1, 'nombre' => 'Aire quieto a 0°C ', 'color' => '#ffffff']);
        DB::table('materiales')->insert(['id' => 2, 'nombre' => 'Adobe ', 'color' => '#e2a586']);
        DB::table('materiales')->insert(['id' => 3, 'nombre' => 'Aluminio ', 'color' => '#a9abaa']);
        DB::table('materiales')->insert(['id' => 4, 'nombre' => 'Arcilla ', 'color' => '#bc7a61']);
        DB::table('materiales')->insert(['id' => 5, 'nombre' => 'Aserrín de madera ', 'color' => '#d49b66']);
        DB::table('materiales')->insert(['id' => 6, 'nombre' => 'Asfaltos ', 'color' => '#61687b']);
        DB::table('materiales')->insert(['id' => 7, 'nombre' => 'Azulejos ', 'color' => '#4e68b2']);
        DB::table('materiales')->insert(['id' => 8, 'nombre' => 'Baldosas cerámicas ', 'color' => '#cec8bc']);
        DB::table('materiales')->insert(['id' => 9, 'nombre' => 'Enlucido de yeso ', 'color' => '#b5a490']);
        DB::table('materiales')->insert(['id' => 10, 'nombre' => 'Fibro-cemento ', 'color' => '#c3c1c4']);
        DB::table('materiales')->insert(['id' => 11, 'nombre' => 'Grava rodada o de machaqueo ', 'color' => '#c0afa5']);
        DB::table('materiales')->insert(['id' => 12, 'nombre' => 'Hormigón ', 'color' => '#a7abb6']);
        DB::table('materiales')->insert(['id' => 13, 'nombre' => 'Ladrillo ', 'color' => '#e16e41']);
        DB::table('materiales')->insert(['id' => 14, 'nombre' => 'Láminas bituminosas ', 'color' => '#3f565e']);
        DB::table('materiales')->insert(['id' => 15, 'nombre' => 'Lana mineral ', 'color' => '#c9b870']);
        DB::table('materiales')->insert(['id' => 16, 'nombre' => 'Madera ', 'color' => '#c4814d']);
        DB::table('materiales')->insert(['id' => 17, 'nombre' => 'Mármol ', 'color' => '#dfe4e0']);
        DB::table('materiales')->insert(['id' => 18, 'nombre' => 'Moquetas,alfombras ', 'color' => '#9b7548']);
        DB::table('materiales')->insert(['id' => 19, 'nombre' => 'Mortero ', 'color' => '#7a7267']);
        DB::table('materiales')->insert(['id' => 20, 'nombre' => 'Papel ', 'color' => '#ffffff']);
        DB::table('materiales')->insert(['id' => 21, 'nombre' => 'Plancha de corcho ', 'color' => '#df995e']);
        DB::table('materiales')->insert(['id' => 22, 'nombre' => 'Poliestireno expandido ', 'color' => '#dbdbdb']);
        DB::table('materiales')->insert(['id' => 23, 'nombre' => 'Poliuretano expandido ', 'color' => '#c6c0a8']);
        DB::table('materiales')->insert(['id' => 24, 'nombre' => 'Yeso-Cartón ', 'color' => '#879b9e']);
    }
}
