import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner"; // Rename to avoid confusion
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  FutureConfig,
} from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Ensure this path is correct
import Signup from "./pages/Signup"; // Ensure this path is correct
import { useState } from "react";

const queryClient = new QueryClient();

const future: FutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster position="top-right" /> {/* Ensure proper usage */}
        <BrowserRouter future={future}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Index /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/login"
              element={<Login onLogin={() => setIsAuthenticated(true)} />}
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
