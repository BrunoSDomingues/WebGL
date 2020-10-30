import numpy as np

with open("SP.pto") as sp:
    for _ in range(2):
        next(sp)

    cols, rows = [int(size) for size in sp.readline().split()]
    coords = [float(c) for c in sp.read().strip().split()]

c_max = np.amax(coords)
idx = 0

pos = []
for r in range(rows):
    for c in range(cols):
        x, y = c, r
        
        x = -cols/2 + x if (x <= cols/2) else x - cols/2
        y = -rows/2 + y if (y <= rows/2) else y - rows/2
                
        pos.append(round(x, 1)) 
        pos.append(round(y, 1))
        pos.append(round(coords[idx]*10/c_max, 2))
        
        idx += 1


ind = []
for r in range(rows - 1):
    for c in range(cols - 1):
        ind.append(r * cols + c + 1)
        ind.append(r * cols + c)
        ind.append((r + 1) * cols + c)
        
        ind.append(r * cols + c + 1)
        ind.append((r + 1) * cols + c)
        ind.append((r + 1) * cols + c + 1)
    
colors = []

for height in coords:
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
        
# Gera o array positions em um arquivo
print(len(pos))
with open("pos.txt", "w") as p:
    for i in range(0, len(pos), 24):
        p.write(str(pos[i: i+24]).strip('[]') + ",")
        p.write('\n')
        
# Gera o array indices em um arquivo
print(len(ind))
with open("ind.txt", "w") as i:
    for j in range(0, len(ind), 26):
        i.write(str(ind[j: j+26]).strip('[]') + ",")
        i.write('\n')

# Gera o array colors em um arquivo
print(len(colors))
with open("colors.txt", "w") as c:
    for k in range(0, len(colors), 24):
        c.write(str(colors[k: k+24]).strip('[]') + ",")
        c.write('\n')



