import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, ThumbsUp, ThumbsDown, Lightbulb, ChevronRight, Edit } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
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

export function FAQPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaq = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/faq/${id}`);
      const data = res.data;
      setFaq({
        id: data.id.toString(),
        category: data.category?.name_en || 'General',
        categoryIcon: data.category?.icon_url || '💡',
        title: data.question,
        answer: data.answer,
        lastUpdated: new Date(data.updated_at || data.created_at).toLocaleDateString(),
        // FAQ views aren't natively tracked in DB, using total votes as alternative
        views: (data.helpful_count || 0) + (data.not_helpful_count || 0),
        helpfulCount: data.helpful_count || 0,
        notHelpfulCount: data.not_helpful_count || 0,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load FAQ.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaq();
  }, [id]);

  const handleVote = async (isHelpful: boolean) => {
    if (!faq || helpful !== null) return;
    try {
      await api.post(`/faq/${faq.id}/vote`, { is_helpful: isHelpful });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F67C01] via-[#F67C01] to-[#46BB39] relative">
      {/* Organic decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[40%] bg-[#21825C]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[35%] bg-[#4E8149]/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner size="lg" color="primary" />
          </div>
        ) : error || !faq ? (
          <ErrorMessage message={error || 'FAQ not found'} retry={fetchFaq} />
        ) : (
          <>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/90 mb-6">
              <button onClick={() => navigate("/")} className="hover:text-[#2563EB]">
                Home
              </button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => navigate("/")} className="hover:text-[#2563EB]">
                FAQs
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{faq.category}</span>
            </nav>

            <div className="flex gap-8">
              {/* Main Content */}
              <article className="flex-1">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <CategoryBadge category={faq.category} icon={faq.categoryIcon} size="small" />
                  </div>

                  <h1 className="mb-4 text-gray-900">{faq.title}</h1>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
                    <span>Updated {faq.lastUpdated}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {faq.views} views
                    </span>
                    <span>•</span>
                    <span>{faq.helpfulCount} people found this helpful</span>
                  </div>

                  {/* Quick Answer */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-[#2563EB] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="mb-2 text-gray-900">Answer</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Helpful Feedback */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="mb-4 text-gray-900">Was this helpful?</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVote(true)}
                        disabled={helpful !== null}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors ${
                          helpful === true
                            ? "bg-[#10B981] text-white border-[#10B981]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#10B981] disabled:opacity-50"
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        Yes
                      </button>
                      <button
                        onClick={() => handleVote(false)}
                        disabled={helpful !== null}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors ${
                          helpful === false
                            ? "bg-[#EF4444] text-white border-[#EF4444]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#EF4444] disabled:opacity-50"
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                        No
                      </button>
                    </div>
                    {helpful !== null && (
                      <p className="mt-3 text-sm text-[#10B981]">Thanks for your feedback!</p>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </>
        )}

        {/* Floating Edit Button (Agent Only) */}
        <button className="fixed bottom-8 right-8 bg-[#2563EB] text-white p-4 rounded-full shadow-lg hover:bg-[#1d4ed8] transition-colors flex items-center gap-2">
          <Edit className="w-5 h-5" />
          <span className="hidden md:inline">Edit Article</span>
        </button>

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-24 left-8 flex items-center gap-2 text-gray-600 hover:text-[#2563EB] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Forum
        </button>
      </div>
    </div>
  );
}