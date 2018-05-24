import csv
import sys
csv.field_size_limit(sys.maxsize)
with open('/home/diego/test.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter= ",")
    for row in reader:
        if "MULTIPOLYGON" not in row[1]:
            print "DB::table('comunas')->insert([ 'nombre' =>  '" + row[0] + \
            "', 'geometria' => DB::raw(\"GeomFromText('" + row[1] + ")')\")]);"
        else:
            print "DB::table('comunas')->insert([ 'nombre' =>  '" + row[0] + \
            "', 'geometria' => DB::raw(\"GeomFromText('" + row[1] + "')\")]);"
