// Custom theme for Chakra UI
import { extendTheme } from '@chakra-ui/react'

// Define a color palette with neutrals, semantic colors, and dark mode support
const colors = {
  // Neutral colors - a scale of grays for text, backgrounds, borders
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  // Brand colors
  brand: {
    50: '#EBF8FF',
    100: '#BEE3F8',
    200: '#90CDF4',
    300: '#63B3ED',
    400: '#4299E1',
    500: '#3182CE', // Primary brand color
    600: '#2B6CB0',
    700: '#2C5282',
    800: '#2A4365',
    900: '#1A365D',
  },
  // Semantic colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Primary success color
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Primary error color
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Primary warning color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Primary info color
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  // Dark mode colors
  modes: {
    dark: {
      bg: {
        primary: '#1A202C',
        secondary: '#2D3748',
        tertiary: '#4A5568',
      },
      text: {
        primary: '#F7FAFC',
        secondary: '#E2E8F0',
        tertiary: '#A0AEC0',
      },
    },
  },
}

// Define custom component styles with consistent states
const components = {
  // Buttons (primary, secondary, tertiary/ghost, destructive, link-style)
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
      transition: 'all 0.2s ease-in-out',
      _focus: {
        boxShadow: 'outline',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    },
    sizes: {
      sm: {
        fontSize: 'sm',
        px: 3,
        py: 1,
      },
      md: {
        fontSize: 'md',
        px: 4,
        py: 2,
      },
      lg: {
        fontSize: 'lg',
        px: 6,
        py: 3,
      },
    },
    variants: {
      // Primary button
      solid: (props: any) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : 
             props.colorScheme === 'red' ? 'error.500' :
             props.colorScheme === 'green' ? 'success.500' :
             props.colorScheme === 'yellow' ? 'warning.500' :
             props.colorScheme === 'blue' ? 'info.500' : undefined,
        color: 'white',
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : 
              props.colorScheme === 'red' ? 'error.600' :
              props.colorScheme === 'green' ? 'success.600' :
              props.colorScheme === 'yellow' ? 'warning.600' :
              props.colorScheme === 'blue' ? 'info.600' : undefined,
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        _active: {
          bg: props.colorScheme === 'brand' ? 'brand.700' : 
              props.colorScheme === 'red' ? 'error.700' :
              props.colorScheme === 'green' ? 'success.700' :
              props.colorScheme === 'yellow' ? 'warning.700' :
              props.colorScheme === 'blue' ? 'info.700' : undefined,
          transform: 'translateY(0)',
          boxShadow: 'sm',
        },
      }),
      // Secondary button
      outline: (props: any) => ({
        bg: 'transparent',
        border: '1px solid',
        borderColor: props.colorScheme === 'brand' ? 'brand.500' : 
                     props.colorScheme === 'red' ? 'error.500' :
                     props.colorScheme === 'green' ? 'success.500' :
                     props.colorScheme === 'yellow' ? 'warning.500' :
                     props.colorScheme === 'blue' ? 'info.500' : 'gray.200',
        color: props.colorScheme === 'brand' ? 'brand.500' : 
               props.colorScheme === 'red' ? 'error.500' :
               props.colorScheme === 'green' ? 'success.500' :
               props.colorScheme === 'yellow' ? 'warning.500' :
               props.colorScheme === 'blue' ? 'info.500' : 'gray.800',
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.50' : 
              props.colorScheme === 'red' ? 'error.50' :
              props.colorScheme === 'green' ? 'success.50' :
              props.colorScheme === 'yellow' ? 'warning.50' :
              props.colorScheme === 'blue' ? 'info.50' : 'gray.50',
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
        _active: {
          bg: props.colorScheme === 'brand' ? 'brand.100' : 
              props.colorScheme === 'red' ? 'error.100' :
              props.colorScheme === 'green' ? 'success.100' :
              props.colorScheme === 'yellow' ? 'warning.100' :
              props.colorScheme === 'blue' ? 'info.100' : 'gray.100',
          transform: 'translateY(0)',
        },
      }),
      // Tertiary/ghost button
      ghost: (props: any) => ({
        bg: 'transparent',
        color: props.colorScheme === 'brand' ? 'brand.500' : 
               props.colorScheme === 'red' ? 'error.500' :
               props.colorScheme === 'green' ? 'success.500' :
               props.colorScheme === 'yellow' ? 'warning.500' :
               props.colorScheme === 'blue' ? 'info.500' : 'gray.600',
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.50' : 
              props.colorScheme === 'red' ? 'error.50' :
              props.colorScheme === 'green' ? 'success.50' :
              props.colorScheme === 'yellow' ? 'warning.50' :
              props.colorScheme === 'blue' ? 'info.50' : 'gray.50',
        },
        _active: {
          bg: props.colorScheme === 'brand' ? 'brand.100' : 
              props.colorScheme === 'red' ? 'error.100' :
              props.colorScheme === 'green' ? 'success.100' :
              props.colorScheme === 'yellow' ? 'warning.100' :
              props.colorScheme === 'blue' ? 'info.100' : 'gray.100',
        },
      }),
      // Destructive button
      destructive: {
        bg: 'error.500',
        color: 'white',
        _hover: {
          bg: 'error.600',
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        _active: {
          bg: 'error.700',
          transform: 'translateY(0)',
          boxShadow: 'sm',
        },
      },
      // Link-style button
      link: (props: any) => ({
        padding: 0,
        height: 'auto',
        lineHeight: 'normal',
        color: props.colorScheme === 'brand' ? 'brand.500' : 
               props.colorScheme === 'red' ? 'error.500' :
               props.colorScheme === 'green' ? 'success.500' :
               props.colorScheme === 'yellow' ? 'warning.500' :
               props.colorScheme === 'blue' ? 'info.500' : 'brand.500',
        _hover: {
          textDecoration: 'underline',
          color: props.colorScheme === 'brand' ? 'brand.600' : 
                 props.colorScheme === 'red' ? 'error.600' :
                 props.colorScheme === 'green' ? 'success.600' :
                 props.colorScheme === 'yellow' ? 'warning.600' :
                 props.colorScheme === 'blue' ? 'info.600' : 'brand.600',
        },
        _active: {
          color: props.colorScheme === 'brand' ? 'brand.700' : 
                 props.colorScheme === 'red' ? 'error.700' :
                 props.colorScheme === 'green' ? 'success.700' :
                 props.colorScheme === 'yellow' ? 'warning.700' :
                 props.colorScheme === 'blue' ? 'info.700' : 'brand.700',
        },
      }),
    },
    defaultProps: {
      variant: 'solid',
      size: 'md',
      colorScheme: 'brand',
    },
  },

  // Input Fields
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'md',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: 'outline',
        },
        _disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      },
    },
    variants: {
      outline: {
        field: {
          border: '1px solid',
          borderColor: 'gray.300',
          bg: 'white',
          _hover: {
            borderColor: 'gray.400',
          },
        },
      },
      filled: {
        field: {
          bg: 'gray.100',
          _hover: {
            bg: 'gray.200',
          },
          _focus: {
            bg: 'white',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
      size: 'md',
    },
  },

  // Textarea
  Textarea: {
    baseStyle: {
      borderRadius: 'md',
      _focus: {
        borderColor: 'brand.500',
        boxShadow: 'outline',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    variants: {
      outline: {
        border: '1px solid',
        borderColor: 'gray.300',
        bg: 'white',
        _hover: {
          borderColor: 'gray.400',
        },
      },
      filled: {
        bg: 'gray.100',
        _hover: {
          bg: 'gray.200',
        },
        _focus: {
          bg: 'white',
        },
      },
    },
    defaultProps: {
      variant: 'outline',
      size: 'md',
    },
  },

  // Select
  Select: {
    baseStyle: {
      field: {
        borderRadius: 'md',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: 'outline',
        },
        _disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      },
    },
    variants: {
      outline: {
        field: {
          border: '1px solid',
          borderColor: 'gray.300',
          bg: 'white',
          _hover: {
            borderColor: 'gray.400',
          },
        },
      },
      filled: {
        field: {
          bg: 'gray.100',
          _hover: {
            bg: 'gray.200',
          },
          _focus: {
            bg: 'white',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
      size: 'md',
    },
  },

  // Checkbox
  Checkbox: {
    baseStyle: {
      control: {
        borderRadius: 'sm',
        borderColor: 'gray.300',
        _checked: {
          bg: 'brand.500',
          borderColor: 'brand.500',
          _hover: {
            bg: 'brand.600',
            borderColor: 'brand.600',
          },
        },
        _focus: {
          boxShadow: 'outline',
        },
        _disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      },
      label: {
        fontWeight: 'normal',
        ml: 2,
      },
    },
    sizes: {
      sm: {
        control: { width: 3, height: 3 },
        label: { fontSize: 'sm' },
      },
      md: {
        control: { width: 4, height: 4 },
        label: { fontSize: 'md' },
      },
      lg: {
        control: { width: 5, height: 5 },
        label: { fontSize: 'lg' },
      },
    },
    defaultProps: {
      size: 'md',
      colorScheme: 'brand',
    },
  },

  // Radio
  Radio: {
    baseStyle: {
      control: {
        borderColor: 'gray.300',
        _checked: {
          bg: 'brand.500',
          borderColor: 'brand.500',
          _hover: {
            bg: 'brand.600',
            borderColor: 'brand.600',
          },
        },
        _focus: {
          boxShadow: 'outline',
        },
        _disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      },
      label: {
        fontWeight: 'normal',
        ml: 2,
      },
    },
    sizes: {
      sm: {
        control: { width: 3, height: 3 },
        label: { fontSize: 'sm' },
      },
      md: {
        control: { width: 4, height: 4 },
        label: { fontSize: 'md' },
      },
      lg: {
        control: { width: 5, height: 5 },
        label: { fontSize: 'lg' },
      },
    },
    defaultProps: {
      size: 'md',
      colorScheme: 'brand',
    },
  },

  // Switch/Toggle
  Switch: {
    baseStyle: {
      track: {
        bg: 'gray.300',
        _checked: {
          bg: 'brand.500',
        },
        _focus: {
          boxShadow: 'outline',
        },
        _disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      },
      thumb: {
        bg: 'white',
      },
    },
    sizes: {
      sm: {
        track: { width: 7, height: 4 },
        thumb: { width: 3, height: 3 },
      },
      md: {
        track: { width: 10, height: 5 },
        thumb: { width: 4, height: 4 },
      },
      lg: {
        track: { width: 12, height: 6 },
        thumb: { width: 5, height: 5 },
      },
    },
    defaultProps: {
      size: 'md',
      colorScheme: 'brand',
    },
  },

  // Card
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
        borderWidth: '1px',
        borderColor: 'gray.200',
        transition: 'all 0.2s ease-in-out',
        _hover: {
          boxShadow: 'lg',
        },
      },
      header: {
        padding: 6,
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.100',
      },
      body: {
        padding: 6,
      },
      footer: {
        padding: 6,
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
      },
    },
    variants: {
      elevated: {
        container: {
          boxShadow: 'md',
          _hover: {
            boxShadow: 'lg',
            transform: 'translateY(-2px)',
          },
        },
      },
      outline: {
        container: {
          boxShadow: 'none',
          borderWidth: '1px',
          borderColor: 'gray.200',
        },
      },
      filled: {
        container: {
          boxShadow: 'none',
          bg: 'gray.50',
        },
      },
    },
    defaultProps: {
      variant: 'elevated',
    },
  },

  // Table
  Table: {
    baseStyle: {
      table: {
        fontVariantNumeric: 'lining-nums tabular-nums',
        borderCollapse: 'collapse',
        width: 'full',
      },
      th: {
        fontWeight: 'semibold',
        textAlign: 'start',
        textTransform: 'uppercase',
        letterSpacing: 'wider',
        fontSize: 'xs',
      },
      td: {
        textAlign: 'start',
      },
    },
    variants: {
      simple: {
        th: {
          borderBottom: '1px solid',
          borderColor: 'gray.300',
          padding: 4,
          color: 'gray.600',
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          padding: 4,
        },
        tbody: {
          tr: {
            _hover: {
              bg: 'gray.50',
            },
          },
        },
        caption: {
          mt: 4,
          fontStyle: 'italic',
          color: 'gray.600',
        },
      },
      striped: {
        th: {
          borderBottom: '1px solid',
          borderColor: 'gray.300',
          padding: 4,
          color: 'gray.600',
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          padding: 4,
        },
        tbody: {
          tr: {
            _odd: {
              bg: 'gray.50',
            },
            _hover: {
              bg: 'gray.100',
            },
          },
        },
      },
    },
    defaultProps: {
      variant: 'simple',
    },
  },

  // Modal/Dialog
  Modal: {
    baseStyle: {
      overlay: {
        bg: 'blackAlpha.600',
        backdropFilter: 'blur(2px)',
      },
      dialog: {
        borderRadius: 'lg',
        bg: 'white',
        boxShadow: 'xl',
      },
      header: {
        padding: 6,
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.100',
      },
      body: {
        padding: 6,
      },
      footer: {
        padding: 6,
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
      },
    },
    sizes: {
      xs: {
        dialog: { maxW: '20rem' },
      },
      sm: {
        dialog: { maxW: '30rem' },
      },
      md: {
        dialog: { maxW: '40rem' },
      },
      lg: {
        dialog: { maxW: '50rem' },
      },
      xl: {
        dialog: { maxW: '60rem' },
      },
      full: {
        dialog: { maxW: '100vw', minH: '100vh' },
      },
    },
    defaultProps: {
      size: 'md',
    },
  },

  // Tabs
  Tabs: {
    baseStyle: {
      tab: {
        fontWeight: 'medium',
        _focus: {
          boxShadow: 'none',
        },
        _selected: {
          fontWeight: 'semibold',
        },
      },
    },
    variants: {
      line: {
        tab: {
          _selected: {
            color: 'brand.500',
            borderColor: 'brand.500',
          },
          _hover: {
            color: 'brand.400',
          },
          _active: {
            bg: 'brand.50',
          },
        },
      },
      enclosed: {
        tab: {
          _selected: {
            color: 'brand.500',
            bg: 'white',
            borderColor: 'gray.200',
            borderTopColor: 'brand.500',
            borderTopWidth: '2px',
            marginBottom: '-1px',
          },
        },
      },
      'soft-rounded': {
        tab: {
          borderRadius: 'full',
          _selected: {
            color: 'white',
            bg: 'brand.500',
          },
          _hover: {
            bg: 'gray.100',
          },
        },
      },
    },
    defaultProps: {
      variant: 'line',
      colorScheme: 'brand',
    },
  },

  // Badge/Tag
  Badge: {
    baseStyle: {
      borderRadius: 'md',
      textTransform: 'capitalize',
      fontWeight: 'medium',
      px: 2,
      py: 1,
      fontSize: 'xs',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : 
            props.colorScheme === 'red' ? 'error.500' :
            props.colorScheme === 'green' ? 'success.500' :
            props.colorScheme === 'yellow' ? 'warning.500' :
            props.colorScheme === 'blue' ? 'info.500' : 'gray.500',
        color: 'white',
      }),
      subtle: (props: any) => ({
        bg: props.colorScheme === 'brand' ? 'brand.100' : 
            props.colorScheme === 'red' ? 'error.100' :
            props.colorScheme === 'green' ? 'success.100' :
            props.colorScheme === 'yellow' ? 'warning.100' :
            props.colorScheme === 'blue' ? 'info.100' : 'gray.100',
        color: props.colorScheme === 'brand' ? 'brand.800' : 
               props.colorScheme === 'red' ? 'error.800' :
               props.colorScheme === 'green' ? 'success.800' :
               props.colorScheme === 'yellow' ? 'warning.800' :
               props.colorScheme === 'blue' ? 'info.800' : 'gray.800',
      }),
      outline: (props: any) => ({
        bg: 'transparent',
        borderWidth: '1px',
        borderColor: props.colorScheme === 'brand' ? 'brand.500' : 
                     props.colorScheme === 'red' ? 'error.500' :
                     props.colorScheme === 'green' ? 'success.500' :
                     props.colorScheme === 'yellow' ? 'warning.500' :
                     props.colorScheme === 'blue' ? 'info.500' : 'gray.500',
        color: props.colorScheme === 'brand' ? 'brand.500' : 
               props.colorScheme === 'red' ? 'error.500' :
               props.colorScheme === 'green' ? 'success.500' :
               props.colorScheme === 'yellow' ? 'warning.500' :
               props.colorScheme === 'blue' ? 'info.500' : 'gray.500',
      }),
    },
    defaultProps: {
      variant: 'subtle',
      colorScheme: 'gray',
    },
  },

  // Tooltip
  Tooltip: {
    baseStyle: {
      borderRadius: 'md',
      bg: 'gray.800',
      color: 'white',
      padding: '2',
      fontSize: 'sm',
      boxShadow: 'md',
      maxW: '320px',
      zIndex: 'tooltip',
    },
  },

  // Progress indicators
  Progress: {
    baseStyle: {
      track: {
        bg: 'gray.100',
      },
      filledTrack: {
        bg: 'brand.500',
      },
    },
    sizes: {
      xs: {
        track: { h: 1 },
      },
      sm: {
        track: { h: 2 },
      },
      md: {
        track: { h: 3 },
      },
      lg: {
        track: { h: 4 },
      },
    },
    defaultProps: {
      size: 'md',
      colorScheme: 'brand',
    },
  },

  // Spinner
  Spinner: {
    baseStyle: {
      color: 'brand.500',
    },
    sizes: {
      xs: {
        w: 3,
        h: 3,
      },
      sm: {
        w: 4,
        h: 4,
      },
      md: {
        w: 6,
        h: 6,
      },
      lg: {
        w: 8,
        h: 8,
      },
      xl: {
        w: 12,
        h: 12,
      },
    },
    defaultProps: {
      size: 'md',
    },
  },

  // Avatar
  Avatar: {
    baseStyle: {
      container: {
        bg: 'gray.200',
        color: 'gray.800',
      },
      excessLabel: {
        bg: 'gray.200',
        color: 'gray.800',
      },
    },
    sizes: {
      xs: {
        container: {
          width: 6,
          height: 6,
          fontSize: 'xs',
        },
        excessLabel: {
          width: 6,
          height: 6,
          fontSize: 'xs',
        },
      },
      sm: {
        container: {
          width: 8,
          height: 8,
          fontSize: 'sm',
        },
        excessLabel: {
          width: 8,
          height: 8,
          fontSize: 'sm',
        },
      },
      md: {
        container: {
          width: 12,
          height: 12,
          fontSize: 'md',
        },
        excessLabel: {
          width: 12,
          height: 12,
          fontSize: 'md',
        },
      },
      lg: {
        container: {
          width: 16,
          height: 16,
          fontSize: 'lg',
        },
        excessLabel: {
          width: 16,
          height: 16,
          fontSize: 'lg',
        },
      },
      xl: {
        container: {
          width: 24,
          height: 24,
          fontSize: 'xl',
        },
        excessLabel: {
          width: 24,
          height: 24,
          fontSize: 'xl',
        },
      },
    },
    defaultProps: {
      size: 'md',
    },
  },
}

