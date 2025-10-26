import type { RsbuildPlugin } from "@rsbuild/core";

export type TailwindPrefixOptions = {
  prefix: string;
  exclude?: RegExp[];
};

export const pluginTailwindPrefix = (
  options: TailwindPrefixOptions,
): RsbuildPlugin => ({
  name: "plugin-tailwind-prefix",
  setup(api) {
    const prefix = options.prefix;
    const exclude = options.exclude || [];

    api.transform({ test: /\.(jsx|tsx)$/ }, ({ code, resourcePath }) => {
      // Skip if the file is in exclude list
      if (exclude.some((pattern) => pattern.test(resourcePath))) {
        return code;
      }

      // Helper function to prefix a single class
      const prefixClass = (cls: string): string => {
        cls = cls.trim();
        if (!cls) return cls;

        // Don't prefix if it already has the prefix
        if (cls.startsWith(prefix)) {
          return cls;
        }

        // Don't prefix arbitrary values like [color:red] or [&_svg]:something
        if (cls.startsWith("[")) {
          return cls;
        }

        // Handle modifiers (hover:, focus:, dark:, etc.)
        if (cls.includes(":")) {
          const parts = cls.split(":");
          // The last part is the actual class name
          const lastIndex = parts.length - 1;
          parts[lastIndex] = prefix + parts[lastIndex];
          return parts.join(":");
        }

        // Handle important modifier
        if (cls.startsWith("!")) {
          return "!" + prefix + cls.substring(1);
        }

        // Normal class
        return prefix + cls;
      };

      // Transform className props - handle simple cases only
      const transformedCode = code.replace(
        /className\s*=\s*"([^"]*?)"/g,
        (match, classes) => {
          // Skip if it contains attribute selectors or complex patterns
          if (classes.includes("[") || classes.includes("${")) {
            return match;
          }

          // Split classes and prefix each one
          const prefixedClasses = classes
            .split(/\s+/)
            .filter((cls: string) => cls.trim())
            .map(prefixClass)
            .join(" ");

          return `className="${prefixedClasses}"`;
        },
      );

      // Handle className={...} with string literals (but not template literals with expressions)
      const finalCode = transformedCode.replace(
        /className\s*=\s*\{['"`]([^'"`\$]*?)['"`]\}/g,
        (match, classes) => {
          // Skip if it contains attribute selectors or complex patterns
          if (classes.includes("[") || classes.includes("${")) {
            return match;
          }

          const prefixedClasses = classes
            .split(/\s+/)
            .filter((cls: string) => cls.trim())
            .map(prefixClass)
            .join(" ");

          // Preserve quote style
          if (match.includes('{"')) {
            return `className={"${prefixedClasses}"}`;
          } else if (match.includes("{'")) {
            return `className={'${prefixedClasses}'}`;
          } else {
            return `className={\`${prefixedClasses}\`}`;
          }
        },
      );

      return finalCode;
    });
  },
});
