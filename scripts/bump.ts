import { readFile, writeFile, appendFile } from "node:fs/promises";
import { parse, stringify } from "smol-toml";
import { $ } from "bun";

const MANIFEST = "ember.toml";
const ICONS = "src/icons.luau";

const names = (src: string) => new Set([...src.matchAll(/\["(.+?)"\]/g)].map((m) => m[1]));
const output = (s: string) => process.env.GITHUB_OUTPUT && appendFile(process.env.GITHUB_OUTPUT, s + "\n");

if (!(await $`git status --porcelain -- src`.text()).trim()) {
	await output("bumped=false");
	process.exit(0);
}

const before = names(await $`git show HEAD:${ICONS}`.nothrow().quiet().text());
const after = names(await readFile(ICONS, "utf8"));

const level = [...before].some((n) => !after.has(n)) ? 0 : [...after].some((n) => !before.has(n)) ? 1 : 2;

const manifest = Bun.TOML.parse(await readFile(MANIFEST, "utf8")) as any;
const v = manifest.package.version.split(".").map(Number);
v[level]++;
v.fill(0, level + 1);
manifest.package.version = v.join(".");

await writeFile(MANIFEST, Bun.TOML.stringify(manifest) + "\n");

console.log(`v${manifest.package.version} (${["major", "minor", "patch"][level]})`);
await output(`bumped=true\nversion=${manifest.package.version}\nlevel=${["major", "minor", "patch"][level]}`);
