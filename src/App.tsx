import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import { Navbar } from "./components/Navbar";
import { StudentModeSidebar } from "./components/StudentModeSidebar";

const queryClient = new QueryClient();

const App = () => {
  const [isStudentModeOpen, setIsStudentModeOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar onStudentModeToggle={() => setIsStudentModeOpen(!isStudentModeOpen)} />
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <StudentModeSidebar 
            isOpen={isStudentModeOpen} 
            onClose={() => setIsStudentModeOpen(false)} 
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
