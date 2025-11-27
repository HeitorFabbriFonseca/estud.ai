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
        <div className="relative min-h-screen overflow-hidden bg-[#070d18] text-slate-100">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-[150px]" />
            <div className="absolute right-[-5%] top-[-10%] h-[360px] w-[360px] rounded-full bg-indigo-700/15 blur-[200px]" />
            <div className="absolute bottom-[-15%] left-[35%] h-[440px] w-[440px] rounded-full bg-amber-200/10 blur-[220px]" />
          </div>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="relative z-10 flex min-h-screen flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:px-8 lg:py-8">
                      <Sidebar />
                      <main className="flex-1 overflow-x-hidden">
                        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-10">
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
