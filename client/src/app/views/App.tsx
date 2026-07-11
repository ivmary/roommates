import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../shared/store/AuthContext";
import { SocketProvider } from "../../shared/store/SocketContext";
import Navbar from "../../shared/components/Navbar";
import HomePage from "../../features/home/views/HomePage";
import LoginPage from "../../features/auth/views/LoginPage";
import RegisterPage from "../../features/auth/views/RegisterPage";
import ProfilePage from "../../features/auth/views/ProfilePage";
import SearchPage from "../../features/listings/views/SearchPage";
import CreatePage from "../../features/listings/views/CreatePage";
import MyListingsPage from "../../features/listings/views/MyListingsPage";
import EditListingPage from "../../features/listings/views/EditListingPage";
import MessagesPage from "../../features/chat/views/MessagesPage";

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/listings/:id/edit" element={<EditListingPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/apartment/:apartmentId" element={<MessagesPage />} />
              <Route path="/messages/:conversationId" element={<MessagesPage />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
