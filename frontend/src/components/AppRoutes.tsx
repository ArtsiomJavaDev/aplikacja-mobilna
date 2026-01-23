import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import ErrorPage from './ErrorPage';
import Checkout from './Checkout';
import AdminPanel from './AdminPanel';
import Layout from './Layout';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const routes = useRoutes([
    {
      path: '/login',
      element: !isAuthenticated ? <Login /> : <Navigate to="/" replace />
    },
    {
      path: '/register',
      element: !isAuthenticated ? <Register /> : <Navigate to="/" replace />
    },
    {
      path: '/401',
      element: <ErrorPage status={401} />
    },
    {
      path: '/403',
      element: <ErrorPage status={403} />
    },
    {
      path: '/404',
      element: <ErrorPage status={404} />
    },
    {
      path: '/500',
      element: <ErrorPage status={500} />
    },
    {
      path: '/',
      element: isAuthenticated ? <Layout /> : <Navigate to="/login" replace />,
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: 'checkout',
          element: <Checkout />
        },
        {
          path: 'admin',
          element: user?.role === 'ROLE_ADMIN' ? (
            <AdminPanel />
          ) : (
            <Navigate to="/403" replace />
          )
        }
      ]
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ]);

  return routes;
};

export default AppRoutes;