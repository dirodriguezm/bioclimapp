import csv

with open('/home/diego/Codigo Matlab Eficiencia Energetica/temperatura.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter= " ")
    for row in reader:
        for mes in range(1,14):
            seeder = "DB::table('temperaturas')->insert([ " \
                    + "'comuna' => " + row[0] + ", " \
                    + "'mes' => " + str(mes) + ", " \
                    + "'valor' => " + str(row[mes+1])  \
                    + "]);"
            print seeder
