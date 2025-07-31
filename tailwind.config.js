/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary - Modern Stone/Brown (Professional & Sophisticated)
        primary: {
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
        
        // Secondary - Warm Amber (Energy & Warmth)
        secondary: {
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
        
        // Accent - Rich Orange (Trust & Confidence)
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // Professional Gray Scale (Stone-based)
        stone: {
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

        // Modern Amber variants
        amber: {
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

        // Orange variants for accents
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },

        // Medical Professional Theme Colors
        medical: {
          warm: {
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
          },
          amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          },
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
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
        'card': '0 1px 3px 0 rgb(68 64 60 / 0.1), 0 1px 2px -1px rgb(68 64 60 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(68 64 60 / 0.1), 0 4px 6px -4px rgb(68 64 60 / 0.1)',
        'button': '0 4px 6px -1px rgb(68 64 60 / 0.1), 0 2px 4px -2px rgb(68 64 60 / 0.1)',
        'button-hover': '0 10px 15px -3px rgb(68 64 60 / 0.1), 0 4px 6px -4px rgb(68 64 60 / 0.1)',
        'medical': '0 20px 25px -5px rgb(68 64 60 / 0.1), 0 10px 10px -5px rgb(68 64 60 / 0.04)',
        'medical-lg': '0 25px 50px -12px rgb(68 64 60 / 0.25)',
        'trust': '0 4px 14px 0 rgb(68 64 60 / 0.08)',
        'trust-lg': '0 8px 25px 0 rgb(68 64 60 / 0.12)',
        'glow': '0 0 20px rgb(217 119 6 / 0.15)',
        'glow-lg': '0 0 40px rgb(217 119 6 / 0.2)',
        'inner': 'inset 0 2px 4px 0 rgb(68 64 60 / 0.06)',
        'warm': '0 4px 14px 0 rgb(217 119 6 / 0.1)',
        'warm-lg': '0 20px 25px -5px rgb(217 119 6 / 0.1), 0 10px 10px -5px rgb(217 119 6 / 0.04)',
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
        'warm-glow': 'warmGlow 3s ease-in-out infinite alternate',
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
            boxShadow: '0 0 20px rgb(217 119 6 / 0.15)' 
          },
          '100%': { 
            boxShadow: '0 0 40px rgb(217 119 6 / 0.3)' 
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
        warmGlow: {
          '0%': { 
            boxShadow: '0 0 20px rgb(217 119 6 / 0.1)' 
          },
          '100%': { 
            boxShadow: '0 0 40px rgb(234 88 12 / 0.2)' 
          },
        },
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fafaf9 0%, #fffbeb 100%)',
        'gradient-hero': 'linear-gradient(135deg, #fafaf9 0%, #fffbeb 25%, #ffffff 50%, #fff7ed 75%, #fafaf9 100%)',
        'gradient-medical': 'linear-gradient(135deg, #57534e 0%, #78716c 100%)',
        'gradient-warm': 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
        'gradient-trust': 'linear-gradient(135deg, #475569 0%, #334155 100%)',
        'gradient-amber': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'medical-pattern': 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2357534e" fill-opacity="0.03" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
        'trust-pattern': 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23475569" fill-opacity="0.02" fill-rule="evenodd"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
        'warm-pattern': 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23d97706" fill-opacity="0.04" fill-rule="evenodd"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3Ccircle cx="10" cy="10" r="2"/%3E%3Ccircle cx="50" cy="50" r="2"/%3E%3C/g%3E%3C/svg%3E")',
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
        'warm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
            background: 'radial-gradient(circle, rgba(68, 64, 60, 0.1) 0%, transparent 70%)',
            animation: 'rotate 20s linear infinite',
            pointerEvents: 'none',
          },
        },
        
        // Professional text gradients
        '.text-gradient-medical': {
          background: 'linear-gradient(135deg, #57534e 0%, #78716c 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        '.text-gradient-warm': {
          background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        '.text-gradient-amber': {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        '.text-gradient-trust': {
          background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        // Glass morphism effects
        '.glass-medical': {
          background: 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          border: '1px solid rgba(68, 64, 60, 0.18)',
        },
        
        '.glass-warm': {
          background: 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          border: '1px solid rgba(217, 119, 6, 0.18)',
        },
        
        '.glass-trust': {
          background: 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          border: '1px solid rgba(71, 85, 105, 0.18)',
        },
        
        // Professional patterns
        '.pattern-medical': {
          'background-image': 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2357534e" fill-opacity="0.03" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
        },
        
        '.pattern-warm': {
          'background-image': 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23d97706" fill-opacity="0.04" fill-rule="evenodd"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3Ccircle cx="10" cy="10" r="2"/%3E%3Ccircle cx="50" cy="50" r="2"/%3E%3C/g%3E%3C/svg%3E")',
        },
        
        '.pattern-trust': {
          'background-image': 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23475569" fill-opacity="0.02" fill-rule="evenodd"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
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
          'scrollbar-color': 'rgb(68 64 60 / 0.3) rgb(250 250 249)',
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
            outline: '2px solid #57534e',
            'outline-offset': '2px',
            'box-shadow': '0 0 0 4px rgba(68, 64, 60, 0.1)',
          },
        },
        
        '.focus-ring-warm': {
          '&:focus': {
            outline: '2px solid #d97706',
            'outline-offset': '2px',
            'box-shadow': '0 0 0 4px rgba(217, 119, 6, 0.1)',
          },
        },
        
        '.focus-ring-trust': {
          '&:focus': {
            outline: '2px solid #475569',
            'outline-offset': '2px',
            'box-shadow': '0 0 0 4px rgba(71, 85, 105, 0.1)',
          },
        },
      }
      
      const newComponents = {
        // Professional button components
        '.btn-medical': {
          background: 'linear-gradient(135deg, #57534e 0%, #44403c 100%)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          fontWeight: '600',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 6px -1px rgb(68 64 60 / 0.1), 0 2px 4px -2px rgb(68 64 60 / 0.1)',
          
          '&:hover': {
            background: 'linear-gradient(135deg, #44403c 0%, #292524 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgb(68 64 60 / 0.1), 0 4px 6px -4px rgb(68 64 60 / 0.1)',
          },
        },
        
        '.btn-warm': {
          background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          fontWeight: '600',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 6px -1px rgb(217 119 6 / 0.1), 0 2px 4px -2px rgb(217 119 6 / 0.1)',
          
          '&:hover': {
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgb(217 119 6 / 0.1), 0 4px 6px -4px rgb(217 119 6 / 0.1)',
          },
        },
        
        '.btn-trust': {
          background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          fontWeight: '600',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 6px -1px rgb(71 85 105 / 0.1), 0 2px 4px -2px rgb(71 85 105 / 0.1)',
          
          '&:hover': {
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgb(71 85 105 / 0.1), 0 4px 6px -4px rgb(71 85 105 / 0.1)',
          },
        },
        
        // Professional card components
        '.card-medical': {
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 1px 3px 0 rgb(68 64 60 / 0.1), 0 1px 2px -1px rgb(68 64 60 / 0.1)',
          border: '1px solid rgb(250 250 249)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgb(68 64 60 / 0.1), 0 10px 10px -5px rgb(68 64 60 / 0.04)',
            borderColor: 'rgb(231 229 228)',
          },
        },
        
        '.card-warm': {
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1.5rem',
          boxShadow: '0 1px 3px 0 rgb(217 119 6 / 0.1), 0 1px 2px -1px rgb(217 119 6 / 0.1)',
          border: '1px solid rgb(255 251 235)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)',
          
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgb(217 119 6 / 0.1), 0 10px 10px -5px rgb(217 119 6 / 0.04)',
            borderColor: 'rgb(254 215 170)',
            background: 'rgba(255, 255, 255, 1)',
          },
        },
        
        '.card-trust': {
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1.5rem',
          boxShadow: '0 1px 3px 0 rgb(71 85 105 / 0.1), 0 1px 2px -1px rgb(71 85 105 / 0.1)',
          border: '1px solid rgb(248 250 252)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)',
          
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgb(71 85 105 / 0.1), 0 10px 10px -5px rgb(71 85 105 / 0.04)',
            borderColor: 'rgb(203 213 225)',
            background: 'rgba(255, 255, 255, 1)',
          },
        },
      }
      
      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
}