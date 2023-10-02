import logo from './logo.svg';
import './App.css';
import AnonymizationPage from './components/AnonymizationPage';
import Navbar from './components/Navbar/Navbar';
import { BrowserRouter as Router, Route, Routes, Navigate  } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route exact path="/csv" element={<AnonymizationPage />} />
          <Route exact path='/' element={<Navigate to="/csv" />} />
          {/* <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
