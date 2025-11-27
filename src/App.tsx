import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Chat from './pages/Chat';
import ChatHistory from './pages/ChatHistory';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#f7f9fc] text-slate-800">
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-10">
                      <Sidebar />
                      <main className="flex-1 overflow-x-hidden">
                        <div className="flex w-full flex-1 flex-col gap-6 pb-12">
                          <Routes>
                            <Route path="/" element={<ChatHistory />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/chat/:chatId" element={<Chat />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
