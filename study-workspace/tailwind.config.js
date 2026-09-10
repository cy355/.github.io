export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDFBF7',
        lotus: '#E8B4B8',
        lotusdark: '#D99CA1',
        mist: '#A8B8C8',
        ink: '#3D3D3D',
        sub: '#8A8A8A'
      },
      borderRadius: { card: '16px', btn: '12px' },
      boxShadow: { soft: '0 2px 8px rgba(0,0,0,0.06)' },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif']
      }
    }
  },
  plugins: []
};
