# Prospero

[Phosphor Icons](https://phosphoricons.com/) for Roblox.

## Installation

```sh
embr add teamfireworks/prospero
```

## Usage

```luau
const prospero = require("@packages/roblox/prospero")

-- simple
const id, offset = prospero.get("acorn", "duotone")
const image = Instance.new("ImageLabel")
image.Image = id
image.ImageRectSize = prospero.ICON_SIZE
image.ImageRectOffset = offset

-- complex
for weight, icons in prospero.ICON_SETS do
	for icon, packed in icons do
		print(icon, weight)
		print(`\toffset: {prospero.offset(packed)}`)
		print(`\timage id: {prospero.image(packed)]}`)
	end
end

-- types
const function component(icon: prospero.Icon, weight: prospero.Weight)
	-- ...
end
```
