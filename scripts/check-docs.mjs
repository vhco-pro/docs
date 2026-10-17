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
const standard = join(root, 'conventions', 'feature-documents.md');
assert.ok(existsSync(standard), 'conventions/feature-documents.md: missing feature-document standard');
const standardText = readFileSync(standard, 'utf8');
const blocks = [...standardText.matchAll(/^```yaml vh-adlc-rules\r?\n([\s\S]*?)^```$/gm)];
assert.equal(blocks.length, 1, 'conventions/feature-documents.md: needs exactly one yaml vh-adlc-rules block');
const rules = parse(blocks[0][1]);
assert.equal(rules.schema, 1, 'vh-adlc-rules: unknown schema');
const statuses = new Set(rules.statuses);
for (const [from, targets] of Object.entries(rules.transitions)) {
  for (const status of [from, ...targets]) assert.ok(statuses.has(status), `vh-adlc-rules: unknown status ${status}`);
}
const vocabulary = new Set(
  [...standardText.matchAll(/^\| `([a-z_]+)` \| /gm)].map((match) => match[1]),
);
const conditionOf = (when) => String(when).replace(/^not /, '');
for (const [status, conditions] of Object.entries(rules.gates)) {
  assert.ok(statuses.has(status), `vh-adlc-rules: gate for unknown status ${status}`);
  for (const condition of conditions) assert.ok(vocabulary.has(condition), `vh-adlc-rules: undefined condition ${condition}`);
}
for (const rule of rules.next) {
  for (const status of [rule.status].flat()) assert.ok(statuses.has(status), `vh-adlc-rules: next for unknown status ${status}`);
  if (rule.when !== undefined) assert.ok(vocabulary.has(conditionOf(rule.when)), `vh-adlc-rules: undefined condition ${rule.when}`);
  assert.ok(typeof rule.do === 'string' && rule.do.trim(), 'vh-adlc-rules: next rule without an action');
}
for (const [key, value] of Object.entries(rules)) {
  if (typeof value === 'string' && value.startsWith('^')) new RegExp(value);
}
new RegExp(rules.feature_root.declaration);
console.log(`Checked ${files.length} Markdown files: local links, metadata, and writing constraints pass.`);
console.log(`Checked the vh-adlc-rules block: ${statuses.size} statuses, ${vocabulary.size} conditions, ${rules.next.length} next rules.`);