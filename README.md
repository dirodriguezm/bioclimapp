# bioclimapp
Ejecutar estos comandos para montar laravel
 - `composer install`
 - `cp .env.example .env`
 -  Modificar .env para establecer conexión con localhost:
	

>     DB_CONNECTION=mysql
>     DB_HOST=127.0.0.1
>     DB_PORT=3306
>     DB_DATABASE=bioclimapp
>     DB_USERNAME=root
>     DB_PASSWORD=

 - `php artisan key:generate`

Para que laravel funcione con REACT:
  - `sudo npm run watch` : para auto compilar y ejecutar react al modificar el archivo
  - `php artisan serve` : para correr laravel

Para activar localhost:
 -  `sudo service apache2 stop` (en caso de tenerlo)
 -  `sudo service mysql stop` (en caso de tenerlo)
 -  `sudo /opt/lampp/xampp start`

En caso de error, hace falta preparar react en laravel:
  - `php artisan preset react`
  - `sudo npm install`   (en caso de error de escritura usar 
   `sudo npm install --unsafe-perm=true --allow-root`)
   
Copiar archivo de configuracion del servidor bioclimapp.conf a /etc/nginx/sites-available/ y crear un enlace simbólico en /etc/nginx/sites-enabled/   


# Paquetes
<ul>
	<li>Three.js</li>
	<li>Reactstrap</li>
	<li>Chart.js</li>
	<li>react-chartjs-2 https://github.com/jerairrest/react-chartjs-2</li>
	<li>axios</li>
</ul>
	
