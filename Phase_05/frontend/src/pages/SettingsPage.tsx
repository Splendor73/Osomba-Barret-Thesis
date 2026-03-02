import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Mail, Smartphone } from "lucide-react";
import api from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { OrganicBackground } from "../components/OrganicBackground";
import { useLanguage } from "../context/LanguageContext";

export function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [userId, setUserId] = useState<number | null>(null);
  
  // Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setUserId(res.data.user_id);
        setMarketingOptIn(res.data.marketing_opt_in || false);
      } catch (err) {
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.put(`/users/${userId}`, {
        marketing_opt_in: marketingOptIn
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganicBackground variant="default" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-700 hover:text-[#F67C01] mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-6">
              <Bell className="w-6 h-6 text-[#F67C01]" />
              Notifications
            </h2>

            {error && <ErrorMessage message={error} />}

            <div className="space-y-6">
              {/* Marketing Opt-In Toggle (Connected to Backend) */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Marketing & Offers</h3>
                  <p className="text-sm text-gray-500 mt-1">Receive updates on new features, tips, and promotional offers.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F67C01]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F67C01]"></div>
                </label>
              </div>

              <hr className="border-gray-100" />

              {/* Email Notifications Toggle (UI Mock) */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Get an email when someone replies to your question.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F67C01]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#46BB39]"></div>
                </label>
              </div>

              <hr className="border-gray-100" />

              {/* Push Notifications Toggle (UI Mock) */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gray-400" />
                    In-App Push
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Receive in-app popups and mobile notifications.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F67C01]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#46BB39]"></div>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
              {success && <span className="text-sm text-[#46BB39] font-medium">Settings saved!</span>}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-[#F67C01] text-white rounded-lg hover:bg-[#d56b01] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="small" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
