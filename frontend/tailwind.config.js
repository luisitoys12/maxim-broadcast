/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca' },
        success:  { 400:'#4ade80', 500:'#22c55e' },
        danger:   { 400:'#f87171', 500:'#ef4444' },
        warning:  { 400:'#fbbf24', 500:'#f59e0b' },
      }
    }
  },
  plugins: []
}
