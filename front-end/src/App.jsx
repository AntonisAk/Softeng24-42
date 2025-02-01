import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Debts from "./pages/Debts";
import Charts from "./pages/Charts";
import Map from "./pages/Map";
import AuthContext from "./context/AuthContext";

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token } : null;
  });

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="signin"
              element={!auth ? <SignIn /> : <Navigate to="/debts" />}
            />
            <Route
              path="debts"
              element={auth ? <Debts /> : <Navigate to="/signin" />}
            />
            <Route
              path="charts"
              element={auth ? <Charts /> : <Navigate to="/signin" />}
            />
            <Route
              path="map"
              element={auth ? <Map /> : <Navigate to="/signin" />}
            />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