// Define global styles
const styles = {
  global: {
    html: {
      fontSize: '16px',
      lineHeight: 'tall',
    },
    body: {
      bg: 'gray.50',
      color: 'gray.800',
      fontFamily: 'body',
      fontSize: 'md',
      lineHeight: 'base',
      transition: 'background-color 0.2s',
      minHeight: '100vh',
    },
    '*': {
      borderColor: 'gray.200',
      borderWidth: 0,
      borderStyle: 'solid',
    },
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
    // Headings
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: 'heading',
      fontWeight: 'semibold',
      lineHeight: 'shorter',
      margin: 0,
      mb: 2,
    },
    h1: {
      fontSize: '5xl',
      letterSpacing: 'tight',
      fontWeight: 'bold',
    },
    h2: {
      fontSize: '4xl',
      letterSpacing: 'tight',
    },
    h3: {
      fontSize: '3xl',
    },
    h4: {
      fontSize: '2xl',
    },
    h5: {
      fontSize: 'xl',
    },
    h6: {
      fontSize: 'lg',
    },
    // Text elements
    p: {
      marginTop: 0,
      marginBottom: 4,
      lineHeight: 'tall',
    },
    a: {
      color: 'brand.500',
      textDecoration: 'none',
      _hover: {
        textDecoration: 'underline',
        color: 'brand.600',
      },
    },
    // Lists
    'ul, ol': {
      paddingLeft: 6,
      marginBottom: 4,
    },
    li: {
      marginBottom: 2,
    },
    // Focus styles for keyboard navigation
    ':focus:not(:focus-visible)': {
      boxShadow: 'none',
    },
    ':focus-visible': {
      boxShadow: 'outline',
      outline: 'none',
    },
    // Dark mode styles
    '.chakra-ui-dark': {
      body: {
        bg: 'modes.dark.bg.primary',
        color: 'modes.dark.text.primary',
      },
      '*': {
        borderColor: 'gray.700',
      },
    },
  },
}

