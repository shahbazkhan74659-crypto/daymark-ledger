import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CreateEmployeeScreen } from "./components/CreateEmployeeScreen";
import { HomeScreen } from "./components/HomeScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RequireAuth } from "./components/RequireAuth";
import { WorkerDetailScreen } from "./components/WorkerDetailScreen";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomeScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/workers/new"
            element={
              <RequireAuth>
                <CreateEmployeeScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/workers/:id"
            element={
              <RequireAuth>
                <WorkerDetailScreen />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
