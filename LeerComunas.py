import csv

seeder = []
with open('/home/diego/Codigo Matlab Eficiencia Energetica/temperatura.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter= " ")
    for row in reader:
        seeder.append("DB::table('comunas')->insert([ 'nombre' =>  '" + row[1] + "', ")

with open('/home/diego/Codigo Matlab Eficiencia Energetica/latitudzona.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter= "\t")
    i = 0
    seeder.pop(0)
    for row in reader:
        seeder[i] = seeder[i] + "'latitud' => " + str(row[3]) + "]);"
        print seeder[i]
        i += 1
