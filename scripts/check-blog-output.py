from pathlib import Path
import xml.etree.ElementTree as ET


root = Path(__file__).resolve().parents[1]
public = root / '.output/public'
blog = public / 'blog'
feed = public / 'rss.xml'

assert (blog / 'index.html').is_file(), 'Missing blog index'
assert feed.is_file(), 'Missing RSS file'

expected = {source.stem for source in (root / 'content/blog').glob('*.md')}

for slug in expected:
    assert (blog / slug / 'index.html').is_file(), f'Missing article: {slug}'

rss = ET.parse(feed).getroot()
assert rss.tag == 'rss' and rss.attrib.get('version') == '2.0'
items = rss.findall('./channel/item')
links = [item.findtext('link') for item in items]
expected_links = {f'https://nu31.space/blog/{slug}/' for slug in expected}
assert set(links) == expected_links, f'RSS links differ: {links}'
assert len(links) == len(set(links)), 'Duplicate RSS entries'
for item in items:
    assert item.findtext('guid') == item.findtext('link')
    assert item.findtext('pubDate')

print(f'Checked {len(expected)} published blog posts and RSS entries')
