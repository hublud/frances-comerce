/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#fff8fb',
        foreground: '#5a1136',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#4b0a2b',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#4b0a2b',
        },
        primary: {
          DEFAULT: '#f0008e',
          foreground: '#fffafc',
          hover: '#d9007f',
        },
        secondary: {
          DEFAULT: '#ffe2ef',
          foreground: '#4b0a2b',
        },
        muted: {
          DEFAULT: '#ffecf4',
          foreground: '#814a60',
        },
        accent: {
          DEFAULT: '#ffb5db',
          foreground: '#37001d',
        },
        destructive: {
          DEFAULT: '#d2006c',
          foreground: '#fffafc',
        },
        border: '#fad6e5',
        input: '#fad6e5',
        ring: '#f0008e',
        // Also provide convenient color aliases
        pink: {
          50: '#fff8fb',
          100: '#ffecf4',
          200: '#ffe2ef',
          300: '#ffb5db',
          400: '#ff70b8',
          500: '#f0008e',
          600: '#d2006c',
          700: '#ab0056',
          vibrant: '#f0008e',
          soft: '#ffe2ef',
          light: '#fff8fb',
          border: '#fad6e5',
        },
        berry: {
          DEFAULT: '#5a1136',
          dark: '#37001d',
          deep: '#4b0a2b',
          muted: '#814a60',
        },
      },
      borderRadius: {
        lg: 'var(--radius, 0.625rem)',
        md: 'calc(var(--radius, 0.625rem) - 2px)',
        sm: 'calc(var(--radius, 0.625rem) - 4px)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'mobile-nav': '0 -4px 20px rgba(90, 17, 54, 0.08)',
        'card-soft': '0 4px 16px -2px rgba(90, 17, 54, 0.06)',
        'card-hover': '0 12px 28px -4px rgba(240, 0, 142, 0.16)',
        'glow-pink': '0 0 25px rgba(240, 0, 142, 0.25)',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
