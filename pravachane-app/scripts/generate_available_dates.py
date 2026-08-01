from pathlib import Path
import json
import re

hi_dir = Path('static/pravachans/hi')
files = sorted([p.name for p in hi_dir.iterdir() if p.is_file() and p.suffix == '.md'])

available = []
for f in files:
    name = f[:-3]
    if re.match(r'^\d{2}-\d{2}$', name) or re.match(r'^\d{4}-\d{2}-\d{2}$', name):
        available.append(name)

# sort by month/day, then yyyy if needed

def sort_key(name):
    if re.match(r'^\d{2}-\d{2}$', name):
        return (int(name[3:]), int(name[:2]), 0, name)
    if m := re.match(r'^(\d{4})-(\d{2})-(\d{2})$', name):
        return (int(m.group(2)), int(m.group(3)), 1, int(m.group(1)), name)
    return (999, 999, 9, name)

available = sorted(set(available), key=sort_key)

out_dir = Path('src/data')
out_dir.mkdir(parents=True, exist_ok=True)
with open(out_dir / 'availableDates-hi.json', 'w', encoding='utf-8') as f:
    json.dump(available, f, ensure_ascii=False, indent=2)

print(f'Wrote {len(available)} available Hindi dates to src/data/availableDates-hi.json')
