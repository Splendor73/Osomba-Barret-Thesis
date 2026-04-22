import { Mail, Phone } from "lucide-react";
import { OrganicBackground } from "../components/OrganicBackground";
import { useLanguage } from "../context/LanguageContext";

export function ContactUsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 relative">
      <OrganicBackground variant="alternate" />
      
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100 z-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {t('contact.title')}
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {t('contact.subtitle')}
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-50 border border-orange-100">
            <div className="p-3 bg-white rounded-full shadow-sm text-[#F67C01]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('contact.email_label')}</h3>
              <p className="text-gray-600 mt-1">{t('contact.placeholder_note')}</p>
              <a href="mailto:support@osomba.com" className="text-[#F67C01] font-medium hover:underline mt-2 inline-block">
                support@osomba.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-50 border border-orange-100">
            <div className="p-3 bg-white rounded-full shadow-sm text-[#F67C01]">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('contact.phone_label')}</h3>
              <p className="text-gray-600 mt-1">{t('contact.placeholder_note')}</p>
              <a href="tel:+18005000011" className="text-[#F67C01] font-medium hover:underline mt-2 inline-block">
                +1 800 500 0011
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
