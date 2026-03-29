import { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from './Pages/public/Home/Home'
import Login from './Pages/auth/Login/Login'
import SignUp from "./Pages/auth/SignIn/SignUp";
import NotFoundPage from "./Pages/public/NotFoundPage/NotFoundPage";
import ChatBot from './Pages/auth/ChatBot/ChatBot';

function App() {
  // Theme Detector
  useEffect(() => {
    const applySystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applySystemTheme(mediaQuery);

    const handleChange = (e: MediaQueryListEvent) => applySystemTheme(e);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/chat" element={<ChatBot />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
