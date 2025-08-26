// Custom theme for Chakra UI
import { extendTheme } from '@chakra-ui/react'

// Define a color palette - more subdued for financial applications
const colors = {
  brand: {
    50: '#edf2f7',
    100: '#e2e8f0',
    200: '#cbd5e0',
    300: '#a0aec0',
    400: '#718096',
    500: '#4a5568',
    600: '#2d3748',
    700: '#1a202c',
    800: '#171923',
    900: '#0f1117',
  },
  accent: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
}

// Define custom component styles - more subtle for financial applications
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'sm',
      _focus: {
        boxShadow: 'outline',
      },
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'blue' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'blue' ? 'brand.600' : undefined,
          boxShadow: 'sm',
        },
        transition: 'background 0.2s ease-in-out',
      }),
      outline: {
        _hover: {
          bg: 'gray.50',
        },
        transition: 'background 0.2s ease-in-out',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'md',
        boxShadow: 'sm',
        overflow: 'hidden',
        borderWidth: '1px',
        borderColor: 'gray.200',
      },
      body: {
        padding: '4',
      },
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderBottom: '1px solid',
          borderColor: 'gray.300',
          padding: '3',
          fontWeight: 'semibold',
          textTransform: 'uppercase',
          fontSize: 'xs',
          letterSpacing: 'wider',
          color: 'gray.600',
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          padding: '3',
        },
        tbody: {
          tr: {
            _hover: {
              bg: 'gray.50',
            },
          },
        },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'sm',
      textTransform: 'capitalize',
      fontWeight: 'normal',
      px: 2,
      fontSize: 'xs',
    },
  },
}

// Define global styles
const styles = {
  global: {
    body: {
      bg: 'gray.100',
      color: 'gray.800',
      // Remove the background pattern for a cleaner look
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
    outline: '0 0 0 2px rgba(74, 85, 104, 0.2)', // More subtle outline using brand color
  },
})

export default theme
