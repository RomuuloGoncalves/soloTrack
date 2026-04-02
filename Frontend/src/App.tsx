import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from './Pages/public/Home/Home'
import Login from './Pages/auth/Login/Login'
import SignUp from "./Pages/auth/SignIn/SignUp";
import NotFoundPage from "./Pages/public/NotFoundPage/NotFoundPage";
import ChatBot from "./Pages/ChatBot/ChatBot";

import { useTheme } from "./hooks/useTheme";

function App() {
  useTheme(); // Inicializa o tema e gerencia o data-theme

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
