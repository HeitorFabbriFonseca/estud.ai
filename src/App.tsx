import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Chat from './pages/Chat';
import ChatHistory from './pages/ChatHistory';
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
                    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-6 lg:flex-row lg:items-start lg:gap-8 lg:px-8 lg:py-10">
                      <Sidebar />
                      <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
                        <div className="flex w-full flex-1 flex-col gap-6 pb-12 min-h-0">
                          <Routes>
                            <Route path="/" element={<ChatHistory />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/chat/:chatId" element={<Chat />} />
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
