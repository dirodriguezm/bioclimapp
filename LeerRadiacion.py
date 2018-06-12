import csv

# with open('/home/diego/Codigo Matlab Eficiencia Energetica/difusahorizontal.csv', 'rb') as csvfile:
#     reader = csv.reader(csvfile, delimiter= " ")
#     for row in reader:
#         for mes in range(1,14):
#             seeder = "DB::table('radiaciones')->insert([ 'tipo' =>  2, " \
#                     + "'comuna' => " + row[0] + ", " \
#                     + "'mes' => " + str(mes) + ", " \
#                     + "'valor' => " + str(row[mes])  \
#                     + "]);"
#             print seeder

difusas = []
globales = []
directas = []
with open('/home/diego/Documentos/Material Memoria/Codigo Matlab Eficiencia Energetica/difusahorizontal.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter= " ")
    for row in reader:
        rad_comuna = []
        for mes in range(1,14):
            rad_comuna.append((mes,row[mes]))
        difusas.append(rad_comuna)

with open('/home/diego/Documentos/Material Memoria/Codigo Matlab Eficiencia Energetica/globalhorizontal.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter= " ")
    for row in reader:
        rad_comuna = []
        for mes in range(1,14):
            rad_comuna.append((mes,row[mes]))
        globales.append(rad_comuna)


for comuna in range(0,len(difusas)):
    rad_comuna = []
    for mes in range(0,13):
        rad_comuna.append( (mes+1,  float(globales[comuna][mes][1]) - float(difusas[comuna][mes][1]) ) )
    directas.append(rad_comuna)

comuna = 1
for rad_comuna in directas:
    for mes in rad_comuna:
        print "DB::table('radiaciones')->insert(['tipo' => 3, " \
              + "'comuna' => " + str(comuna) + ", " \
              + "'mes' => " + str(mes[0]) + ", " \
              + "'valor' => " + str(mes[1]) + "]);"
    comuna += 1
