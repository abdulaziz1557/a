import { useState } from "react";
import { Toaster } from "sonner";
import LoginPage from "./components/LoginPage";
import ReceiptsPage from "./components/ReceiptsPage";
import AddReceiptPage from "./components/AddReceiptPage";
import ReceiptDetailPage from "./components/ReceiptDetailPage";
import ExcelExportPage from "./components/ExcelExportPage";

export type Page = "login" | "receipts" | "add" | "detail" | "excel";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      setCurrentPage("receipts");
    }
  };

  const navigateTo = (page: Page, receiptId?: string) => {
    if (receiptId) {
      setSelectedReceiptId(receiptId);
    }
    setCurrentPage(page);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === "receipts" && (
        <ReceiptsPage onNavigate={navigateTo} />
      )}
      {currentPage === "add" && (
        <AddReceiptPage onNavigate={navigateTo} />
      )}
      {currentPage === "detail" && selectedReceiptId && (
        <ReceiptDetailPage 
          receiptId={selectedReceiptId} 
          onNavigate={navigateTo} 
        />
      )}
      {currentPage === "excel" && (
        <ExcelExportPage onNavigate={navigateTo} />
      )}
      <Toaster />
    </div>
  );
}
