import { useState, useEffect } from "react";
import { Search, Sparkles, Star, AlertCircle } from "lucide-react";
import { QuestionCard } from "../components/QuestionCard";
import { CategoryBadge } from "../components/CategoryBadge";
import { Sidebar } from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
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

type AiResult = {
  id: string;
  title: string;
  snippet: string;
  category: string;
  source: "FAQ" | "Forum Post" | string;
  confidence: number;
};

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiResults, setAiResults] = useState<AiResult[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const getStars = (confidence: number) => {
    const filled = Math.round((confidence / 100) * 5);
    return { filled, total: 5 };
  };

  const handleEscalate = async () => {
    if (sessionId) {
      try { await api.post('/support/ai/escalate', { session_id: sessionId }); } catch {}
    }
    navigate(`/post?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleResultClick = (result: AiResult) => {
    navigate(result.source === "FAQ" ? `/faq/${result.id}` : `/thread/${result.id}`);
  };

  const BATCH_SIZE = 5;

  const fetchContent = async (pageNum: number, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const skip = pageNum * BATCH_SIZE;
      
      const [topicsRes, faqsRes] = await Promise.all([
        api.get(`/support/topics?lang=${language}&skip=${skip}&limit=${BATCH_SIZE}`),
        api.get(`/support/faq/?lang=${language}&skip=${skip}&limit=${BATCH_SIZE}`)
      ]);

      const fetchedTopics = topicsRes.data.map((t: any) => ({
        id: t.id.toString(),
        status: "Forum Post",
        title: t.title,
        preview: typeof t.content === 'string' ? t.content.substring(0, 150) + '...' : '',
        category: t.category_name || t.category?.name_en || 'General',
        categoryIcon: t.category_icon || t.category?.icon_url || '📝',
        date: new Date(t.created_at).toLocaleDateString(),
        views: t.view_count || 0,
        url: `/thread/${t.id}`
      }));

      const fetchedFaqs = faqsRes.data.map((f: any) => {
        const rawDate = f.updated_at || f.created_at;
        const parsedDate = rawDate ? new Date(rawDate) : null;
        const displayDate = parsedDate && !isNaN(parsedDate.getTime())
          ? parsedDate.toLocaleDateString()
          : '';
        return {
          id: f.id.toString(),
          status: "FAQ",
          title: f.question,
          preview: typeof f.answer === 'string' ? f.answer.substring(0, 150) + '...' : '',
          category: f.category_name || f.category?.name_en || 'General',
          categoryIcon: f.category_icon || f.category?.icon_url || '💡',
          date: displayDate,
          views: (f.helpful_count || 0) + (f.not_helpful_count || 0),
          url: `/faq/${f.id}`
        };
      });

      // Hide forum posts that have already been converted to FAQ (avoid duplicates)
      const faqTitles = new Set(fetchedFaqs.map((f: Question) => f.title.trim().toLowerCase()));
      const dedupedTopics = fetchedTopics.filter((t: Question) => !faqTitles.has(t.title.trim().toLowerCase()));
      const newItems = [...fetchedFaqs, ...dedupedTopics];
      
      if (append) {
        setQuestions(prev => [...prev, ...newItems]);
      } else {
        setQuestions(newItems);
      }
      
      setHasMore(newItems.length > 0);
    } catch (err) {
      console.error(err);
      setError(t('home.load_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchContent(0, false);
  }, [language]);

  const handleNextPage = () => {
    const nextBatch = page + 1;
    setPage(nextBatch);
    fetchContent(nextBatch, true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearchActive(false);
      setAiResults([]);
      setPage(0);
      fetchContent(0, false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.post('/support/ai/suggest', { query: searchQuery, language });
      setAiResults(res.data.suggestions || []);
      setSessionId(res.data.session_id || null);
      setIsSearchActive(true);
      setHasMore(false);
    } catch (err) {
      console.error(err);
      setError(t('home.search_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (isSearchActive) {
      setSearchQuery("");
      setIsSearchActive(false);
    }
    setSelectedCategory(category);
    // Note: Filtering is handled locally on the already fetched questions
  };

  const filteredQuestions = questions.filter((q) => {
    return selectedCategory ? q.category === selectedCategory : true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganicBackground />

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
              <button
                type="button"
                onClick={() => navigate(`/ai-help${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white rounded-md text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 z-10">
        <div className="flex gap-8">
          <Sidebar activeCategory={selectedCategory} onCategoryClick={handleCategoryClick} />

          <div className="flex-1">
            {/* ── AI Search Results ── */}
            {isSearchActive ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-gray-900">
                    {aiResults.length > 0
                      ? `${aiResults.length} AI result${aiResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                      : `No results for "${searchQuery}"`}
                  </h2>
                  <button
                    onClick={() => { setIsSearchActive(false); setAiResults([]); setSearchQuery(""); fetchContent(0, false); }}
                    className="text-sm px-4 py-2 text-[#F67C01] hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  >
                    {t('home.clear_filter')}
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center p-12"><LoadingSpinner size="large" /></div>
                ) : aiResults.length > 0 ? (
                  <div className="space-y-4">
                    {aiResults.map((result) => {
                      const stars = getStars(result.confidence);
                      const lowConfidence = result.confidence < 60;
                      return (
                        <div
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className={`bg-white rounded-xl shadow-sm p-6 border transition-all cursor-pointer ${
                            lowConfidence
                              ? "border-gray-200 opacity-75"
                              : "border-gray-100 hover:shadow-md hover:border-[#F67C01]/30"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-0.5 mb-1">
                                {Array.from({ length: stars.total }).map((_, idx) => (
                                  <Star
                                    key={idx}
                                    className={`w-4 h-4 ${idx < stars.filled ? "fill-[#F59E0B] text-[#F59E0B]" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 font-medium">{result.confidence}% match</p>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  result.source === 'FAQ'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                  {result.source}
                                </span>
                                {lowConfidence && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <AlertCircle className="w-3 h-3" />
                                    {t('ai.low_confidence')}
                                  </span>
                                )}
                              </div>
                              <h3 className="mb-2 text-gray-900 font-semibold">{result.title}</h3>
                              <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed">{result.snippet}</p>
                              <div className="flex items-center justify-between">
                                <CategoryBadge category={result.category} size="small" />
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleResultClick(result); }}
                                  className="text-sm text-[#F67C01] hover:text-[#d66901] font-medium transition-colors"
                                >
                                  {t('ai.view_full')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-8 text-center">
                      <p className="text-gray-600 mb-4">{t('ai.still_need_help')}</p>
                      <button
                        onClick={handleEscalate}
                        className="px-6 py-3 bg-[#F67C01] text-white rounded-lg hover:bg-[#d56b01] transition-colors shadow-sm font-medium"
                      >
                        {t('buttons.post_to_forum')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="mb-3 text-gray-900">{t('ai.no_results')}</h2>
                    <p className="text-gray-600 mb-6">{t('ai.support_help')}</p>
                    <button
                      onClick={handleEscalate}
                      className="px-6 py-3 bg-[#F67C01] text-white rounded-lg hover:bg-[#d56b01] transition-colors shadow-sm font-medium"
                    >
                      {t('buttons.post_to_forum')}
                    </button>
                  </div>
                )}

                {error && <ErrorMessage message={error} />}
              </div>
            ) : (
              /* ── Browse Mode ── */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-gray-900">
                    {selectedCategory
                      ? `${selectedCategory} ${t('home.questions_suffix')}`
                      : t('home.forum_title')}
                  </h2>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(undefined)}
                      className="text-sm px-4 py-2 text-[#F67C01] hover:bg-orange-50 rounded-lg transition-colors font-medium"
                    >
                      {t('home.clear_filter')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredQuestions.map((question) => (
                    <QuestionCard
                      key={`${question.status}-${question.id}`}
                      {...question}
                      onClick={() => navigate(question.url)}
                    />
                  ))}
                </div>

                {isLoading && (
                  <div className="flex justify-center p-12">
                    <LoadingSpinner size="large" />
                  </div>
                )}

                {error && <ErrorMessage message={error} onRetry={() => fetchContent(page, false)} />}

                {filteredQuestions.length === 0 && !isLoading && !error && (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500">{t('home.no_topics')}</p>
                  </div>
                )}

                {hasMore && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={handleNextPage}
                      disabled={isLoading}
                      className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#F67C01] hover:text-[#F67C01] transition-all disabled:opacity-50"
                    >
                      {isLoading ? t('status.loading') : "Load More / Charger plus"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
