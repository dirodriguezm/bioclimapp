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
        $this->call(ComunasTableSeeder::class);
        $this->call(MesesTableSeeder::class);
        $this->call(TiposRadiacionTableSeeder::class);
        $this->call(RadiacionesTableSeeder::class);
        $this->call(TemperaturasTableSeeder::class);
    }
}
