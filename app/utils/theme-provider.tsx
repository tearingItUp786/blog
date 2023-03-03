import React from 'react'

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

type ThemeContextType = [
  Theme | null,
  React.Dispatch<React.SetStateAction<Theme | null>>,
]
const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined,
)
ThemeContext.displayName = 'ThemeContext'

const prefersLightMQ = '(prefers-color-scheme: light)'

const getPreferredTheme = () => {
  const localStorageTheme = window.localStorage.getItem('theme')
  if (localStorageTheme) return localStorageTheme as Theme

  return window.matchMedia(prefersLightMQ).matches ? Theme.LIGHT : Theme.DARK
}

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const [theme, setTheme] = React.useState<Theme | null>(() => {
    // there's no way for us to know what the theme should be in this context
    // the client will have to figure it out before hydration.
    if (typeof window !== 'object') {
      return null
    }

    return getPreferredTheme()
  })

  React.useEffect(() => {
    window.localStorage.setItem('theme', String(theme))
  }, [theme])

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * We need to inject this script into the root document so that we can properly
 * allow the client to determine which theme to user:
 * 1. If local Storage exists, use that.
 * 2. Else, check user preference based on system.
 */
const clientThemeCode = `
;(() => {
  const userTheme = window.localStorage.getItem('theme');
  const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const cl = document.documentElement.classList;

  const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');

  if (themeAlreadyApplied) {
    // this script shouldn't exist if the theme is already applied!
    console.warn(
      "Hi there, could you let Taran know you're seeing this message? Thanks!",
    );
  } else {
      cl.add(userTheme ?? preferredTheme);
  }
})();
`

export function NonFlashOfWrongThemeEls() {
  return (
    <>
      <script
        // NOTE: we cannot use type="module" because that automatically makes
        // the script "defer". That doesn't work for us because we need
        // this script to run synchronously before the rest of the document
        // is finished loading.
        dangerouslySetInnerHTML={{__html: clientThemeCode}}
      />
    </>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
