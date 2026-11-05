import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";

const ICON_SIZE = 32;
const SHEET_SIZE = 1024;
const ICONS_PER_ROW = SHEET_SIZE / ICON_SIZE;
const ICONS_PER_SHEET = ICONS_PER_ROW * ICONS_PER_ROW;

const WEIGHTS = ["thin", "light", "regular", "bold", "fill", "duotone"];
const ASSETS_DIR = path.join("node_modules", "@phosphor-icons", "core", "assets");
const OUT_DIR = "src";

type Icon = {
	weight: string;
	name: string;
	file: string;
};

type Placement = {
	icon: Icon;
	sheet: number;
	left: number;
	top: number;
};

function iconName(file: string, weight: string): string {
	const name = path.basename(file, ".svg");
	const suffix = `-${weight}`;
	return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}

async function listIcons(): Promise<Icon[]> {
	const icons: Icon[] = [];
	for (const weight of WEIGHTS) {
		const files = await readdir(path.join(ASSETS_DIR, weight));
		for (const file of files.sort()) {
			if (!file.endsWith(".svg")) continue;
			icons.push({
				weight,
				name: iconName(file, weight),
				file: path.join(ASSETS_DIR, weight, file),
			});
		}
	}
	return icons;
}

async function renderIcon(file: string): Promise<Buffer> {
	const svg = await readFile(file, "utf8");
	const white = svg.replaceAll("currentColor", "#FFF");
	return sharp(Buffer.from(white)).resize(ICON_SIZE, ICON_SIZE).png().toBuffer();
}

async function renderSheet(placements: Placement[], outFile: string): Promise<void> {
	const tiles: OverlayOptions[] = await Promise.all(
		placements.map(async (p) => ({
			input: await renderIcon(p.icon.file),
			left: p.left,
			top: p.top,
		})),
	);

	await sharp({
		create: { width: SHEET_SIZE, height: SHEET_SIZE, channels: 4, background: "#0000" },
	})
		.composite(tiles)
		.png()
		.toFile(outFile);
}

function luauModule(placements: Placement[]): string {
	const lines: string[] = ["return table.freeze({"];

	for (const weight of WEIGHTS) {
		const forWeight = placements
			.filter((p) => p.icon.weight === weight)
			.sort((a, b) => a.icon.name.localeCompare(b.icon.name));

		lines.push(`\t${weight} = table.freeze({`);
		for (const p of forWeight) {
			lines.push(`\t\t["${p.icon.name}"] = vector.create(${p.left}, ${p.top}, ${p.sheet}),`);
		}
		lines.push("\t}),");
	}

	lines.push("})");
	return lines.join("\n") + "\n";
}

async function main() {
	const icons = await listIcons();
	const placements = icons.map((icon, i) => {
		const indexOnSheet = i % ICONS_PER_SHEET;
		return {
			icon,
			sheet: Math.floor(i / ICONS_PER_SHEET) + 1,
			left: (indexOnSheet % ICONS_PER_ROW) * ICON_SIZE,
			top: Math.floor(indexOnSheet / ICONS_PER_ROW) * ICON_SIZE,
		};
	});

	const sheetCount = Math.ceil(placements.length / ICONS_PER_SHEET);

	await mkdir(path.join(OUT_DIR, "sheets"), { recursive: true });

	for (let sheet = 1; sheet <= sheetCount; sheet++) {
		const onThisSheet = placements.filter((p) => p.sheet === sheet);
		await renderSheet(onThisSheet, path.join(OUT_DIR, "sheets", `${sheet}.png`));
		console.log(`sheet ${sheet}/${sheetCount}`);
	}

	await writeFile(path.join(OUT_DIR, "icons.luau"), luauModule(placements));
	console.log(`${icons.length} icons on ${sheetCount} sheets`);
}

await main();
