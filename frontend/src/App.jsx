import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginFamilyPage from './pages/LoginFamilyPage';
import LoginCaregiverPage from './pages/LoginCaregiverPage';
import LoginOwnerPage from './pages/LoginOwnerPage';
import ChooseUserPage from './pages/ChooseUserPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/familyLogin" element={<LoginFamilyPage />} />
        <Route path="/caregiverLogin" element={<LoginCaregiverPage />} />
        <Route path="/ownerLogin" element={<LoginOwnerPage />} />

        <Route path="/" element={<ChooseUserPage />} />
      </Routes>
    </Router>
  );
}

export default App;

