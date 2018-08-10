<?php

use Illuminate\Http\Request;
//use App\Http\Controllers;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});


Route::get('/comuna/{lat}/{lng}', 'ComunaController@getComunaByPoint');
Route::get('/temperaturas/{id}', 'ComunaController@getTemperaturesById');
Route::get('/radiaciones/{id}', 'ComunaController@getGlobalRadiationById');
Route::get('/materiales', 'MaterialController@getAll');
Route::get('/propiedades_material/{material}', 'MaterialController@getPropiedades');
Route::get('/tipos_material/{material}', 'MaterialController@getTipos');
Route::get('/info_materiales', 'MaterialController@getInfoMateriales');

