import { useState } from "react";
import { Search } from "lucide-react";
import { QuestionCard } from "../components/QuestionCard";
import { Sidebar } from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const categoryPills = [
  { name: "Payments", emoji: "💳" },
  { name: "Listings", emoji: "📝" },
  { name: "Safety", emoji: "🛡️" },
  { name: "Disputes", emoji: "⚠️" },
  { name: "Account", emoji: "👤" },
  { name: "Delivery", emoji: "🚚" },
];

const mockQuestions = [
  {
    id: "1",
    status: "FAQ" as const,
    title: "How do I pay with MPESA?",
    preview: "MPESA payments are quick and secure. Simply select MPESA at checkout, enter your phone number, and approve the payment on your phone.",
    category: "Payments",
    categoryIcon: "💳",
    date: "2 days ago",
    views: 245,
  },
  {
    id: "2",
    status: "Forum Post" as const,
    title: "My MPESA payment is not showing up",
    preview: "I made a payment via MPESA but it's not reflecting in my account. Transaction ID: MPX12345. Please help!",
    category: "Payments",
    categoryIcon: "💳",
    date: "2 hours ago",
    views: 42,
  },
  {
    id: "3",
    status: "FAQ" as const,
    title: "How to report a suspicious listing?",
    preview: "If you encounter a listing that seems fraudulent or violates our policies, you can report it by clicking the flag icon on the listing page.",
    category: "Safety",
    categoryIcon: "🛡️",
    date: "5 days ago",
    views: 189,
  },
  {
    id: "4",
    status: "Forum Post" as const,
    title: "Why is my listing not appearing in search?",
    preview: "I posted a new listing yesterday but it's not showing up when I search for it. Is there a review process?",
    category: "Listings",
    categoryIcon: "📝",
    date: "1 day ago",
    views: 67,
  },
  {
    id: "5",
    status: "FAQ" as const,
    title: "How long does delivery usually take?",
    preview: "Delivery times vary by location. Within the same city, expect 1-2 days. For inter-city deliveries, allow 3-5 business days.",
    category: "Delivery",
    categoryIcon: "🚚",
    date: "1 week ago",
    views: 312,
  },
  {
    id: "6",
    status: "Forum Post" as const,
    title: "Buyer is asking for refund after receiving item",
    preview: "I sold an item and the buyer received it in perfect condition but now wants a refund. What should I do?",
    category: "Disputes",
    categoryIcon: "⚠️",
    date: "3 hours ago",
    views: 28,
  },
];

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ai-help?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredQuestions = selectedCategory
    ? mockQuestions.filter((q) => q.category === selectedCategory)
    : mockQuestions;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Hero Section */}
      <section className="bg-[#F3F4F6] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-8 text-gray-900">How can we help you?</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Category Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {categoryPills.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="bg-white px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-sm"
              >
                <span className="block text-xl mb-1">{cat.emoji}</span>
                <span className="text-gray-700">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Questions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar activeCategory={selectedCategory} onCategoryClick={setSelectedCategory} />

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">
                {selectedCategory ? `${selectedCategory} Questions` : "Recent Questions"}
              </h2>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className="text-sm text-[#2563EB] hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  {...question}
                  onClick={() => navigate(`/thread/${question.id}`)}
                />
              ))}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No questions found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
