import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../shared/store/AuthContext";
import Navbar from "../../shared/components/Navbar";
import HomePage from "../../features/home/views/HomePage";
import LoginPage from "../../features/auth/views/LoginPage";
import RegisterPage from "../../features/auth/views/RegisterPage";
import SearchPage from "../../features/listings/views/SearchPage";
import CreatePage from "../../features/listings/views/CreatePage";

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/create" element={<CreatePage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
