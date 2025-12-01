import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Star, Search as SearchIcon, ArrowLeft, AlertCircle } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

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
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2563EB] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Forum
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-gray-900">AI Help Board</h1>
            <Sparkles className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <p className="text-gray-600">Get instant answers from our knowledge base</p>
        </div>

        {/* Search Input */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
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
              placeholder="Ask me anything about using Somba..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
              rows={3}
            />
          </div>

          {!hasSearched && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Example questions:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(example);
                      handleSearch(example);
                    }}
                    className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
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
            className={`w-full py-3 rounded-lg transition-colors ${
              query.trim().length >= 3 && !searching
                ? "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {searching ? "Searching..." : "Get Help"}
          </button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div>
            {/* Query Display */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <span className="text-gray-600">Your question:</span> <span>{query}</span>
              </p>
            </div>

            {searching ? (
              <div className="text-center py-12">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Searching our knowledge base...</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                <h2 className="mb-6 text-gray-900">Here's what we found:</h2>
                <div className="space-y-4">
                  {results.map((result) => {
                    const stars = getStars(result.confidence);
                    const lowConfidence = isLowConfidence(result.confidence);

                    return (
                      <div
                        key={result.id}
                        className={`bg-white rounded-lg shadow-sm p-6 border transition-all ${
                          lowConfidence
                            ? "border-gray-200 opacity-75"
                            : "border-gray-100 hover:shadow-md"
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
                            <p className="text-xs text-gray-500">
                              {stars.filled}/5
                              {lowConfidence && " (Low)"}
                            </p>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <StatusBadge status={result.source} size="small" />
                              {lowConfidence && (
                                <span className="text-xs text-gray-500">(Low confidence - may not be relevant)</span>
                              )}
                            </div>

                            <h3 className="mb-2 text-gray-900">{result.title}</h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">{result.snippet}</p>

                            <div className="flex items-center justify-between gap-3">
                              <CategoryBadge category={result.category} size="small" />
                              <button
                                onClick={() => navigate(`/faq/${result.id}`)}
                                className="text-sm text-[#2563EB] hover:underline"
                              >
                                View Full Answer →
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