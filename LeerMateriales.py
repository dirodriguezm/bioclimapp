import sys
# sys.setdefaultencoding() does not exist, here!
reload(sys)  # Reload does the trick!
sys.setdefaultencoding('UTF8')

from xlrd import open_workbook

wb =  open_workbook('/home/diego/Documentos/Memoria de Titulo/Materiales de construccion.xlsx',encoding_override="cp1252")
materiales = []
tipos=[]
propiedades = []
real_propiedades = []
real_tipos = []
for s in wb.sheets():
    for row in range(s.nrows):
        materiales.append(s.cell(row,0).value)
        tipos.append(s.cell(row,1).value)
        propiedades.append((s.cell(row,2).value, s.cell(row,3).value))
        if s.cell(row,1).value != '':
            real_tipos.append(s.cell(row,1).value)
        if s.cell(row,2).value != '' and s.cell(row,3).value != '' and (s.cell(row,2).value, s.cell(row,3).value) not in real_propiedades:
            real_propiedades.append((s.cell(row,2).value, s.cell(row,3).value))
# real_propiedades.pop(0)
print len(propiedades)

i = 0
# for material in materiales:
#     if material != '':
#         print "DB::table('materiales')->insert(['id' => " + str(i) + ", 'nombre' => '" + material + "']);"
#         i+=1

# for propiedad in propiedades:
#     if propiedad[0] != '' and propiedad[1] != '':
#         print "DB::table('propiedades')->insert(['id' => " + str(i) + ", 'densidad' => " + str(propiedad[0]) + \
#         ", 'conductividad' => " + str(propiedad[1]) + "]);"
#         i+=1

# for tipo in tipos:
#     if tipo != '':
#         print "DB::table('tipos_material')->insert(['id' => " + str(i) + ", 'nombre' => '" + tipo + "']);"
#         i+=1

# id = 0
# j = 0
# p = 0
# material_tiene_propiedad = []
# for propiedad in propiedades:
#     if propiedad[0] != '' and propiedad[1] != '':
#         print "DB::table('material_tiene_propiedad')->insert(['id' => "+ str(id) + ", 'propiedad_id' => " + str(real_propiedades.index((propiedad[0],propiedad[1]))) + \
#         ", 'material_id' => " + str(j) + "]);"
#         id += 1
#     if i < len(materiales) - 1:
#         if materiales[i+1] != '':
#             j += 1
#         i+=1

i = 0
j = 0
k = 1
id = 1
p = -1
material_propiedad_tipo = []
for propiedad in propiedades:
   if propiedad[0] != '' and propiedad[1] != '':
       p+=1
       if tipos[k] != '':
           print "DB::table('material_propiedad_tipo')->insert(['id' => "+str(id)+", 'material_propiedad_id' => " + str(p) +\
           ", 'tipo_id' => " + str(real_tipos.index(tipos[k])) + "]);"
           id+=1
   if i < len(materiales) - 1:
       if materiales[i+1] != '':
           j += 1
           if tipos[i+1] == '':
               k = i+2
       if tipos[i+1] != '':
           k = i+1
       i+=1
