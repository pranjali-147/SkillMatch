import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import StudentDashboard from "./components/StudentDashboard";
import MainPage from "./components/MainPage";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/check-session", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.logged_in) {
          setLoggedIn(true);
          setRole(data.role);
        }
        setChecking(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });

    setLoggedIn(false);
    setRole(null);
  };

  if (checking) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Main Landing Page */}
        <Route path="/" element={<MainPage />} />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            !loggedIn ? (
              <Login
                onLogin={(role) => {
                  setLoggedIn(true);
                  setRole(role);
                }}
              />
            ) : (
              <Navigate to={role === "hr" ? "/hr" : "/student"} />
            )
          }
        />

        {/* HR Dashboard */}
        <Route
          path="/hr"
          element={
            loggedIn && role === "hr" ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Student Dashboard */}
        <Route
          path="/student"
          element={
            loggedIn && role === "student" ? (
              <StudentDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
