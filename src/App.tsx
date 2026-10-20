import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import History from './views/History';
import MatchDetail from './views/MatchDetail';
import Partners from './views/Partners';
import MatchEdit from './views/MatchEdit';
import Settings from './views/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="matches" element={<History />} />
          <Route path="partners" element={<Partners />} />
          <Route path="match/:id" element={<MatchDetail />} />
          <Route path="match/:id/edit" element={<MatchEdit />} />
          <Route path="new" element={<MatchEdit />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}