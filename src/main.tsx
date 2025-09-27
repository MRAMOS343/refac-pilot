import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import Index from "./pages/Index";
import { DashboardLayout } from "./pages/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import InventarioPage from "./pages/InventarioPage";
import VentasPage from "./pages/VentasPage";
import ComprasPage from "./pages/ComprasPage";
import PrediccionPage from "./pages/PrediccionPage";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "inventario",
            element: <InventarioPage />,
          },
          {
            path: "ventas",
            element: <VentasPage />,
          },
          {
            path: "compras",
            element: <ComprasPage />,
          },
          {
            path: "prediccion",
            element: <PrediccionPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
