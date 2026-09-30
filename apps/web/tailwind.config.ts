import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#F4F6FA',
        card: '#FFFFFF',
        ink: '#141A2E',
        muted: '#5B6478',
        hairline: '#E2E7F0',
        brand: {
          DEFAULT: '#2B44FF',
          soft: '#EAEDFF',
          dark: '#1E32C9',
        },
        spot: {
          DEFAULT: '#FF5A47',
          soft: '#FFE9E5',
        },
        // 시그니처(수렴 노선) 전용 액센트
        line: {
          cobalt: '#2B44FF',
          teal: '#12B5A5',
          amber: '#F6A609',
          coral: '#FF5A47',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        data: ['"Space Grotesk"', 'Pretendard', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(20, 26, 46, 0.06)',
        card: '0 8px 30px rgba(20, 26, 46, 0.08)',
        sheet: '0 -12px 40px rgba(20, 26, 46, 0.12)',
        pin: '0 8px 24px rgba(255, 90, 71, 0.45)',
      },
      keyframes: {
        'route-draw': {
          to: { strokeDashoffset: '0' },
        },
        'pin-drop': {
          '0%': { transform: 'translateY(-24px) scale(0.6)', opacity: '0' },
          '60%': { transform: 'translateY(2px) scale(1.05)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'route-draw': 'route-draw 1.1s ease-out forwards',
        'pin-drop': 'pin-drop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'sheet-up': 'sheet-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
