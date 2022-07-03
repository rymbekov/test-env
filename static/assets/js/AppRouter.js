import { hot } from 'react-hot-loader/root';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import AppRouter from 'AppRouter';
import { ThemeProvider } from './contexts/themeContext';
import Wootric from './components/Wootric';
import store from './store';

const AppRouterWithTheme = () => {
  const { user } = store.getState();

  return (
    <ThemeProvider user={user}>
      <>
        <AppRouter />
        <Wootric />
        <ToastContainer
          position="bottom-right"
          autoClose={15000}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnHover
          pauseOnFocusLoss
          draggable
        />
      </>
    </ThemeProvider>
  );
};

export default hot(AppRouterWithTheme);
