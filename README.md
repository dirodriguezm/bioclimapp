# bioclimapp
Ejecutar estos comandos para montar laravel
 - `cp .env.example .env`
 - `php artisan key:generate`

Para que laravel funcione con REACT:
  - `sudo npm run watch` : para auto compilar y ejecutar react al modificar el archivo
  - `php artisan serve` : para correr laravel

En caso de error, hace falta preparar react en laravel:
  - `php artisan preset react`
  - `sudo npm install`   (en caso de error de escritura usar 
   `sudo npm install --unsafe-perm=true --allow-root`)