// Define typography scale
const fonts = {
  // Primary font family: clean, legible sans-serif font
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
}

// Font sizes for modular scale
const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px (Body Medium - Default)
  lg: '1.125rem',   // 18px (Body Large)
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px (H4)
  '3xl': '1.875rem', // 30px (H3)
  '4xl': '2rem',    // 32px (H2)
  '5xl': '2.5rem',  // 40px (H1)
  '6xl': '3rem',    // 48px
}

// Font weights
const fontWeights = {
  normal: 400,      // Regular
  medium: 500,      // Medium
  semibold: 600,    // SemiBold
  bold: 700,        // Bold
}

// Line heights
const lineHeights = {
  normal: 'normal',
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,        // Default for body text
  tall: 1.625,
  taller: 1.7,      // For better readability
}

// Define spacing units
const space = {
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px (base unit)
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
}

// Define border radii
const radii = {
  none: '0',
  sm: '0.25rem',    // 4px (small inputs/buttons)
  md: '0.375rem',   // 6px (medium inputs/buttons)
  lg: '0.5rem',     // 8px (cards/modals)
  xl: '0.75rem',    // 12px (larger cards/modals)
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // Fully rounded (for pills, avatars)
}

// Create the theme
const theme = extendTheme({
  colors,
  components,
  styles,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  space,
  radii,
  shadows: {
    outline: '0 0 0 2px rgba(49, 130, 206, 0.2)', // Subtle outline using brand color
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
})

export default theme
