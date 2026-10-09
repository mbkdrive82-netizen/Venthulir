export default function manifest() {
  return {
    name: 'Venthulir — Best Masala & Wood Cold-Pressed Oils',
    short_name: 'Venthulir',
    description: 'Authentic 100% pure heritage masala powders and wood cold-pressed oils from Tamil Nadu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D3320',
    theme_color: '#1B5E2F',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
