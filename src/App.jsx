import React from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Frontend from './Topics/Frontend.jsx';
import Languages from './Topics/Languages.jsx';
import Backend from './Topics/Backend.jsx';
import MachineLearning from './Topics/MachineLearning.jsx';
import Aptitude from './Topics/Aptitude.jsx';

const App = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col"> 
        <Navbar />

        <div className="flex-grow">

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/languages" element={<Languages />} />
            <Route path="/frontend" element={<Frontend />} />
            <Route path="/backend" element={<Backend />} />
            <Route path="/machine-learning" element={<MachineLearning />} />
            <Route path="/aptitude" element={<Aptitude />} />
          </Routes>

          
        </div>

        <footer className="py-3">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 SkillForge. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
