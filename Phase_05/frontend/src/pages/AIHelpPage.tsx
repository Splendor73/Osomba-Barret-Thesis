import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Star, ArrowLeft, AlertCircle } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { OrganicBackground } from "../components/OrganicBackground";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { useLanguage } from "../context/LanguageContext";

interface SuggestionCard {
  id: string;
  title: string;
  snippet: string;
  category: string;
  source: "FAQ" | "Forum Post" | string;
  confidence: number;
}

export function AIHelpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SuggestionCard[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();

  const exampleQuestions = [
    t('ai.example_q1'),
    t('ai.example_q2'),
    t('ai.example_q3'),
    t('ai.example_q4'),
  ];

  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setQuery(queryParam);
      handleSearch(queryParam);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (q.trim().length < 3) return;

    setSearching(true);
    setHasSearched(true);
    setError(null);

    try {
      const response = await api.post('/support/ai/suggest', { 
        query: q, 
        language,
        terms_version: "2026-q1-v1"
      });
      setResults(response.data.suggestions || []);
      setSessionId(response.data.session_id || null);
    } catch (err) {
      console.error("Failed to fetch AI suggestions:", err);
      setError(t('ai.search_error'));
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleEscalate = async () => {
    if (sessionId) {
      try {
        await api.post('/support/ai/escalate', { session_id: sessionId });
      } catch (err) {
        console.error("Failed to log escalation:", err);
      }
    }
    if (isAuthenticated) {
      navigate(`/post?q=${encodeURIComponent(query)}`);
      return;
    }

    navigate("/login", {
      state: {
        from: { pathname: "/post", search: `?q=${encodeURIComponent(query)}` },
        message: t('login.support_write_required'),
      },
    });
  };

  const handleResultClick = (result: SuggestionCard) => {
    if (result.source === "FAQ") {
      navigate(`/faq/${result.id}`);
    } else {
      navigate(`/thread/${result.id}`);
    }
  };

  const getStars = (confidence: number) => {
    const stars = Math.round((confidence / 100) * 5);
    return { filled: stars, total: 5 };
  };

  const isLowConfidence = (confidence: number) => confidence < 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganicBackground variant="alternate" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-700 hover:text-[#F67C01] mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('buttons.back_to_forum')}
        </button>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F67C01] to-[#F89C4A] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-[#F67C01] to-[#F89C4A] bg-clip-text text-transparent">
              {t('ai.title')}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {t('ai.prompt')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="relative mb-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder={t('ai.placeholder')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01] focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {!hasSearched && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2 font-medium">{t('ai.try_asking')}</p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(example);
                      handleSearch(example);
                    }}
                    className="text-sm text-gray-700 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors border border-orange-200 font-medium"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          <button
            onClick={() => handleSearch()}
            disabled={query.trim().length < 3 || searching}
            className={`w-full py-3 rounded-lg transition-all font-medium ${
              query.trim().length >= 3 && !searching
                ? "bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white hover:shadow-lg hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {searching ? t('ai.searching') : t('ai.search_with_ai')}
          </button>
        </div>

        {hasSearched && (
          <div>
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
              <p className="text-gray-700">
                <span className="text-gray-500 font-medium">{t('ai.your_question')}</span> <span className="font-medium">{query}</span>
              </p>
            </div>

            {searching ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">{t('ai.searching_kb')}</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                <h2 className="mb-6 text-gray-900">
                  {t('ai.found_results').replace('{count}', String(results.length)).replace('{noun}', results.length === 1 ? 'answer' : 'answers')}
                </h2>
                <div className="space-y-4">
                  {results.map((result) => {
                    const stars = getStars(result.confidence);
                    const lowConfidence = isLowConfidence(result.confidence);
                    const sourceKey = result.source === 'FAQ' ? 'status.faq' : 'status.forum_post';

                    return (
                      <div
                        key={result.id}
                        className={`bg-white rounded-xl shadow-sm p-6 border transition-all ${
                          lowConfidence
                            ? "border-gray-200 opacity-75"
                            : "border-gray-100 hover:shadow-md hover:border-[#F67C01]/30 cursor-pointer"
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center gap-1 mb-1">
                              {Array.from({ length: stars.total }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-4 h-4 ${
                                    idx < stars.filled
                                      ? "fill-[#F59E0B] text-[#F59E0B]"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              {result.confidence}{t('ai.match')}
                            </p>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                result.source === 'FAQ'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>
                                {t(sourceKey)}
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

                            <div className="flex items-center justify-between gap-3">
                              <CategoryBadge category={result.category} size="small" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResultClick(result);
                                }}
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
                </div>

                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-4">{t('ai.still_need_help')}</p>
                  <button
                    onClick={handleEscalate}
                    className="px-6 py-3 bg-[#F67C01] text-white rounded-lg hover:bg-[#d56b01] transition-colors shadow-sm"
                  >
                    {t('buttons.post_to_forum')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="mb-3 text-gray-900">{t('ai.no_results')}</h2>
                <p className="text-gray-600 mb-6">{t('ai.support_help')}</p>
                <button
                  onClick={handleEscalate}
                  className="px-6 py-3 bg-[#F67C01] text-white rounded-lg hover:bg-[#d56b01] transition-colors shadow-sm"
                >
                  {t('buttons.post_to_forum')}
                </button>
              </div>
            )}

            {hasSearched && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setHasSearched(false);
                    setSessionId(null);
                  }}
                  className="text-gray-700 font-medium hover:text-[#F67C01] transition-colors"
                >
                  {t('buttons.new_search')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
