
import { ThemeConfig, extendTheme } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

export const theme = extendTheme({
  config,
  fonts: {
    heading: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    body: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  colors: {
    brand: {
      50: '#f5f1ff',
      100: '#e7dcff',
      200: '#d0baff',
      300: '#b394ff',
      400: '#9874ff',
      500: '#805AD5',
      600: '#6b47b4',
      700: '#553c9a',
      800: '#44337a',
      900: '#322659',
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'brand' }
    },
    Badge: {
      baseStyle: { textTransform: 'none', fontWeight: 600 }
    }
  }
})
