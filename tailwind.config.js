/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary - Warm Professional Brown
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#8b6f47',
          800: '#723a28',
          900: '#5d2f1e',
          950: '#2e1a0f',
        },
        // Accent - Warm Cream/Champagne
        accent: {
          50: '#fffcf7',
          100: '#fef7e7',
          200: '#fdecc8',
          300: '#fbdc9e',
          400: '#f8c572',
          500: '#f5ab50',
          600: '#e68e2e',
          700: '#c67424',
          800: '#9f5c23',
          900: '#824c22',
          950: '#46260f',
        },
        // Success - Warm Forest Green (complements brown)
        success: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8fd18f',
          400: '#5cb85c',
          500: '#3e9b3e',
          600: '#2f7d2f',
          700: '#286428',
          800: '#235023',
          900: '#1e421e',
          950: '#0d240d',
        },
        // Warning - Warm Golden Orange
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Error/Danger - Warm Terracotta Red
        error: {
          50: '#fef6f2',
          100: '#feeee6',
          200: '#fcdcc8',
          300: '#f9c0a0',
          400: '#f49970',
          500: '#e07448',
          600: '#c85a30',
          700: '#a84826',
          800: '#8a3e24',
          900: '#723621',
          950: '#3e1a0f',
        },
        // Enhanced Warm Gray Scale
        gray: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // Dental Theme Specific Colors - Brown Edition
        dental: {
          brown: {
            50: '#fdf8f6',
            500: '#8b6f47',
            600: '#723a28',
          },
          cream: {
            50: '#fffcf7',
            500: '#f5ab50',
            600: '#e68e2e',
          },
          warm: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
          }
        }
      },
      fontFamily: {
        sans: [
          'Inter', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Oxygen', 
          'Ubuntu', 
          'Cantarell', 
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'Courier New',
          'monospace'
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '2xs': '16rem',
        '8xl': '88rem',
        '9xl': '96rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'button': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'button-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'dental': '0 20px 25px -5px rgb(139 111 71 / 0.1), 0 10px 10px -5px rgb(139 111 71 / 0.04)',
        'dental-lg': '0 25px 50px -12px rgb(139 111 71 / 0.25)',
        'glow': '0 0 20px rgb(139 111 71 / 0.15)',
        'glow-lg': '0 0 40px rgb(139 111 71 / 0.2)',
        'inner-glow': 'inset 0 2px 4px 0 rgb(139 111 71 / 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'scale-in': 'scaleIn 0.2s ease-out',
        'dental-shine': 'dentalShine 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        slideUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(100%)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        slideDown: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(-100%)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        slideInLeft: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(-100%)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0)' 
          },
        },
        slideInRight: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(100%)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0)' 
          },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { 
            transform: 'translate3d(0, 0, 0)' 
          },
          '40%, 43%': { 
            transform: 'translate3d(0, -8px, 0)' 
          },
          '70%': { 
            transform: 'translate3d(0, -4px, 0)' 
          },
          '90%': { 
            transform: 'translate3d(0, -2px, 0)' 
          },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%': { 
            boxShadow: '0 0 20px rgb(139 111 71 / 0.15)' 
          },
          '100%': { 
            boxShadow: '0 0 40px rgb(139 111 71 / 0.3)' 
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.9)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1)' 
          },
        },
        dentalShine: {
          '0%': { 
            transform: 'translateX(-100%)' 
          },
          '50%': { 
            transform: 'translateX(0%)' 
          },
          '100%': { 
            transform: 'translateX(100%)' 
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fdf8f6 0%, #fffcf7 100%)',
        'gradient-hero': 'linear-gradient(135deg, #fdf8f6 0%, #fffcf7 25%, #f2e8e5 50%, #fef7e7 75%, #fdf8f6 100%)',
        'gradient-card': 'linear-gradient(135deg, #8b6f47 0%, #723a28 100%)',
        'gradient-dental': 'linear-gradient(135deg, #8b6f47 0%, #f5ab50 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dental-pattern': 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%238b6f47" fill-opacity="0.05" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
      },
      backdropBlur: {
        'xs': '2px',
      },
      backdropBrightness: {
        '25': '.25',
        '175': '1.75',
      },
      blur: {
        '4xl': '72px',
        '5xl': '96px',
      },
      brightness: {
        '25': '.25',
        '175': '1.75',
      },
      contrast: {
        '25': '.25',
        '175': '1.75',
      },
      dropShadow: {
        'dental': '0 4px 6px rgb(139 111 71 / 0.1)',
        'dental-lg': '0 10px 15px rgb(139 111 71 / 0.15)',
      },
      grayscale: {
        '50': '0.5',
      },
      hueRotate: {
        '15': '15deg',
        '30': '30deg',
        '60': '60deg',
        '240': '240deg',
      },
      invert: {
        '25': '.25',
        '75': '.75',
      },
      saturate: {
        '25': '.25',
        '75': '.75',
        '125': '1.25',
        '175': '1.75',
      },
      sepia: {
        '25': '.25',
        '75': '.75',
      },
      skew: {
        '15': '15deg',
        '30': '30deg',
      },
      transitionDelay: {
        '75': '75ms',
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
        '1200': '1200ms',
        '1500': '1500ms',
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'dental': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
        '175': '1.75',
      },
      rotate: {
        '15': '15deg',
        '30': '30deg',
        '135': '135deg',
        '270': '270deg',
      },
      translate: {
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Custom utilities for dental theme
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      // Custom text decorations
      textDecorationThickness: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      textUnderlineOffset: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
        '6': '6px',
        '7': '7px',
        '8': '8px',
      },
      // Custom line heights for better typography
      lineHeight: {
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
      },
      // Custom letter spacing
      letterSpacing: {
        '0.025em': '0.025em',
        '0.05em': '0.05em',
        '0.1em': '0.1em',
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.dental-glow': {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(139, 111, 71, 0.1) 0%, transparent 70%)',
            animation: 'rotate 20s linear infinite',
            pointerEvents: 'none',
          },
        },
        '.text-gradient-dental': {
          background: 'linear-gradient(135deg, #8b6f47 0%, #f5ab50 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.backdrop-blur-dental': {
          'backdrop-filter': 'blur(10px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
        },
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.dental-pattern': {
          'background-image': 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%238b6f47" fill-opacity="0.05" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
        },
        // Text utilities
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        // Line clamp utilities
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
        '.line-clamp-4': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '4',
        },
        // Scrollbar utilities
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // Focus utilities
        '.focus-ring': {
          '&:focus': {
            outline: '2px solid #8b6f47',
            'outline-offset': '2px',
          },
        },
        '.focus-ring-dental': {
          '&:focus': {
            outline: '2px solid #8b6f47',
            'outline-offset': '2px',
            'box-shadow': '0 0 0 4px rgba(139, 111, 71, 0.1)',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}