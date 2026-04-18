import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from './Pages/public/Home/Home'
import Login from './Pages/auth/Login/Login'
import SignUp from "./Pages/auth/SignIn/SignUp";
import NotFoundPage from "./Pages/public/NotFoundPage/NotFoundPage";
import ChatBot from "./Pages/ChatBot/ChatBot";
import Relatorio from "./Pages/Relatorio/Relatorio";

import { useTheme } from "./hooks/useTheme";
import { ToastProvider } from "./contexts/ToastContext";
import { ProvedorAuth } from "./contexts/ContextoAuth";
import { RotaPrivada } from "./components/RotaPrivada/RotaPrivada";
import { RotaPublica } from "./components/RotaPublica/RotaPublica";

function App() {
  useTheme();

  return (
    <ToastProvider>
      <Router>
        <ProvedorAuth>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={
              <RotaPublica><Login /></RotaPublica>
            } />
            <Route path="/signup" element={
              <RotaPublica><SignUp /></RotaPublica>
            } />

            <Route path="/chatbot" element={
              <RotaPrivada><ChatBot /></RotaPrivada>
            } />
            <Route path="/relatorio" element={
              <RotaPrivada><Relatorio /></RotaPrivada>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ProvedorAuth>
      </Router>
    </ToastProvider>
  );
}

export default App;
