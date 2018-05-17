import csv

with open('/home/diego/Documentos/Material Memoria/centroide_comunas.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter= ",")
    for row in reader:
        print "DB::table('comunas')->insert([ 'nombre' =>  '" + row[0] + \
        "', 'centroide' => DB::raw(\"GeomFromText('" + row[1] + "')\")]);"
