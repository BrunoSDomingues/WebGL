import numpy as np

# Processando o arquivo SP.pto

with open("SP.pto") as pto:
    # Pegando os valores maximos e minimos de latitude
    lat_max, lat_min = [float(lat) for lat in pto.readline().strip().split()]
    
    # Pegando os valores maximos e minimos de longitude
    long_max, long_min = [float(lon) for lon in pto.readline().strip().split()]

    # Quantidade de colunas e de linhas
    cols, rows = [int(size) for size in pto.readline().split()]
    
    # Lendo o resto do arquivo
    coords = [float(c) for c in pto.read().strip().split()]

c_max = np.amax(coords)         # Valor máximo da lista coords
idx = 0                         # Indice generico para uso posterior

pos = []                        # Lista de posicoes
for r in range(rows):
    for c in range(cols):
        x, y = c, r             # Define x e y como variaveis temporarias sem interferir nos iteradores do loop
        
        # Analisa os valores de x/de y em relacao a quantidade total de colunas/de linhas 
        # Isto é feito para gerar um range simétrico do - ao +
        x = -cols/2 + x if (x <= cols/2) else x - cols/2
        y = -rows/2 + y if (y <= rows/2) else y - rows/2
                
        # Joga os valores na lista para indicar a posicao
        pos.append(round(x, 1)) 
        pos.append(round(y, 1))
        
        # Calcula a "altura" do ponto e coloca na lista
        p_height = coords[idx]*10/c_max
        pos.append(round(p_height, 2))
        
        idx += 1                # Pula o iterador para indicar que já passou um loop


pto_ind = []                    # Lista de indices do arquivo SP.pto
for r in range(rows - 1):
    for c in range(cols - 1):
        pto_ind.append(r * cols + c + 1)
        pto_ind.append(r * cols + c)
        pto_ind.append((r + 1) * cols + c)
        pto_ind.append(r * cols + c + 1)
        pto_ind.append((r + 1) * cols + c)
        pto_ind.append((r + 1) * cols + c + 1)
    
colors = []                     # Lista de cores que variam com a altura

for height in coords:           # Para cada altura há uma forma (arbitrária) diferente de calcular uma cor
    if height <= 0:
        colors.extend([0, 0.2, 1, 1])
        
    elif height < 800:
        x = height/800
        colors.extend([round(0.3*x + 0.1, 1), round(0.7*x + 0.1, 1), 0, 1])
        
    elif height < 1300:
        x = (height - 800) / 500
        c = round(0.6*x + 0.4, 1)
        colors.extend([c, c, 0.1, 1])
        
    else:
        x = (height - 1300) / 500
        c = round(0.2*x + 0.8, 1)
        colors.extend([c, c, c, 1])
        
# Gera o array positions em um txt para copiar com facilidade no arquivo src/arrays.js 
with open("pos.txt", "w") as p:
    for i in range(0, len(pos), 24):
        p.write(str(pos[i: i+24]).strip('[]') + ",")
        p.write('\n')
        
# Gera o array pto_ind em um txt para copiar com facilidade no arquivo src/arrays.js
with open("pto_ind.txt", "w") as i:
    for j in range(0, len(pto_ind), 26):
        i.write(str(pto_ind[j: j+26]).strip('[]') + ",")
        i.write('\n')

# Gera o array colors em um txt para copiar com facilidade no arquivo src/arrays.js
with open("colors.txt", "w") as c:
    for k in range(0, len(colors), 24):
        c.write(str(colors[k: k+24]).strip('[]') + ",")
        c.write('\n')
        
        
# Processando o arquivo SP.pto

with open("SP.ctr") as ptr:
    next(ptr)       # Pula a primeira linha pois ela não tem utilidade
    values = [float(c) for c in ptr.read().strip().split()]         # Gera os valores a partir do arquivo

# Cria-se linspaces de latidudes e longitudes que serao usados posteriormente
lats_lin = np.linspace(lat_max, lat_min, rows).tolist()
longs_lin = np.linspace(long_max, long_min, cols).tolist()

ctr_ind = []        # Lista de indices do arquivo SP.ctr

for i in range(len(values)):
    value = values[i]       # Pega o valor atual
    
    # Se o iterador for par é uma longitude, se não é uma latitude
    if i % 2 == 0:
        # Processo identico ao realizado no array pos
        x_tmp = longs_lin.index(min(longs_lin, key=lambda lon: abs(lon - value)))
        x = -cols/2 + x_tmp if (x_tmp <= cols/2) else x_tmp - cols/2       
        
        ctr_ind.append(-x)
    
    else:                   
        y_tmp = lats_lin.index(min(lats_lin, key=lambda lat: abs(lat - value)))
        y = -rows/2 + y_tmp if (y_tmp <= rows/2) else y_tmp - rows/2
        
        ctr_ind.append(-y)
        
        l_height = (coords[-(y_tmp * 66 + x_tmp)]/c_max) * 10 + 0.5
        
        ctr_ind.append(round(l_height, 2))
        
# Gera o array de indices_ctr em um txt para copiar com facilidade no arquivo src/arrays.js
with open("ctr_ind.txt", "w") as i:
    for j in range(0, len(ctr_ind), 26):
        i.write(str(ctr_ind[j: j+26]).strip('[]') + ",")
        i.write('\n')


