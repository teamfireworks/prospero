# rbx-phosphor-icons

Repackages the [Phosphor](https://phosphoricons.com/) iconset for convenience
with Roblox projects.

## Installation

```
embr add teamfireworks/rbx-phosphor-icons --alias=phosphor
```

## Usage

```luau
const phosphor = require("@roblox_packages/phosphor")

-- simple
const asset_id, offset = phosphor.locate("acorn")
const image = Instance.new("ImageLabel")
image.Image = asset_id
image.ImageRectSize = phosphor.ICON_SIZE
image.ImageRectOffset = offset

-- complex
for weight, icons in phosphor.ICON_SETS do
	for key, pack in icons do
		print(`offset x: {pack.x}`)
		print(`offset y: {pack.y}`)
		print(`asset key: {pack.z}`)
		print(`asset id: {phosphor.ASSETS[pack.z]}`)
	end
end

-- types
const function locate(key: phosphor.Key, weight: phosphor.Weight)
	-- ...
end
```
