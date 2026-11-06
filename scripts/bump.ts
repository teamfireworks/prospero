import { readFile, writeFile, appendFile } from "node:fs/promises";
import { $ } from "bun";

const MANIFEST = "ember.toml";
const ICONS = "src/icons.luau";
const LEVELS = ["major", "minor", "patch"] as const;

const names = (src: string) => new Set([...src.matchAll(/\["(.+?)"\]/g)].map((m) => m[1]));
const output = (s: string) => process.env.GITHUB_OUTPUT && appendFile(process.env.GITHUB_OUTPUT, s + "\n");

if (!(await $`git status --porcelain -- src`.text()).trim()) {
	console.log("no changes in src, not bumping");
	await output("bumped=false");
	process.exit(0);
}

const before = names(await $`git show HEAD:${ICONS}`.nothrow().quiet().text());
const after = names(await readFile(ICONS, "utf8"));

const level = [...before].some((n) => !after.has(n)) ? 0 : [...after].some((n) => !before.has(n)) ? 1 : 2;

const manifest = Bun.TOML.parse(await readFile(MANIFEST, "utf8")) as any;
const match = manifest.package.version.match(/^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/);
if (!match) throw new Error(`invalid version: ${manifest.package.version}`);

const v = match.slice(1, 4).map(Number);
const prerelease = match[0].includes("-");
if (!prerelease || v.slice(level + 1).some((n: number) => n !== 0)) v[level]++;
v.fill(0, level + 1);

const previous = manifest.package.version;
manifest.package.version = v.join(".");
await writeFile(MANIFEST, Bun.TOML.stringify(manifest) + "\n");

console.log(`${previous} -> ${manifest.package.version} (${LEVELS[level]})`);
await output(`bumped=true\nversion=${manifest.package.version}\nlevel=${LEVELS[level]}`);
