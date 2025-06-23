import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Page } from "../App";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ReceiptsPageProps {
  onNavigate: (page: Page, receiptId?: string) => void;
}

export default function ReceiptsPage({ onNavigate }: ReceiptsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"customer" | "po" | "date">("customer");
  const [isSearching, setIsSearching] = useState(false);
  const [showAllReceipts, setShowAllReceipts] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // جلب جميع الاستلامات
  const allReceipts = useQuery(api.receipts.getAllReceipts);
  
  // البحث
  const searchResults = useQuery(
    api.receipts.search,
    isSearching && searchTerm ? { searchTerm, searchType } : "skip"
  );

  const deleteReceipt = useMutation(api.receipts.deleteReceipt);

  let receipts = [];
  let displayMode = "";

  if (showAllReceipts) {
    receipts = allReceipts || [];
    displayMode = "جميع الاستلامات";
  } else if (isSearching && searchTerm) {
    receipts = searchResults || [];
    displayMode = `نتائج البحث عن "${searchTerm}"`;
  } else {
    receipts = [];
    displayMode = "";
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      setShowAllReceipts(false);
    } else {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  const showAll = () => {
    setShowAllReceipts(true);
    setIsSearching(false);
    setSearchTerm("");
  };

  const hideAll = () => {
    setShowAllReceipts(false);
    setIsSearching(false);
    setSearchTerm("");
  };

  const handleDelete = async (receiptId: string, customerName: string) => {
    if (!confirm(`هل أنت متأكد من حذف استلام العميل "${customerName}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      return;
    }

    setDeletingId(receiptId);
    try {
      await deleteReceipt({ id: receiptId as Id<"receipts"> });
      toast.success("تم حذف الاستلام بنجاح");
    } catch (error) {
      toast.error("فشل في حذف الاستلام");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
      {/* Company Logo Banner */}
      <div className="bg-white shadow-md border-b border-gray-200 p-4 mb-6 rounded-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🏢</span>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">شركة الأطار الأول</h1>
              <p className="text-sm text-gray-600">99مخزون</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col items-center mb-6 gap-4">
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">📋 (99) استلامات الأطار الأول</h1>
              <p className="text-gray-600 text-base">نظام شامل لإدارة ومتابعة الاستلامات</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => onNavigate("excel")}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
              >
                📊 تصدير Excel
              </button>
              <button
                onClick={() => onNavigate("add")}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
              >
                ➕ إضافة استلام جديد
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={showAll}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
            >
              📊 عرض جميع الاستلامات
            </button>
            
            {showAllReceipts && (
              <button
                onClick={hideAll}
                className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
              >
                ❌ إخفاء الكل
              </button>
            )}
          </div>

          {/* Search */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🔍 البحث في الاستلامات
            </h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة البحث
                  </label>
                  {searchType === "date" ? (
                    <input
                      type="date"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-base"
                    />
                  ) : (
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-base"
                      placeholder="أدخل كلمة البحث..."
                    />
                  )}
                </div>
                
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع البحث
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as "customer" | "po" | "date")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-base"
                  >
                    <option value="customer">👤 اسم العميل</option>
                    <option value="po">📄 رقم PO</option>
                    <option value="date">📅 التاريخ</option>
                  </select>
                </div>
                
                <div className="lg:col-span-1 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSearch}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
                  >
                    🔍 بحث
                  </button>
                  
                  {isSearching && (
                    <button
                      onClick={clearSearch}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
                    >
                      🗑️ مسح
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {!showAllReceipts && !isSearching ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl mb-2 font-semibold">مرحباً بك في استلامات الأطار الأول</p>
              <p className="text-gray-400 text-base">استخدم البحث أعلاه للعثور على الاستلامات أو اضغط "عرض جميع الاستلامات"</p>
            </div>
          ) : receipts === undefined || (isSearching && searchResults === undefined) ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-lg">جاري التحميل...</p>
            </div>
          ) : receipts && receipts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold">
                {isSearching ? "لا توجد نتائج للبحث" : "لا توجد استلامات"}
              </p>
            </div>
          ) : receipts && receipts.length > 0 ? (
            <div>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <h2 className="text-xl font-semibold text-gray-900 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  📊 {displayMode} 
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    {receipts.length} استلام
                  </span>
                </h2>
              </div>
              
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                {receipts.map((receipt) => (
                  <div key={receipt._id} className="border-b border-gray-200 p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-base">{receipt.customerName}</h3>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {receipt.po}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">📅 {receipt.date}</p>
                      {receipt.imageUrl && (
                        <img
                          src={receipt.imageUrl}
                          alt="صورة الاستلام"
                          className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate("detail", receipt._id)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm flex items-center justify-center gap-2"
                        >
                          👁️ عرض التفاصيل
                        </button>
                        <button
                          onClick={() => handleDelete(receipt._id, receipt.customerName)}
                          disabled={deletingId === receipt._id}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {deletingId === receipt._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            "🗑️"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        👤 اسم العميل
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        📄 رقم PO
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        📅 التاريخ
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        🖼️ الصورة
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        ⚙️ الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receipts.map((receipt) => (
                      <tr key={receipt._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {receipt.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                            {receipt.po}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {receipt.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {receipt.imageUrl ? (
                            <img
                              src={receipt.imageUrl}
                              alt="صورة الاستلام"
                              className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">لا توجد</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => onNavigate("detail", receipt._id)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 text-xs"
                            >
                              👁️ عرض التفاصيل
                            </button>
                            <button
                              onClick={() => handleDelete(receipt._id, receipt.customerName)}
                              disabled={deletingId === receipt._id}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                            >
                              {deletingId === receipt._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  🗑️ حذف
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
