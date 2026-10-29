import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { currentTheme, onThemeChange, setTheme, type Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

/** Switches between light and dark. Starts from the visitor's OS setting. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, set] = useState<Theme>(currentTheme)
  useEffect(() => onThemeChange(() => set(currentTheme())), [])

  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn('grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-current/10', className)}
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  )
}
