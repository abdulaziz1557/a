import { useState } from "react";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: (success: boolean) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === "99" && password === "9999") {
      toast.success("تم تسجيل الدخول بنجاح");
      onLogin(true);
    } else {
      toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
      onLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      {/* Company Logo Banner */}
      <div className="absolute top-0 left-0 w-full bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg md:text-xl font-bold">🏢</span>
            </div>
            <div className="text-center">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">الأطار الأول</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md space-y-8 p-6 lg:p-8 bg-white rounded-xl shadow-2xl border border-gray-200 mt-20">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">📋</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            استلامات الأطار الأول
          </h2>
          <p className="text-gray-600 text-sm lg:text-base">قم بتسجيل الدخول للمتابعة</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              placeholder="أدخل اسم المستخدم"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-base shadow-lg hover:shadow-xl"
          >
            🔐 تسجيل الدخول
          </button>
        </form>
        
        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>© 2024 الأطار الأول - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
