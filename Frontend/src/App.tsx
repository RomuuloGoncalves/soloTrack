import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from './Pages/public/Home/Home'
import Login from './Pages/auth/Login/Login'
import SignUp from "./Pages/auth/SignIn/SignUp";
import NotFoundPage from "./Pages/public/NotFoundPage/NotFoundPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
