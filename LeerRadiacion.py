import csv

with open('/home/diego/Codigo Matlab Eficiencia Energetica/difusahorizontal.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter= " ")
    for row in reader:
        for mes in range(1,14):
            seeder = "DB::table('radiaciones')->insert([ 'tipo' =>  2, " \
                    + "'comuna' => " + row[0] + ", " \
                    + "'mes' => " + str(mes) + ", " \
                    + "'valor' => " + str(row[mes])  \
                    + "]);"
            print seeder
