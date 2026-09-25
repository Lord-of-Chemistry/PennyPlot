import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FirstLaunch from "./pages/FirstLaunch";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import RecurringTransactions from "./pages/RecurringTransactions";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import { Toaster } from "@/components/ui/sonner";
import InstallPrompt from "./components/InstallPrompt";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <InstallPrompt />

      <Routes>
        <Route path="/" element={<FirstLaunch />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/recurring" element={<RecurringTransactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
