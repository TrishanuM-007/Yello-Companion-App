export const lightTheme = {
  colors: {
    primary: '#FFD700', // Modern Primary Yellow
    background: '#F0F2F5', // Off-white for clay contrast
    surface: '#FFFFFF', // White
    text: '#1A1A1A', // Near Black
    textLight: '#666666',
    border: '#E0E0E0',
    error: '#D32F2F',
    clayHighlight: '#FFFFFF',
    clayShadow: '#D1D9E6',
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
  },
  typography: {
    header: { fontSize: 24, fontWeight: 'bold' },
    title: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16 },
    caption: { fontSize: 12, color: '#666666' },
  },
  borderRadius: {
    sm: 8, md: 16, lg: 24, round: 50,
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#FFD700',
    background: '#1A1B1E', // Very dark grey
    surface: '#2C2E33', // Darker grey
    text: '#FFFFFF', // White text
    textLight: '#A0A0A0',
    border: '#3D3F44',
    error: '#EF5350',
    clayHighlight: '#3A3D44',
    clayShadow: '#151618',
  }
};
