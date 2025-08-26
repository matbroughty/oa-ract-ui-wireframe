// Custom theme for Chakra UI
import { extendTheme } from '@chakra-ui/react'

// Define a color palette
const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#b3e0ff',
    200: '#80caff',
    300: '#4db3ff',
    400: '#1a9dff',
    500: '#0080ff',
    600: '#0066cc',
    700: '#004d99',
    800: '#003366',
    900: '#001a33',
  },
  accent: {
    50: '#f0f9eb',
    100: '#d7efc4',
    200: '#bde59d',
    300: '#a3db76',
    400: '#8ad14f',
    500: '#70c728',
    600: '#5a9f20',
    700: '#437718',
    800: '#2d4f10',
    900: '#162708',
  },
}

// Define custom component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
      _focus: {
        boxShadow: 'outline',
      },
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'blue' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'blue' ? 'brand.600' : undefined,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        },
        transition: 'all 0.2s ease-in-out',
      }),
      outline: {
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'sm',
        },
        transition: 'all 0.2s ease-in-out',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        _hover: {
          boxShadow: 'lg',
        },
      },
      body: {
        padding: '6',
      },
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderBottom: '2px solid',
          borderColor: 'gray.200',
          padding: '4',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: 'xs',
          letterSpacing: 'wider',
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.100',
          padding: '4',
        },
        tbody: {
          tr: {
            _hover: {
              bg: 'gray.50',
              transition: 'background-color 0.2s ease-in-out',
            },
          },
        },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      textTransform: 'capitalize',
      fontWeight: 'medium',
      px: 3,
    },
  },
}

// Define global styles
const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
      backgroundImage: 
        'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0)',
      backgroundSize: '40px 40px',
    },
  },
}

// Define font settings
const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
}

// Create the theme
const theme = extendTheme({
  colors,
  components,
  styles,
  fonts,
  shadows: {
    outline: '0 0 0 3px rgba(0, 128, 255, 0.3)',
  },
})

export default theme
