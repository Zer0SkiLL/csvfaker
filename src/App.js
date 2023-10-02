import logo from './logo.svg';
import './App.css';
import AnonymizationPage from './components/AnonymizationPage';
import Navbar from './components/Navbar/Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <br />
        <Routes>
          <Route exact path="/csv" element={<AnonymizationPage />} />
          {/* <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
