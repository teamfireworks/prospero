local assets = require("@self/assets")
local icons = require("@self/icons")

export type Weight = keyof<typeof(icons)>
export type Key = keyof<typeof(icons.regular)>

export type Icon = {
	name: string,
	asset: string,
	size: Vector2,
	offset: Vector2,
}

const ICON_SIZE = Vector2.new(32, 32)

const ASSETS = {} :: { string }
for key, asset in assets do
	ASSETS[tonumber(key)] = asset
end

const function locate(key: Key, weight: Weight?): (string, Vector2)
	const packed = (icons[weight or "regular"] or error(`invalid weight: {weight}`))[key] or error(`invalid key: {key}`)
	return ASSETS[packed.z], Vector2.new(packed.x, packed.y)
end

return table.freeze({
	ICON_SIZE = ICON_SIZE,
	ICON_SETS = icons,
	ASSETS = ASSETS,
	locate = locate,
})
