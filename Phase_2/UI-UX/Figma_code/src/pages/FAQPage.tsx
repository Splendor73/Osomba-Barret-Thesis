import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, ThumbsUp, ThumbsDown, Lightbulb, ChevronRight, Edit } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";

const mockFAQ = {
  id: "1",
  category: "Payments",
  categoryIcon: "💳",
  title: "How do I pay with MPESA?",
  lastUpdated: "2 days ago",
  views: 245,
  helpfulCount: 42,
  quickAnswer: "MPESA payments are quick and secure. Simply select MPESA at checkout, enter your phone number, and approve the payment on your phone.",
  detailedSteps: [
    {
      step: "Select MPESA at checkout",
      details: "When you're ready to pay, choose MPESA from the available payment methods.",
    },
    {
      step: "Enter your phone number",
      details: "Provide your MPESA-registered phone number. Make sure it's the number linked to your MPESA account.",
    },
    {
      step: "Check your phone",
      details: "You'll receive a payment request on your phone via SMS. The request will show the amount and merchant details.",
    },
    {
      step: "Enter your PIN",
      details: "Open the MPESA message and enter your MPESA PIN to approve the payment.",
    },
    {
      step: "Confirmation",
      details: "You'll receive a confirmation message from MPESA. Your payment should reflect in your Somba account within 5-10 minutes.",
    },
  ],
  troubleshooting: [
    "Make sure your MPESA account has sufficient balance",
    "Verify you're using the correct phone number",
    "Check that you have network connectivity",
    "If payment fails, wait 5 minutes before trying again",
  ],
};

const relatedArticles = [
  { id: "2", title: "How long do MPESA payments take to reflect?", category: "Payments", views: 189 },
  { id: "3", title: "What to do if MPESA payment fails", category: "Payments", views: 156 },
  { id: "4", title: "Can I get a refund to my MPESA?", category: "Payments", views: 134 },
];

export function FAQPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [helpful, setHelpful] = useState<boolean | null>(null);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-[#2563EB]">
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate("/")} className="hover:text-[#2563EB]">
            FAQs
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{mockFAQ.category}</span>
        </nav>

        <div className="flex gap-8">
          {/* Main Content */}
          <article className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Header */}
              <div className="mb-6">
                <CategoryBadge category={mockFAQ.category} icon={mockFAQ.categoryIcon} size="small" />
              </div>

              <h1 className="mb-4 text-gray-900">{mockFAQ.title}</h1>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
                <span>Updated {mockFAQ.lastUpdated}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {mockFAQ.views} views
                </span>
                <span>•</span>
                <span>{mockFAQ.helpfulCount} people found this helpful</span>
              </div>

              {/* Quick Answer */}
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-[#2563EB] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="mb-2 text-gray-900">Quick Answer</h3>
                    <p className="text-gray-700">{mockFAQ.quickAnswer}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Steps */}
              <div className="mb-8">
                <h2 className="mb-6 text-gray-900">Detailed Steps</h2>
                <div className="space-y-6">
                  {mockFAQ.detailedSteps.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center" style={{ fontWeight: 700 }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 text-gray-900">{item.step}</h4>
                        <p className="text-gray-600">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="mb-8 bg-yellow-50 rounded-lg p-6">
                <h3 className="mb-4 text-gray-900">Troubleshooting</h3>
                <ul className="space-y-2">
                  {mockFAQ.troubleshooting.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-[#F59E0B] mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Helpful Feedback */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="mb-4 text-gray-900">Was this helpful?</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setHelpful(true)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors ${
                      helpful === true
                        ? "bg-[#10B981] text-white border-[#10B981]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#10B981]"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Yes
                  </button>
                  <button
                    onClick={() => setHelpful(false)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors ${
                      helpful === false
                        ? "bg-[#EF4444] text-white border-[#EF4444]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#EF4444]"
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

            {/* Related Articles */}
            <div className="mt-8">
              <h2 className="mb-4 text-gray-900">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => navigate(`/faq/${article.id}`)}
                    className="bg-white rounded-lg shadow-sm p-4 text-left hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <p className="text-gray-900 mb-2 line-clamp-2">{article.title}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <CategoryBadge category={article.category} size="small" />
                      <span className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-3 h-3" />
                        {article.views}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </article>

          {/* Table of Contents - Desktop */}
          <aside className="hidden lg:block w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h4 className="mb-4 text-gray-900">On this page</h4>
              <nav className="space-y-2">
                <a href="#quick-answer" className="block text-sm text-gray-600 hover:text-[#2563EB] transition-colors">
                  Quick Answer
                </a>
                <a href="#detailed-steps" className="block text-sm text-gray-600 hover:text-[#2563EB] transition-colors">
                  Detailed Steps
                </a>
                <a href="#troubleshooting" className="block text-sm text-gray-600 hover:text-[#2563EB] transition-colors">
                  Troubleshooting
                </a>
                <a href="#helpful" className="block text-sm text-gray-600 hover:text-[#2563EB] transition-colors">
                  Was this helpful?
                </a>
              </nav>
            </div>
          </aside>
        </div>

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
