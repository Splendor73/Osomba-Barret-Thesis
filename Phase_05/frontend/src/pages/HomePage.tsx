import { useState, useEffect } from "react";
import { Search, Sparkles } from "lucide-react";
import { QuestionCard } from "../components/QuestionCard";
import { Sidebar } from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { QuestionCardSkeleton } from "../components/SkeletonLoader";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { OrganicBackground } from "../components/OrganicBackground";
import { useLanguage } from "../context/LanguageContext";

import api from "../lib/api";

type Question = {
  id: string;
  status: "FAQ" | "Forum Post";
  title: string;
  preview: string;
  category: string;
  categoryIcon?: string;
  date: string;
  views: number;
  url: string;
};

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [topicsRes, faqsRes] = await Promise.all([
        api.get('/support/topics'),
        api.get('/support/faq/')
      ]);

      const fetchedTopics = topicsRes.data.map((t: any) => ({
        id: t.id.toString(),
        status: "Forum Post",
        title: t.title,
        preview: typeof t.content === 'string' ? t.content.substring(0, 150) + '...' : '',
        category: t.category?.name_en || 'General',
        categoryIcon: t.category?.icon_url || '📝',
        date: new Date(t.created_at).toLocaleDateString(),
        views: t.view_count || 0,
        url: `/thread/${t.id}`
      }));

      const fetchedFaqs = faqsRes.data.map((f: any) => ({
        id: f.id.toString(),
        status: "FAQ",
        title: f.question,
        preview: typeof f.answer === 'string' ? f.answer.substring(0, 150) + '...' : '',
        category: f.category?.name_en || 'General',
        categoryIcon: f.category?.icon_url || '💡',
        date: new Date(f.updated_at || f.created_at).toLocaleDateString(),
        views: (f.helpful_count || 0) + (f.not_helpful_count || 0),
        url: `/faq/${f.id}`
      }));

      setQuestions([...fetchedFaqs, ...fetchedTopics]);
    } catch (err) {
      console.error(err);
      setError('Failed to load questions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchContent();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/support/search?query=${encodeURIComponent(searchQuery)}`);
      const searchResults = (res.data.results || []).map((r: any) => ({
        id: r.id.toString(),
        status: r.type === 'faq' ? 'FAQ' : 'Forum Post',
        title: r.title,
        preview: typeof r.content === 'string' ? r.content.substring(0, 150) + '...' : '',
        category: 'General',
        categoryIcon: r.type === 'faq' ? '💡' : '📝',
        date: '',
        views: 0,
        url: r.type === 'faq' ? `/faq/${r.id}` : `/thread/${r.id}`,
      }));
      setQuestions(searchResults);
    } catch (err) {
      console.error(err);
      setError('Search failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    return selectedCategory ? q.category === selectedCategory : true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Organic decorative shapes background */}
      <OrganicBackground />
      
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <h1 className="mb-2 bg-gradient-to-r from-[#F67C01] to-[#46BB39] bg-clip-text text-transparent">
              {t('home.title')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Unified AI Search Bar */}
          <form onSubmit={handleSearch}>
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder={t('home.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 pr-24 border-2 border-gray-200 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F67C01] focus:border-transparent text-base hover:shadow-md transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white rounded-md text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Recent Questions Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 z-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar activeCategory={selectedCategory} onCategoryClick={setSelectedCategory} />

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">
                {selectedCategory ? `${selectedCategory} Questions` : t('home.forum_title')}
              </h2>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className="text-sm px-4 py-2 text-[#F67C01] hover:bg-orange-50 rounded-lg transition-colors font-medium"
                >
                  Clear filter
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center p-12">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchContent} />
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">{t('home.no_topics')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={`${question.status}-${question.id}`}
                    {...question}
                    onClick={() => navigate(question.url)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}