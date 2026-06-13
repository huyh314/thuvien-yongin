import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#0f3460',
    colorSuccess: '#27ae60',
    colorWarning: '#f39c12',
    colorError: '#e74c3c',
    borderRadius: 8,
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#1a1a2e',
      headerHeight: 64,
      siderBg: '#16213e',
    },
    Menu: {
      darkItemBg: '#16213e',
      darkItemSelectedBg: '#0f3460',
    },
    Card: {
      paddingLG: 20,
    },
  },
};
