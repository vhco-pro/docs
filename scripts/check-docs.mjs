import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const types = new Set(['principle', 'guideline', 'standard', 'decision', 'guide', 'architecture']);
const contentDirectories = new Set(['conventions', 'knowledge', 'guides', 'decisions']);
const files = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.md')) files.push(path);
  }
}
walk(root);
for (const path of files) {
  const text = readFileSync(path, 'utf8');
  assert.ok(!text.includes('\u2014'), `${path}: no em dashes`);
  const relative = path.slice(root.length + 1);
  if (contentDirectories.has(relative.split('/')[0])) {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    assert.ok(match, `${relative}: missing frontmatter`);
    const metadata = parse(match[1]);
    for (const field of ['title', 'type', 'description', 'status']) {
      assert.equal(typeof metadata[field], 'string', `${relative}: invalid ${field}`);
      assert.ok(metadata[field].trim(), `${relative}: empty ${field}`);
    }
    assert.ok(types.has(metadata.type), `${relative}: unknown document type`);
    const statuses = metadata.type === 'decision'
      ? ['proposed', 'accepted', 'superseded', 'deprecated']
      : ['draft', 'active', 'deprecated'];
    assert.ok(statuses.includes(metadata.status), `${relative}: invalid status`);
    if (metadata.status === 'superseded') assert.ok(metadata.superseded_by, `${relative}: missing replacement`);
  }
  for (const match of text.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1];
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue;
    const filename = decodeURIComponent(target.split('#')[0]);
    const destination = resolve(dirname(path), filename);
    assert.ok(destination.startsWith(root + '/') || destination === root, `${relative}: link escapes repo`);
    assert.ok(existsSync(destination), `${relative}: broken link ${target}`);
    assert.ok(statSync(destination).isFile() || statSync(destination).isDirectory());
  }
}
console.log(`Checked ${files.length} Markdown files: local links, metadata, and writing constraints pass.`);