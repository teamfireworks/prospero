local assets = require("@self/assets")
local icons = require("@self/icons")

--- All valid icon weights.
export type Weight = keyof<typeof(icons)>

--- All valid icon names.
export type Icon = keyof<typeof(icons.regular)>

--- @class prospero
--- Phosphor icons for Roblox.
const prospero = {
	--- Pixel size of individual icons in the sheets.
	ICON_SIZE = Vector2.new(32, 32),

	--- All icon's offset and image index, packed with vectors, mapped by weight.
	ICON_SETS = (icons :: any) :: { [Weight]: { [Icon]: vector } },

	--- All valid icon weights.
	ICON_WEIGHTS = {} :: { Weight },

	--- All valid icon names.
	ICON_NAMES = {} :: { Icon },

	--- All image assets.
	ICON_IMAGES = {} :: { string },
}

for key, asset in assets :: any do
	prospero.ICON_IMAGES[tonumber(key) :: number] = asset
end

for key in icons :: any do
	table.insert(prospero.ICON_WEIGHTS, key :: Weight)
end

for key in icons.regular :: any do
	table.insert(prospero.ICON_NAMES, key :: Icon)
end

--- Returns the image ID of a packed icon.
function prospero.image(packed: vector)
	return prospero.ICON_IMAGES[packed.z] or error(`invalid image index: {packed}`)
end

--- Returns the image offset of a packed icon.
function prospero.offset(packed: vector)
	return Vector2.new(packed.x, packed.y)
end

--- Returns the image ID and image offset of the given icon of the given weight.
function prospero.get(icon: Icon, weight: Weight?): (string, Vector2)
	weight = weight or "regular"
	const packed = (prospero.ICON_SETS[weight] or error(`invalid weight: {weight}`))[icon]
		or error(`invalid key: {icon}`)
	return prospero.image(packed), prospero.offset(packed)
end

return table.freeze(prospero)
