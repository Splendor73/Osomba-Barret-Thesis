import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Star, Search as SearchIcon, ArrowLeft, AlertCircle } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { OrganicBackground } from "../components/OrganicBackground";
import Vector from "../imports/Vector";

interface SuggestionCard {
  id: string;
  title: string;
  snippet: string;
  category: string;
  source: "FAQ" | "Forum Post";
  confidence: number;
}

const mockSuggestions: SuggestionCard[] = [
  {
    id: "1",
    title: "How long do MPESA payments take to reflect?",
    snippet: "MPESA payments typically reflect within 5-10 minutes. If your payment is delayed, wait up to 30 minutes during peak hours...",
    category: "Payments",
    source: "FAQ",
    confidence: 95,
  },
  {
    id: "2",
    title: "My MPESA payment is not showing up",
    snippet: "Check your MPESA confirmation message first. If the payment was successful but not reflecting, it may take up to 30 minutes...",
    category: "Payments",
    source: "Forum Post",
    confidence: 88,
  },
  {
    id: "3",
    title: "What to do if MPESA payment fails",
    snippet: "If your MPESA payment fails, your money will be automatically refunded to your MPESA account within 24 hours...",
    category: "Payments",
    source: "FAQ",
    confidence: 72,
  },
];

const exampleQuestions = [
  "How do I pay with MPESA?",
  "Why is my listing not showing?",
  "How do I report a scam?",
  "How long does delivery take?",
];

export function AIHelpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SuggestionCard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setQuery(queryParam);
      handleSearch(queryParam);
    }
  }, [searchParams]);

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (q.trim().length < 3) return;

    setSearching(true);
    setHasSearched(true);

    // Simulate API call
    setTimeout(() => {
      if (q.toLowerCase().includes("mpesa") || q.toLowerCase().includes("payment")) {
        setResults(mockSuggestions);
      } else {
        setResults([]);
      }
      setSearching(false);
    }, 800);
  };

  const getStars = (confidence: number) => {
    const stars = Math.round((confidence / 100) * 5);
    return { filled: stars, total: 5 };
  };

  const isLowConfidence = (confidence: number) => confidence < 60;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Organic decorative shapes background */}
      <OrganicBackground variant="alternate" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-700 hover:text-[#F67C01] mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Forum
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F67C01] to-[#46BB39] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-[#F67C01] to-[#46BB39] bg-clip-text text-transparent">
              AI Help Board
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Get instant answers powered by artificial intelligence
          </p>
        </div>

        {/* Search Input */}
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
              placeholder="Ask me anything about using Osomba..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01] focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {!hasSearched && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2 font-medium">Try asking:</p>
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

          <button
            onClick={() => handleSearch()}
            disabled={query.trim().length < 3 || searching}
            className={`w-full py-3 rounded-lg transition-all font-medium ${
              query.trim().length >= 3 && !searching
                ? "bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white hover:shadow-lg hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {searching ? "Searching..." : "Search with AI"}
          </button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div>
            {/* Query Display */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
              <p className="text-gray-700">
                <span className="text-gray-500 font-medium">Your question:</span> <span className="font-medium">{query}</span>
              </p>
            </div>

            {searching ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Searching our knowledge base...</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                <h2 className="mb-6 text-gray-900">
                  Found {results.length} relevant {results.length === 1 ? 'answer' : 'answers'}
                </h2>
                <div className="space-y-4">
                  {results.map((result) => {
                    const stars = getStars(result.confidence);
                    const lowConfidence = isLowConfidence(result.confidence);

                    return (
                      <div
                        key={result.id}
                        className={`bg-white rounded-xl shadow-sm p-6 border transition-all ${
                          lowConfidence
                            ? "border-gray-200 opacity-75"
                            : "border-gray-100 hover:shadow-md hover:border-[#F67C01]/30"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Confidence Score */}
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
                              {result.confidence}%{lowConfidence && " match"}
                            </p>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <StatusBadge status={result.source} size="small" />
                              {lowConfidence && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <AlertCircle className="w-3 h-3" />
                                  Low confidence match
                                </span>
                              )}
                            </div>

                            <h3 className="mb-2 text-gray-900 font-semibold">{result.title}</h3>
                            <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed">{result.snippet}</p>

                            <div className="flex items-center justify-between gap-3">
                              <CategoryBadge category={result.category} size="small" />
                              <button
                                onClick={() => navigate(`/faq/${result.id}`)}
                                className="text-sm text-[#F67C01] hover:text-[#d66901] font-medium transition-colors"
                              >
                                View full answer →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Still Need Help */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-4">Still need help?</p>
                  <button
                    onClick={() => navigate("/post")}
                    className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
                  >
                    Post to Forum
                  </button>
                </div>
              </div>
            ) : (
              // No Results
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="mb-3 text-gray-900">We couldn't find a great match for your question</h2>
                <p className="text-gray-600 mb-6">Our support agents can help you directly</p>
                <button
                  onClick={() => navigate(`/post?q=${encodeURIComponent(query)}`)}
                  className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
                >
                  Post to Forum
                </button>
              </div>
            )}

            {/* New Search */}
            {hasSearched && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setHasSearched(false);
                  }}
                  className="text-gray-600 hover:text-[#2563EB] transition-colors"
                >
                  New Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}