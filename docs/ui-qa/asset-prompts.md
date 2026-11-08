# Raster asset provenance

Generated using the built-in ImageGen tool, not the CLI. Final project assets are `img/bird.png`, `img/background.png`, `img/pipetop.png`, and `img/pipebottom.png`. Original generated outputs remain in the session's generated_images directory. Pillow was used only for alpha-bound trimming and exact-size downsampling, not to draw replacement artwork.

## Bird (transparent)

Use case: stylized-concept. Production 2D game sprite, single robotic bird facing right, amber #FFC857 armored body, small cyan #56E0EF eye, slate metal wing panel. Compact rounded rectangular silhouette, no protruding antennae, exhaust, trails or accessories. Flat side view, crisp pixel-art-like raster shading, readable when downscaled to 34x24 pixels and displayed at 40x30. Entire body fills the composition with tiny equal margins. Transparent background. No text, no ground, no shadow outside body, no extra objects.

## Background

Use case: stylized-concept. Seamless horizontally tileable 2D orbital starfield game background. Portrait tile aspect ratio 288:512. Base uniformly deep navy #07111F, sparse tiny subdued cyan and near-white stars, very faint distant blue nebula dust. Minimal calm space with ample dark empty area for clear amber bird and violet pipes gameplay. No planets, large stars, structures, horizon, text, border or vignette. Left and right boundaries must join seamlessly; same navy base on both edges, no bright objects touching edges. Crisp restrained raster pixel-game artwork.

## Top pipe (transparent)

Use case: stylized-concept. Production 2D side-scrolling game obstacle sprite: ONE straight vertical metallic orbital pipe, violet #A78BFA highlight rails and slate #14263D steel, crisp restrained raster pixel-game shading. Full rectangular solid silhouette, perfectly straight sides, front orthographic view. Shaft extends to TOP image edge, wide flat cap only at BOTTOM edge. No protrusions outside rectangle, no perspective, no background, no shadow or glow outside silhouette. The sprite will be resized to exactly 40 pixels wide by 512 pixels tall, so depict an extremely tall slender uninterrupted shaft (12.8:1 height to width) with the cap occupying bottom 14 pixels only. Fill entire width, no surrounding margin, pipe touches top and bottom image boundary. Transparent background. No text, no cables, no extra objects.

## Bottom pipe (transparent edit of top pipe)

Edit this exact metallic orbital pipe sprite to make its matching bottom-pipe asset: flip the entire image vertically so the flat violet cap is at the TOP and straight shaft continues to BOTTOM. Preserve exact color, materials, thin vertical rectangular silhouette, transparent background, all styling. Nothing else. No added glow or objects.
