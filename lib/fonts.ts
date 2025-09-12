// Popular fonts for POV-style content and thumbnails
export const FONT_CATEGORIES = {
  trending: [
    { name: "Montserrat", family: "Montserrat:wght@400;500;600;700;800;900", display: "Montserrat" },
    { name: "Poppins", family: "Poppins:wght@400;500;600;700;800;900", display: "Poppins" },
    { name: "Inter", family: "Inter:wght@400;500;600;700;800;900", display: "Inter" },
    { name: "Roboto", family: "Roboto:wght@400;500;700;900", display: "Roboto" },
  ],
  bold: [
    { name: "Anton", family: "Anton", display: "Anton" },
    { name: "Bebas Neue", family: "Bebas+Neue", display: "Bebas Neue" },
    { name: "Black Ops One", family: "Black+Ops+One", display: "Black Ops One" },
    { name: "Oswald", family: "Oswald:wght@400;500;600;700", display: "Oswald" },
    { name: "Bangers", family: "Bangers", display: "Bangers" },
  ],
  clean: [
    { name: "Source Sans Pro", family: "Source+Sans+Pro:wght@400;600;700;900", display: "Source Sans Pro" },
    { name: "Open Sans", family: "Open+Sans:wght@400;600;700;800", display: "Open Sans" },
    { name: "Lato", family: "Lato:wght@400;700;900", display: "Lato" },
    { name: "Nunito", family: "Nunito:wght@400;600;700;800;900", display: "Nunito" },
  ],
  creative: [
    { name: "Righteous", family: "Righteous", display: "Righteous" },
    { name: "Fredoka One", family: "Fredoka+One", display: "Fredoka One" },
    { name: "Comfortaa", family: "Comfortaa:wght@400;700", display: "Comfortaa" },
    { name: "Pacifico", family: "Pacifico", display: "Pacifico" },
    { name: "Lobster", family: "Lobster", display: "Lobster" },
  ]
} as const

export type FontCategory = keyof typeof FONT_CATEGORIES
export type FontData = typeof FONT_CATEGORIES[FontCategory][number]

export const ALL_FONTS = Object.values(FONT_CATEGORIES).flat()

export const POV_RECOMMENDED_FONTS = [
  "Montserrat",
  "Anton", 
  "Bebas Neue",
  "Poppins",
  "Righteous",
  "Oswald"
] as const

// Helper to get font family string for CSS
export const getFontFamily = (fontName: string): string => {
  const font = ALL_FONTS.find(f => f.name === fontName)
  return font ? font.display : fontName
}

// Helper to get Google Fonts URL
export const getGoogleFontsUrl = (fonts: string[]): string => {
  const fontFamilies = fonts
    .map(fontName => {
      const font = ALL_FONTS.find(f => f.name === fontName)
      return font ? font.family : fontName
    })
    .join('&family=')
  
  return `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`
}

// Load fonts dynamically
export const loadGoogleFonts = (fonts: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    // Check if WebFont is available
    if (!(window as any).WebFont) {
      // Load WebFont script first
      const script = document.createElement('script')
      script.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
      script.onload = () => {
        loadFontsWithWebFont(fonts, resolve, reject)
      }
      script.onerror = reject
      document.head.appendChild(script)
    } else {
      loadFontsWithWebFont(fonts, resolve, reject)
    }
  })
}

const loadFontsWithWebFont = (fonts: string[], resolve: () => void, reject: (error: any) => void) => {
  const WebFont = (window as any).WebFont
  
  const fontFamilies = fonts.map(fontName => {
    const font = ALL_FONTS.find(f => f.name === fontName)
    return font ? font.family : fontName
  })

  WebFont.load({
    google: {
      families: fontFamilies
    },
    active: resolve,
    inactive: reject,
    timeout: 5000
  })
}