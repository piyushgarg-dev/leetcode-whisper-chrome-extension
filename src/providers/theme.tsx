
import { ThemeProvider as NextThemeProvider } from "next-themes";
import React from "react";

/**
 * Properties for the `ThemeProvider` component.
 *
 * @interface ThemeProviderProps
 * @property {ReactNode} children - The child elements to render within the theme provider.
 * @property {string} [attribute="class"] - The attribute to use for applying the theme (e.g., "class", "data-theme").
 * @property {string} [defaultTheme="system"] - The default theme to apply if no theme is specified.
 * @property {boolean} [enableSystem=true] - Whether to enable system theme detection.
 * @property {boolean} [disableTransitionOnChange=true] - Whether to disable transitions when changing themes.
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}


/**
 * A wrapper component to provide theme context using `next-themes`.
 *
 * @param {ThemeProviderProps} props - The component properties.
 * @returns {React.ReactElement} - The theme provider component.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  attribute = "class",
  defaultTheme = "dark",
  enableSystem = true,
  disableTransitionOnChange = true,
}) => {
  return (
    <NextThemeProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      <div>{children}</div>
    </NextThemeProvider>
  );
};
