import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SupabaseTest from './components/SupabaseTest';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<SupabaseTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;