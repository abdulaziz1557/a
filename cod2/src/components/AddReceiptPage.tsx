import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Page } from "../App";

interface AddReceiptPageProps {
  onNavigate: (page: Page) => void;
}

export default function AddReceiptPage({ onNavigate }: AddReceiptPageProps) {
  const [customerName, setCustomerName] = useState("");
  const [po, setPo] = useState("");
  const [date, setDate] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createReceipt = useMutation(api.receipts.create);
  const generateUploadUrl = useMutation(api.receipts.generateUploadUrl);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !po || !date) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageId;
      
      if (selectedImage) {
        // Upload image
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        
        if (!result.ok) {
          throw new Error("فشل في رفع الصورة");
        }
        
        const json = await result.json();
        imageId = json.storageId;
      }

      // Create receipt
      await createReceipt({
        customerName,
        po,
        date,
        imageId,
      });

      toast.success("تم إضافة الاستلام بنجاح");
      onNavigate("receipts");
    } catch (error) {
      console.error("Error creating receipt:", error);
      toast.error("حدث خطأ أثناء إضافة الاستلام");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="text-center sm:text-right">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">➕ إضافة استلام جديد</h1>
              <p className="text-gray-600 text-base">استلامات الأطار الأول</p>
            </div>
            <button
              onClick={() => onNavigate("receipts")}
              className="w-full sm:w-auto bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-base"
            >
              ← رجوع للقائمة
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                اسم العميل *
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="أدخل اسم العميل"
                required
              />
            </div>

            <div>
              <label htmlFor="po" className="block text-sm font-medium text-gray-700 mb-2">
                رقم PO *
              </label>
              <input
                id="po"
                type="text"
                value={po}
                onChange={(e) => setPo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="أدخل رقم PO"
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                التاريخ *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                required
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                صورة الاستلام
              </label>
              <input
                id="image"
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {selectedImage && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    ✅ الملف المحدد: <span className="font-semibold">{selectedImage.name}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    💾 حفظ الاستلام
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => onNavigate("receipts")}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base"
              >
                ❌ إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
