import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import HomePage from "./pages/HomePage.jsx";
import Login from "./components/Login.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Dashboard from "./pages/AdminDashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "login", element: <Login /> },
      {
        path: "admin",
        element: <AdminPanel />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
        ],
      },
    ],
  },
]);

export default router;
