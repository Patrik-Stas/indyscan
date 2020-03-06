import React from 'react';

const Workers = React.lazy(() => import('./views/Base/Workers'));
const Dashboard = React.lazy(() => import('./views/Dashboard'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/workers', name: 'Workers', component: Workers },
];

export default routes;
