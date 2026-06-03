import { Moon, Sun } from "lucide-react";

import { iconButtonClassName } from "./styles";
import { toggleTheme } from "./theme";

type TopNavThemeToggleProps = {
  theme: "dark" | "light";
  ariaLabel: string;
};

export function TopNavThemeToggle({ theme, ariaLabel }: TopNavThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      className={iconButtonClassName()}
      aria-label={ariaLabel}
    >
      {theme === "dark" ? <Moon size={17} aria-hidden /> : <Sun size={17} aria-hidden />}
    </button>
  );
}
