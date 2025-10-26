# Tailwind Prefix Plugin

An Rsbuild plugin that automatically prefixes Tailwind CSS classes at build time.

## Overview

Adds prefix to all Tailwind classes in your JSX/TSX files during the build process. This eliminates the need to manually prepend each utility class with your prefered prefix and instead handle it at build time. This is useful when building microfrontends with module federation and want to use tailwind.

## How It Works

The plugin transforms your code at build time:

**Before (your source code):**
```tsx
<div className="container mx-auto p-6">
  <h1 className="text-3xl font-bold">Title</h1>
</div>
```

**After (build output):**
```tsx
<div className="app1-container app1-mx-auto app1-p-6">
  <h1 className="app1-text-3xl app1-font-bold">Title</h1>
</div>
```

## Features

- ✅ Handles simple className strings: `className="flex items-center"`
- ✅ Handles className with JSX expressions: `className={"flex items-center"}`
- ✅ Respects Tailwind modifiers: `hover:bg-blue-500` → `hover:iss-remote-bg-blue-500`
- ✅ Preserves arbitrary values: `[&_svg]:size-4` (not prefixed)
- ✅ Handles important modifier: `!mt-4` → `!iss-remote-mt-4`
- ✅ Skips already-prefixed classes
- ✅ Skips complex template literals with expressions

## Configuration

The plugin is configured in `rsbuild.config.ts`:

```typescript
import { pluginTailwindPrefix } from "./plugins/tailwind-prefix-plugin";

export default defineConfig({
  plugins: [
    pluginTailwindPrefix({
      prefix: "app1-",
      // Optional: exclude certain files
      // exclude: [/node_modules/]
    }),
  ],
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | `"iss-remote-"` | The prefix to add to all Tailwind classes |
| `exclude` | `RegExp[]` | `[]` | Array of regex patterns for files to skip |

## Limitations

- Does not transform complex template literals with expressions (e.g., `className={`flex ${variable}`}`)
- Does not transform classes inside attribute selectors (e.g., `[class*='text-']`)
- Only processes `.jsx` and `.tsx` files

These limitations are intentional to prevent breaking complex dynamic class patterns.

## Benefits Over Runtime Prefixing

1. **Better Performance**: No runtime overhead for prefixing classes
2. **Cleaner Code**: Write standard Tailwind classes without wrapper functions
3. **Better DX**: IDE autocomplete works normally with standard class names
4. **Smaller Bundle**: No need to ship the prefix function to the browser

## Migration from `tw()` Function

If you previously used a `tw()` function to prefix classes:

**Old approach:**
```tsx
import { tw } from "@/lib/utils";
<div className={tw("flex items-center")} />
```

**New approach:**
```tsx
<div className="flex items-center" />
```

The plugin handles prefixing automatically at build time, so you can remove all `tw()` calls.
