import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdvanceDetailsScreen } from "./components/AdvanceDetailsScreen";
import { CreateEmployeeScreen } from "./components/CreateEmployeeScreen";
import { CreateReportPreferenceScreen } from "./components/CreateReportPreferenceScreen";
import { HomeScreen } from "./components/HomeScreen";
import { InactiveEmployeesScreen } from "./components/InactiveEmployeesScreen";
import { LoginScreen } from "./components/LoginScreen";
import { ManageEmployeeDetailScreen } from "./components/ManageEmployeeDetailScreen";
import { ManageEmployeesScreen } from "./components/ManageEmployeesScreen";
import { PublicSearchScreen } from "./components/PublicSearchScreen";
import { ReportConfigScreen } from "./components/ReportConfigScreen";
import { ReportFieldPreferencesScreen } from "./components/ReportFieldPreferencesScreen";
import { ReportingScreen } from "./components/ReportingScreen";
import { RequireAuth } from "./components/RequireAuth";
import { WorkerDetailScreen } from "./components/WorkerDetailScreen";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/employee-search" element={<PublicSearchScreen />} />
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
          <Route
            path="/workers/:id/advance-details"
            element={
              <RequireAuth>
                <AdvanceDetailsScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/manage/workers"
            element={
              <RequireAuth>
                <ManageEmployeesScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/manage/workers/:id"
            element={
              <RequireAuth>
                <ManageEmployeeDetailScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/manage/inactive"
            element={
              <RequireAuth>
                <InactiveEmployeesScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <ReportingScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/reports/:format"
            element={
              <RequireAuth>
                <ReportConfigScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/reports/:format/preferences"
            element={
              <RequireAuth>
                <ReportFieldPreferencesScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/reports/:format/preferences/new"
            element={
              <RequireAuth>
                <CreateReportPreferenceScreen />
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
