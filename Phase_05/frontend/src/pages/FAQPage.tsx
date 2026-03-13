import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ThumbsUp, ThumbsDown, Edit, Trash2 } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { OrganicBackground } from "../components/OrganicBackground";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../lib/api";

type FAQ = {
  id: string;
  category: string;
  categoryIcon: string;
  title: string;
  answer: string;
  lastUpdated: string;
  views: number;
  helpfulCount: number;
  notHelpfulCount: number;
};

type RelatedFAQ = {
  id: number;
  question: string;
  category_name: string;
  category_icon: string;
};

export function FAQPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { t, language } = useLanguage();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedFaqs, setRelatedFaqs] = useState<RelatedFAQ[]>([]);

  const fetchFaq = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [res, allFaqsRes] = await Promise.all([
        api.get(`/support/faq/${id}?lang=${language}`),
        api.get(`/support/faq/?limit=10&lang=${language}`),
      ]);
      const data = res.data;
      setFaq({
        id: data.id.toString(),
        category: data.category_name || data.category?.name_en || 'General',
        categoryIcon: data.category_icon || data.category?.icon_url || '💡',
        title: data.question,
        answer: data.answer,
        lastUpdated: (() => { const d = new Date(data.updated_at || data.created_at); return isNaN(d.getTime()) ? '' : d.toLocaleDateString(); })(),
        views: (data.helpful_count || 0) + (data.not_helpful_count || 0),
        helpfulCount: data.helpful_count || 0,
        notHelpfulCount: data.not_helpful_count || 0,
      });
      const others = (allFaqsRes.data || [])
        .filter((f: any) => f.id !== data.id)
        .slice(0, 4)
        .map((f: any) => ({
          id: f.id,
          question: f.question,
          category_name: f.category_name || f.category?.name_en || 'General',
          category_icon: f.category_icon || f.category?.icon_url || '💡',
        }));
      setRelatedFaqs(others);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || "Unknown error";
      setError(`${t('thread.load_error')}: ${detail}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaq();
  }, [id, language]);

  const handleVote = async (isHelpful: boolean) => {
    if (!faq || helpful !== null) return;
    try {
      await api.post(`/support/faq/${faq.id}/vote`, { is_helpful: isHelpful });
      setHelpful(isHelpful);
      setFaq((prev: FAQ | null) => prev ? {
        ...prev,
        helpfulCount: isHelpful ? prev.helpfulCount + 1 : prev.helpfulCount,
        notHelpfulCount: isHelpful ? prev.notHelpfulCount : prev.notHelpfulCount + 1,
      } : null);
    } catch (err) {
      console.error('Failed to register vote', err);
    }
  };

  const handleDelete = async () => {
    if (!faq) return;
    const confirmDelete = window.confirm(t('faq.confirm_delete') || "Are you sure you want to delete this FAQ?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/support/faq/${faq.id}`);
      navigate("/");
    } catch (err) {
      console.error('Failed to delete FAQ', err);
      alert(t('faq.delete_failed') || "Failed to delete FAQ");
    }
  };

  const canEdit = role === 'agent' || role === 'admin';

  return (
    <div className="min-h-screen bg-[#F9FAFB] relative overflow-hidden">
      <OrganicBackground variant="alternate" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F67C01] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('buttons.back_to_forum')}
        </button>

        <div className="flex gap-8">
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <LoadingSpinner size="large" />
              </div>
            ) : error || !faq ? (
              <ErrorMessage message={error || t('faq.not_found')} onRetry={fetchFaq} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <CategoryBadge category={faq.category} icon={faq.categoryIcon} size="small" />
                  <span className="text-sm text-gray-400">{t('faq.updated')} {faq.lastUpdated}</span>
                </div>

                <h1 className="text-gray-900 mb-6">{faq.title}</h1>

                <div className="prose max-w-none text-gray-700 mb-8 pb-8 border-b border-gray-100">
                  <p className="whitespace-pre-wrap">{faq.answer}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">{t('faq.was_helpful')}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVote(true)}
                      disabled={helpful !== null}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                        helpful === true
                          ? "bg-[#10B981] text-white border-[#10B981]"
                          : "text-gray-600 border-gray-300 hover:border-[#10B981] disabled:opacity-50"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {t('faq.yes')} · {faq.helpfulCount}
                    </button>
                    <button
                      onClick={() => handleVote(false)}
                      disabled={helpful !== null}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                        helpful === false
                          ? "bg-[#EF4444] text-white border-[#EF4444]"
                          : "text-gray-600 border-gray-300 hover:border-[#EF4444] disabled:opacity-50"
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {t('faq.no')} · {faq.notHelpfulCount}
                    </button>
                  </div>
                  {helpful !== null && (
                    <p className="mt-3 text-sm text-[#10B981]">{t('faq.thanks_feedback')}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="hidden lg:block w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="mb-4 text-gray-900 font-medium">{t('faq.related_faqs')}</h3>
              <div className="space-y-3">
                {relatedFaqs.length > 0 ? (
                  relatedFaqs.map((related) => (
                    <button
                      key={related.id}
                      onClick={() => navigate(`/faq/${related.id}`)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <p className="text-sm text-gray-900 mb-2 line-clamp-2">{related.question}</p>
                      <CategoryBadge category={related.category_name} icon={related.category_icon} size="small" />
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">{t('faq.no_related')}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-sm text-center text-[#F67C01] hover:text-[#d56b01] font-medium transition-colors"
                >
                  {t('faq.browse_all')}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {canEdit && !isLoading && !error && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-3">
            <button
              onClick={() => navigate(`/admin/faq/${faq?.id}/edit`)}
              className="bg-[#F67C01] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#d56b01] transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {t('faq.edit_faq')}
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-5 py-3 rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('faq.delete_faq') || "Delete FAQ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
