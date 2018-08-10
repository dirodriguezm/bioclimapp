<?php

use Illuminate\Database\Seeder;

class TiposMaterialesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('tipos_materiales')->insert(['id' => 1, 'nombre' => 'Armado (Normal)']);
        DB::table('tipos_materiales')->insert(['id' => 2, 'nombre' => 'Con áridos ligeros']);
        DB::table('tipos_materiales')->insert(['id' => 3, 'nombre' => 'Celular con áridos silíceos']);
        DB::table('tipos_materiales')->insert(['id' => 4, 'nombre' => 'Celular sin áridos']);
        DB::table('tipos_materiales')->insert(['id' => 5, 'nombre' => 'En masa con grava normal con áridos ligero']);
        DB::table('tipos_materiales')->insert(['id' => 6, 'nombre' => 'En masa con grava normal con áridos ordinarios, sin vibrar']);
        DB::table('tipos_materiales')->insert(['id' => 7, 'nombre' => 'En masa con grava normal con áridos ordinarios, vibrados']);
        DB::table('tipos_materiales')->insert(['id' => 8, 'nombre' => 'Con cenizas']);
        DB::table('tipos_materiales')->insert(['id' => 9, 'nombre' => 'De viruta de madera']);
        DB::table('tipos_materiales')->insert(['id' => 10, 'nombre' => 'Macizo hecho a máquina']);
        DB::table('tipos_materiales')->insert(['id' => 11, 'nombre' => 'Hecho a mano']);
        DB::table('tipos_materiales')->insert(['id' => 12, 'nombre' => 'Colchoneta libre']);
        DB::table('tipos_materiales')->insert(['id' => 13, 'nombre' => 'Granular']);
        DB::table('tipos_materiales')->insert(['id' => 14, 'nombre' => 'Álamo']);
        DB::table('tipos_materiales')->insert(['id' => 15, 'nombre' => 'Alerce']);
        DB::table('tipos_materiales')->insert(['id' => 16, 'nombre' => 'Coigue']);
        DB::table('tipos_materiales')->insert(['id' => 17, 'nombre' => 'Lingue']);
        DB::table('tipos_materiales')->insert(['id' => 18, 'nombre' => 'Pino insigne']);
        DB::table('tipos_materiales')->insert(['id' => 19, 'nombre' => 'Raulí']);
        DB::table('tipos_materiales')->insert(['id' => 20, 'nombre' => 'Roble']);
        DB::table('tipos_materiales')->insert(['id' => 21, 'nombre' => 'tableros aglomerados de partículas']);
        DB::table('tipos_materiales')->insert(['id' => 22, 'nombre' => 'Tableros de fibra']);
        DB::table('tipos_materiales')->insert(['id' => 23, 'nombre' => 'De cal y bastardos']);
        DB::table('tipos_materiales')->insert(['id' => 24, 'nombre' => 'De cemento']);
    }
}
