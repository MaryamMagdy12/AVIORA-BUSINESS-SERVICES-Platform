Image assets for the client app.

## Usage

Import from `src/assets/media.js`:

```js
// Named exports for pages
import { heroHomeTeam, globalGlobe } from '../assets/media'

// Or access any image by filename (no extension)
import images from '../assets/media'
const url = images['illustration-dashboard']
```

All files in this folder are auto-imported via `import.meta.glob`.

## CSS backgrounds

Reference with relative paths from `src/assets/css/`:

```css
background-image: url('../images/bg-waves-light.png');
```

For filenames with spaces, prefer importing via `media.js` in components instead of CSS.
