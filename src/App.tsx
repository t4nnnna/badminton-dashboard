import { Suspense, lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./views/Dashboard'));
const History = lazy(() => import('./views/History'));
const MatchDetail = lazy(() => import('./views/MatchDetail'));
const Partners = lazy(() => import('./views/Partners'));
const MatchEdit = lazy(() => import('./views/MatchEdit'));
const Settings = lazy(() => import('./views/Settings'));

function RouteLoading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span className="muted small">Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteLoading />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="matches"
            element={
              <Suspense fallback={<RouteLoading />}>
                <History />
              </Suspense>
            }
          />
          <Route
            path="partners"
            element={
              <Suspense fallback={<RouteLoading />}>
                <Partners />
              </Suspense>
            }
          />
          <Route
            path="match/:id"
            element={
              <Suspense fallback={<RouteLoading />}>
                <MatchDetail />
              </Suspense>
            }
          />
          <Route
            path="match/:id/edit"
            element={
              <Suspense fallback={<RouteLoading />}>
                <MatchEdit />
              </Suspense>
            }
          />
          <Route
            path="new"
            element={
              <Suspense fallback={<RouteLoading />}>
                <MatchEdit />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<RouteLoading />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}