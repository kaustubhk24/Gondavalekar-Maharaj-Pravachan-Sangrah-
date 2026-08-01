from pathlib import Path
from collections import defaultdict
import re

hi_dir = Path('static/pravachans/hi')
files = sorted([p.name for p in hi_dir.iterdir() if p.is_file()])

base_map = defaultdict(list)
for f in files:
    if f.endswith('.md'):
        base = f
        if ' (' in f and f.endswith(').md'):
            base = f[:f.rfind(' (')] + '.md'
        base_map[base].append(f)

print(f'Total files: {len(files)}')
print(f'Unique base names: {len(base_map)}')
print('')

duplicates = {base: variants for base, variants in base_map.items() if len(variants) > 1}
print(f'Duplicate groups: {len(duplicates)}')
for base, variants in sorted(duplicates.items())[:50]:
    print(base, variants)

print('\n---\n')

formats = defaultdict(int)
for f in files:
    if not f.endswith('.md'):
        continue
    name = f[:-3]
    if re.match(r'\d{2}-\d{2}$', name):
        formats['dd-mm'] += 1
    elif re.match(r'\d{4}-\d{2}-\d{2}$', name):
        formats['yyyy-mm-dd'] += 1
    elif re.match(r'\d{2}-\d{2} \(2\)$', name):
        formats['dd-mm-dup'] += 1
    else:
        formats['other'] += 1
print('formats', dict(formats))

# Report missing dates in common month ranges if using dd-mm
existing = {f[:-3] for f in files if re.match(r'\d{2}-\d{2}(?: \(2\))?$', f[:-3])}
all_31 = [f'{str(m).zfill(2)}-{str(d).zfill(2)}' for m in range(1, 13) for d in range(1, 32)]
missing = []
for mmdd in all_31:
    month = int(mmdd[:2]); day = int(mmdd[3:])
    if day > 31: continue
    if month == 2 and day > 29: continue
    if month in {4, 6, 9, 11} and day > 30: continue
    if mmdd not in existing:
        missing.append(mmdd)
print(f'Missing dd-mm dates count: {len(missing)}')
print('Missing sample:', missing[:20])

# Output earliest and latest present
print('First files:', files[:10])
print('Last files:', files[-10:])
