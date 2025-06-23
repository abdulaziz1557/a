import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Page } from "../App";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

interface ExcelExportPageProps {
  onNavigate: (page: Page) => void;
}

export default function ExcelExportPage({ onNavigate }: ExcelExportPageProps) {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exportType, setExportType] = useState<"customer" | "date" | "all">("customer");

  // جلب قائمة العملاء
  const customers = useQuery(api.receipts.getAllCustomers);
  
  // جلب استلامات عميل محدد
  const customerReceipts = useQuery(
    api.receipts.getReceiptsByCustomer,
    selectedCustomer && exportType === "customer" ? { customerName: selectedCustomer } : "skip"
  );

  // جلب الاستلامات حسب التاريخ
  const dateReceipts = useQuery(
    api.receipts.getReceiptsByDateRange,
    exportType === "date" && dateFrom && dateTo ? { dateFrom, dateTo } : "skip"
  );

  // جلب جميع الاستلامات
  const allReceipts = useQuery(
    api.receipts.getAllReceipts,
    exportType === "all" ? {} : "skip"
  );

  const exportToExcel = () => {
    let receiptsToExport: any[] = [];
    let fileName = "";

    if (exportType === "customer") {
      if (!selectedCustomer || !customerReceipts) {
        toast.error("يرجى اختيار عميل أولاً");
        return;
      }
      receiptsToExport = customerReceipts;
      fileName = `استلامات_${selectedCustomer}_${new Date().toLocaleDateString('ar-SA')}`;
    } else if (exportType === "date") {
      if (!dateFrom || !dateTo || !dateReceipts) {
        toast.error("يرجى تحديد نطاق التاريخ");
        return;
      }
      receiptsToExport = dateReceipts;
      fileName = `استلامات_من_${dateFrom}_إلى_${dateTo}`;
    } else if (exportType === "all") {
      if (!allReceipts) {
        toast.error("لا توجد بيانات للتصدير");
        return;
      }
      receiptsToExport = allReceipts;
      fileName = `جميع_الاستلامات_${new Date().toLocaleDateString('ar-SA')}`;
    }

    if (receiptsToExport.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const data = receiptsToExport.map((receipt, index) => ({
      'الرقم': index + 1,
      'اسم العميل': receipt.customerName,
      'رقم PO': receipt.po,
      'التاريخ': receipt.date,
      'تاريخ الإنشاء': new Date(receipt.createdAt).toLocaleDateString('ar-SA'),
      'وقت الإنشاء': new Date(receipt.createdAt).toLocaleTimeString('ar-SA')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الاستلامات");

    // تحسين عرض الأعمدة
    const colWidths = [
      { wch: 10 }, // الرقم
      { wch: 25 }, // اسم العميل
      { wch: 15 }, // رقم PO
      { wch: 15 }, // التاريخ
      { wch: 20 }, // تاريخ الإنشاء
      { wch: 15 }  // وقت الإنشاء
    ];
    ws['!cols'] = colWidths;

    try {
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      toast.error("فشل في تصدير البيانات");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">📊 تصدير البيانات</h1>
              <p className="text-gray-600 text-base">تصدير الاستلامات إلى ملف Excel</p>
            </div>
            <button
              onClick={() => onNavigate("receipts")}
              className="w-full sm:w-auto bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-base"
            >
              ← العودة للقائمة
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            ⚙️ خيارات التصدير
          </h2>

          {/* Export Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              نوع التصدير
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="customer"
                  checked={exportType === "customer"}
                  onChange={(e) => setExportType(e.target.value as "customer")}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 text-base">👤 حسب العميل</div>
                  <div className="text-sm text-gray-500">تصدير استلامات عميل محدد</div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="date"
                  checked={exportType === "date"}
                  onChange={(e) => setExportType(e.target.value as "date")}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 text-base">📅 حسب التاريخ</div>
                  <div className="text-sm text-gray-500">تصدير استلامات فترة محددة</div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === "all"}
                  onChange={(e) => setExportType(e.target.value as "all")}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 text-base">📋 جميع الاستلامات</div>
                  <div className="text-sm text-gray-500">تصدير كافة الاستلامات</div>
                </div>
              </label>
            </div>
          </div>

          {/* Customer Selection */}
          {exportType === "customer" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر العميل
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-base"
              >
                <option value="">-- اختر عميل --</option>
                {customers?.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
              
              {selectedCustomer && customerReceipts && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    📈 عدد الاستلامات للعميل "<span className="font-semibold">{selectedCustomer}</span>": 
                    <span className="bg-blue-100 px-2 py-1 rounded-full font-bold text-xs">{customerReceipts.length}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Date Range Selection */}
          {exportType === "date" && (
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    من تاريخ
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    إلى تاريخ
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
              </div>
              
              {dateFrom && dateTo && dateReceipts && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    📈 عدد الاستلامات في الفترة المحددة: 
                    <span className="bg-green-100 px-2 py-1 rounded-full font-bold text-xs">{dateReceipts.length}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* All Receipts Info */}
          {exportType === "all" && allReceipts && (
            <div className="mb-6">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 flex items-center gap-2">
                  📊 إجمالي عدد الاستلامات: 
                  <span className="bg-purple-100 px-2 py-1 rounded-full font-bold text-xs">{allReceipts.length}</span>
                </p>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-center">
            <button
              onClick={exportToExcel}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 text-lg font-semibold"
            >
              📊 تصدير إلى Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
