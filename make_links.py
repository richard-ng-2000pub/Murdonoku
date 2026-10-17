#!/usr/bin/env python3
"""Create Excel-friendly CSV links for all SVGs in solutions/. No dependencies.

Example:
    python make_links.py --base https://YOURNAME.github.io/MURDONOKU

Creates solution_links.csv (UTF-8 BOM for Excel). For each filename,
use its ViewerURL in your QR generator. Case-sensitive GitHub filenames.
"""
import argparse
import csv
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description='Create a CSV of solution QR URLs')
    parser.add_argument('--base', required=True, help='GitHub Pages repository URL')
    parser.add_argument('--output', default='solution_links.csv', help='Output CSV filename')
    args = parser.parse_args()
    base = args.base.strip().rstrip('/')
    if not base.startswith(('https://', 'http://')):
        parser.error('--base must start with https:// or http://')
    files = sorted(ROOT.joinpath('solutions').rglob('*'), key=lambda p: p.as_posix().lower())
    files = [p for p in files if p.is_file() and p.suffix.lower() == '.svg']
    output_path = ROOT / args.output
    with output_path.open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['FileName', 'ViewerURL'])
        for svg in files:
            name = svg.relative_to(ROOT / 'solutions').as_posix()
            writer.writerow([name, f'{base}/viewer.html?f={quote(name, safe="")}'])
    print(f'Created {output_path}: {len(files)} SVG links')


if __name__ == '__main__':
    main()
