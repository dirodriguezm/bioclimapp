<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // $this->call(UsersTableSeeder::class);
        /*$this->call(ComunasTableSeeder::class);
        $this->call(MesesTableSeeder::class);
        $this->call(TiposRadiacionTableSeeder::class);
        $this->call(RadiacionesTableSeeder::class);
        $this->call(TemperaturasTableSeeder::class);*/
        $this->call(MaterialesTableSeeder::class);
        $this->call(PropiedadesMaterialesTableSeeder::class);
        $this->call(MaterialTienePropiedadTableSeeder::class);
        $this->call(TiposMaterialesTableSeeder::class);
        $this->call(MaterialPropiedadTipoTableSeeder::class);
        $this->call(VentanasTableSeeder::class);
        $this->call(PropiedadesVentanasTableSeeder::class);
        $this->call(VentanaTienePropiedadTableSeeder::class);
        $this->call(TiposVentanasTableSeeder::class);
        $this->call(VentanaPropiedadTipoTableSeeder::class);
        $this->call(MarcosTableSeeder::class);
        $this->call(PropiedadesMarcosTableSeeder::class);
        $this->call(MarcoTienePropiedadTableSeeder::class);
        $this->call(TiposMarcosTableSeeder::class);
        $this->call(MarcoPropiedadTipoTableSeeder::class);

    }
}
