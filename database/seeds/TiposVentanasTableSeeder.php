<?php

use Illuminate\Database\Seeder;

class TiposVentanasTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('tipos_ventana')->insert(['id' => 1, 'nombre' => 'Sin espaciador', 'abreviatura' => 'S/E']);
        DB::table('tipos_ventana')->insert(['id' => 2, 'nombre' => 'con espaciador de 6mm', 'abreviatura' => 'con 6mm']);
        DB::table('tipos_ventana')->insert(['id' => 3, 'nombre' => 'con espaciador de 9mm', 'abreviatura' => 'con 9mm']);
        DB::table('tipos_ventana')->insert(['id' => 4, 'nombre' => 'con espaciador de 12mm', 'abreviatura' => 'con 12mm']);
        DB::table('tipos_ventana')->insert(['id' => 5, 'nombre' => 'con espaciador de 15mm o mayor', 'abreviatura' => 'con 15mm o +']);


    }
}
