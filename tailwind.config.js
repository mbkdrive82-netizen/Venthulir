/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        organic: {
          primary: '#236B3A',
          dark: '#164D2A',
          light: '#EAF4EC',
          gold: '#C99A3D',
          lightGold: '#F7EFD9',
          bg: '#F7F8F5',
          card: '#FFFFFF',
          text: '#17251B',
          textSecondary: '#68736B',
          border: '#E2E7E2',
          success: '#2E7D32',
          danger: '#D64545',
          cancelledBg: '#FDE8E8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
