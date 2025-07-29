/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary - Rich Professional Brown (Medical Trust)
        primary: {
          50: '#faf7f5',
          100: '#f4efea',
          200: '#e8ddd4',
          300: '#d6c4b5',
          400: '#c1a38f',
          500: '#a8845f',
          600: '#8b6d47',
          700: '#71553a',
          800: '#5d4630',
          900: '#4e3a28',
          950: '#2a1e15',
        },
        
        // Secondary - Warm Cream (Clean & Calming)
        secondary: {
          50: '#fffef9',
          100: '#fffbf0',
          200: '#fef5dc',
          300: '#fcebba',
          400: '#f9dc8c',
          500: '#f5ca5d',
          600: '#e8b23f',
          700: '#cc9633',
          800: '#a6782d',
          900: '#8a6128',
          950: '#4a3317',
        },
        
        // Accent - Sage Green (Health & Nature)
        accent: {
          50: '#f6f8f6',
          100: '#e9f1e9',
          200: '#d5e4d5',
          300: '#b4d0b4',
          400: '#8bb58b',
          500: '#6a9a6a',
          600: '#527d52',
          700: '#426442',
          800: '#385138',
          900: '#2f432f',
          950: '#1a251a',
        },

        // Enhanced Status Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        
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
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },

        // Enhanced Gray Scale (Warmer Tone)
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

        // Medical Professional Theme Colors
        medical: {
          cream: {
            50: '#fffef9',
            100: '#fffbf0',
            200: '#fef5dc',
            300: '#fcebba',
            400: '#f9dc8c',
            500: '#f5ca5d',
          },
          brown: {
            50: '#faf7f5',
            500: '#a8845f',
            600: '#8b6d47',
            700: '#71553a',
          },
          sage: {
            50: '#f6f8f6',
            500: '#6a9a6a',
            600: '#527d52',
          },
          trust: {
            50: '#f8fafb',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
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
        serif: [
          'Playfair Display',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif'
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
        'card': '0 1px 3px 0 rgb(139 109 71 / 0.1), 0 1px 2px -1px rgb(139 109 71 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(139 109 71 / 0.1), 0 4px 6px -4px rgb(139 109 71 / 0.1)',
        'button': '0 4px 6px -1px rgb(139 109 71 / 0.1), 0 2px 4px -2px rgb(139 109 71 / 0.1)',
        'button-hover': '0 10px 15px -3px rgb(139 109 71 / 0.1), 0 4px 6px -4px rgb(139 109 71 / 0.1)',
        'medical': '0 20px 25px -5px rgb(139 109 71 / 0.1), 0 10px 10px -5px rgb(139 109 71 / 0.04)',
        'medical-lg': '0 25px 50px -12px rgb(139 109 71 / 0.25)',
        'trust': '0 4px 14px 0 rgb(139 109 71 / 0.08)',
        'trust-lg': '0 8px 25px 0 rgb(139 109 71 / 0.12)',
        'glow': '0 0 20px rgb(139 109 71 / 0.15)',
        'glow-lg': '0 0 40px rgb(139 109 71 / 0.2)',
        'inner': 'inset 0 2px 4px 0 rgb(139 109 71 / 0.06)',
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
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'scale-in': 'scaleIn 0.2s ease-out',
        'medical-shine': 'medicalShine 2s ease-in-out infinite',
        'trust-pulse': 'trustPulse 3s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%': { 
            boxShadow: '0 0 20px rgb(139 109 71 / 0.15)' 
          },
          '100%': { 
            boxShadow: '0 0 40px rgb(139 109 71 / 0.3)' 
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
        medicalShine: {
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
        trustPulse: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '1' 
          },
          '50%': { 
            transform: 'scale(1.05)',
            opacity: '0.9' 
          },
        },
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #faf7f5 0%, #fffef9 100%)',
        'gradient-hero': 'linear-gradient(135deg, #faf7f5 0%, #fffef9 25%, #ffffff 50%, #fffef9 75%, #faf7f5 100%)',
        'gradient-medical': 'linear-gradient(135deg, #8b6d47 0%, #a8845f 100%)',
        'gradient-trust': 'linear-gradient(135deg, #6a9a6a 0%, #527d52 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f5ca5d 0%, #e8b23f 100%)',
        'medical-pattern': 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%238b6d47" fill-opacity="0.03" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
        'trust-pattern': 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%236a9a6a" fill-opacity="0.02" fill-rule="evenodd"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
      },

      backdropBlur: {
        'xs': '2px',
      },

      // Custom utilities for medical theme
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },

      // Enhanced line heights for medical content
      lineHeight: {
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
      },

      // Professional letter spacing
      letterSpacing: {
        '0.025em': '0.025em',
        '0.05em': '0.05em',
        '0.1em': '0.1em',
      },

      // Medical-grade transitions
      transitionTimingFunction: {
        'medical': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'trust': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'professional': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },

      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },

      // Professional scales
      scale: {
        '102': '1.02',
        '103': '1.03',
        '175': '1.75',
      },

      // Z-index system
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Custom utilities for medical theme
    function({ addUtilities, addComponents }) {
      const newUtilities = {
        // Medical glow effect
        '.medical-glow': {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(139, 109, 71, 0.1) 0%, transparent 70%)',
            animation: 'rotate 20s linear infinite',
            pointerEvents: 'none',
          },
        },
        
        // Professional text gradients
        '.text-gradient-medical': {
          background: 'linear-gradient(135deg, #8b6d47 0%, #a8845f 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        '.text-gradient-trust': {
          background: 'linear-gradient(135deg, #6a9a6a 0%, #527d52 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        '.text-gradient-warm': {
          background: 'linear-gradient(135deg, #f5ca5d 0%, #e8b23f 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        // Glass morphism effects
        '.glass-medical': {
          background: 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          border: '1px solid rgba(139, 109, 71, 0.18)',
        },
        
        '.glass-trust': {
          background: 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          border: '1px solid rgba(106, 154, 106, 0.18)',
        },
        
        // Professional patterns
        '.pattern-medical': {
          'background-image': 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%238b6d47" fill-opacity="0.03" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
        },
        
        '.pattern-trust': {
          'background-image': 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%236a9a6a" fill-opacity="0.02" fill-rule="evenodd"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
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
        
        // Scrollbar utilities
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgb(139 109 71 / 0.3) rgb(250 247 245)',
        },
        
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        
        // Professional focus utilities
        '.focus-ring-medical': {
          '&:focus': {
            outline: '2px solid #8b6d47',
            'outline-offset': '2px',
            'box-shadow': '0 0 0 4px rgba(139, 109, 71, 0.1)',
          },
        },
        
        '.focus-ring-trust': {
          '&:focus': {
            outline: '2px solid #6a9a6a',
            'outline-offset': '2px',
            'box-shadow': '0 0 0 4px rgba(106, 154, 106, 0.1)',
          },
        },
      }
      
      const newComponents = {
        // Professional button components
        '.btn-medical': {
          background: 'linear-gradient(135deg, #8b6d47 0%, #71553a 100%)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          fontWeight: '600',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 6px -1px rgb(139 109 71 / 0.1), 0 2px 4px -2px rgb(139 109 71 / 0.1)',
          
          '&:hover': {
            background: 'linear-gradient(135deg, #71553a 0%, #5d4630 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgb(139 109 71 / 0.1), 0 4px 6px -4px rgb(139 109 71 / 0.1)',
          },
        },
        
        '.btn-trust': {
          background: 'linear-gradient(135deg, #6a9a6a 0%, #527d52 100%)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          fontWeight: '600',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 6px -1px rgb(106 154 106 / 0.1), 0 2px 4px -2px rgb(106 154 106 / 0.1)',
          
          '&:hover': {
            background: 'linear-gradient(135deg, #527d52 0%, #426442 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgb(106 154 106 / 0.1), 0 4px 6px -4px rgb(106 154 106 / 0.1)',
          },
        },
        
        // Professional card components
        '.card-medical': {
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 1px 3px 0 rgb(139 109 71 / 0.1), 0 1px 2px -1px rgb(139 109 71 / 0.1)',
          border: '1px solid rgb(250 247 245)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgb(139 109 71 / 0.1), 0 10px 10px -5px rgb(139 109 71 / 0.04)',
            borderColor: 'rgb(232 221 212)',
          },
        },
        
        '.card-trust': {
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1.5rem',
          boxShadow: '0 1px 3px 0 rgb(106 154 106 / 0.1), 0 1px 2px -1px rgb(106 154 106 / 0.1)',
          border: '1px solid rgb(246 248 246)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)',
          
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgb(106 154 106 / 0.1), 0 10px 10px -5px rgb(106 154 106 / 0.04)',
            borderColor: 'rgb(213 228 213)',
            background: 'rgba(255, 255, 255, 1)',
          },
        },
      }
      
      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
}