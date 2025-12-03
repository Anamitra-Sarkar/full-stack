import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components';
import { Dashboard, Projects, TimelinePage } from './pages';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/timeline" element={<TimelinePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
