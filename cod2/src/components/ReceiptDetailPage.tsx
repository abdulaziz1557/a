import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Page } from "../App";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";

interface ReceiptDetailPageProps {
  receiptId: string;
  onNavigate: (page: Page) => void;
}

export default function ReceiptDetailPage({ receiptId, onNavigate }: ReceiptDetailPageProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const receipt = useQuery(api.receipts.getById, { 
    id: receiptId as Id<"receipts"> 
  });
  const deleteReceipt = useMutation(api.receipts.deleteReceipt);

  const downloadImage = async () => {
    if (receipt?.imageUrl) {
      try {
        const response = await fetch(receipt.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `استلام_${receipt.customerName}_${receipt.po}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("تم تحميل الصورة بنجاح");
      } catch (error) {
        toast.error("فشل في تحميل الصورة");
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الاستلام؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReceipt({ id: receiptId as Id<"receipts"> });
      toast.success("تم حذف الاستلام بنجاح");
      onNavigate("receipts");
    } catch (error) {
      toast.error("فشل في حذف الاستلام");
    } finally {
      setIsDeleting(false);
    }
  };

  if (receipt === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (receipt === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-6 text-lg">لم يتم العثور على الاستلام</p>
          <button
            onClick={() => onNavigate("receipts")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-base"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">📋 تفاصيل الاستلام</h1>
              <p className="text-gray-600 text-base">استلامات الأطار الأول - معلومات مفصلة</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    🗑️ حذف الاستلام
                  </>
                )}
              </button>
              <button
                onClick={() => onNavigate("receipts")}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base"
              >
                ← العودة للقائمة
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-center sm:text-right">
                <h2 className="text-xl lg:text-2xl font-bold">{receipt.customerName}</h2>
                <p className="text-blue-100 mt-1 text-base">رقم PO: {receipt.po}</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-blue-100 text-sm">تاريخ الاستلام</p>
                <p className="text-lg lg:text-xl font-semibold">{receipt.date}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Receipt Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    📋 معلومات الاستلام
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 gap-2">
                      <span className="text-gray-600 font-medium text-base">اسم العميل:</span>
                      <span className="text-gray-900 font-semibold text-base">{receipt.customerName}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 gap-2">
                      <span className="text-gray-600 font-medium text-base">رقم PO:</span>
                      <span className="text-gray-900 font-semibold bg-blue-100 px-3 py-1 rounded-full text-xs w-fit">
                        {receipt.po}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 gap-2">
                      <span className="text-gray-600 font-medium text-base">تاريخ الاستلام:</span>
                      <span className="text-gray-900 font-semibold text-base">{receipt.date}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 gap-2">
                      <span className="text-gray-600 font-medium text-base">تاريخ الإنشاء:</span>
                      <span className="text-gray-900 font-semibold text-sm">
                        {new Date(receipt.createdAt).toLocaleString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-medium text-base">تم استلام الطلب بنجاح</span>
                  </div>
                </div>
              </div>

              {/* Receipt Image */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      🖼️ صورة الاستلام
                    </h3>
                    {receipt.imageUrl && (
                      <button
                        onClick={downloadImage}
                        className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        📥 تحميل الصورة
                      </button>
                    )}
                  </div>
                  
                  {receipt.imageUrl ? (
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                      <img
                        src={receipt.imageUrl}
                        alt="صورة الاستلام"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-100">
                      <div className="text-gray-400 text-6xl mb-4">📄</div>
                      <p className="text-gray-500 text-lg">لا توجد صورة مرفقة</p>
                      <p className="text-gray-400 text-sm mt-2">لم يتم رفع صورة لهذا الاستلام</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-xs text-gray-500">
                آخر تحديث: {new Date(receipt.createdAt).toLocaleString('ar-SA')}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      🗑️ حذف الاستلام
                    </>
                  )}
                </button>
                <button
                  onClick={() => onNavigate("receipts")}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base"
                >
                  📋 العودة للقائمة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
