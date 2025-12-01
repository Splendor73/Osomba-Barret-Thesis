import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, ThumbsUp, ThumbsDown, CheckCircle, ChevronLeft, Bookmark, Lock, MoreVertical, Send, X } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { StatusBadge } from "../components/StatusBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { LoadingSpinner } from "../components/LoadingSpinner";

const mockThread = {
  id: "2",
  category: "Payments",
  categoryIcon: "💳",
  status: "Answered" as const,
  title: "My MPESA payment is not showing up",
  author: {
    name: "Jane Doe",
    avatar: "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop",
    postedDate: "2 hours ago",
  },
  views: 42,
  body: "I made a payment via MPESA but it's not reflecting in my account. Transaction ID: MPX12345. Please help!",
  officialAnswer: {
    agent: {
      name: "John Agent",
      title: "Somba Support Team",
      avatar: "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop",
    },
    content: `Thank you for reaching out! I understand how concerning this can be.

**Here's what's happening:**
MPESA payments typically reflect within 5-10 minutes. However, during peak hours, there may be delays of up to 30 minutes.

**What you can do:**
1. Check your MPESA message to confirm the transaction was successful
2. Verify you sent the payment to the correct till number
3. Wait 30 minutes from the time of payment
4. If after 30 minutes the payment still hasn't reflected, contact us with your transaction ID

I've checked your transaction ID (MPX12345) and can see it was received by our system. The payment should reflect in your account within the next 5 minutes. Please refresh your account balance.

If you don't see it after 5 minutes, please reply here and I'll escalate this to our payments team.`,
    postedDate: "1 hour ago",
  },
};

const relatedThreads = [
  { id: "1", title: "How do I pay with MPESA?", views: 245, category: "Payments" },
  { id: "3", title: "MPESA payment failed but money was deducted", views: 89, category: "Payments" },
  { id: "5", title: "Can I get a refund to my MPESA?", views: 156, category: "Payments" },
];

export function ThreadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [language, setLanguage] = useState("EN");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [threadStatus, setThreadStatus] = useState<"Answered" | "Open" | "Closed">(mockThread.status);
  const [bookmarked, setBookmarked] = useState(false);

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      setSubmittingReply(true);
      // Simulate API call
      setTimeout(() => {
        setSubmittingReply(false);
        setShowReplyBox(false);
        setReplyText("");
        setThreadStatus("Answered");
        alert("Reply posted successfully!");
      }, 1000);
    }
  };

  const handleCloseThread = () => {
    if (confirm("Are you sure you want to close this thread?")) {
      setThreadStatus("Closed");
      setShowActionsMenu(false);
    }
  };

  const handleLockThread = () => {
    if (confirm("Are you sure you want to lock this thread?")) {
      setShowActionsMenu(false);
      alert("Thread locked successfully!");
    }
  };

  const handleBookmarkFAQ = () => {
    setBookmarked(true);
    setTimeout(() => {
      alert("Thread bookmarked as FAQ!");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2563EB] mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Forum
        </button>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Thread Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4 flex-wrap">
                <CategoryBadge category={mockThread.category} icon={mockThread.categoryIcon} size="small" />
                <StatusBadge status={mockThread.status} size="small" />
              </div>

              {/* Title */}
              <h1 className="mb-4 text-gray-900">{mockThread.title}</h1>

              {/* Author Info */}
              <div className="flex items-center gap-3 mb-6">
                <ImageWithFallback
                  src={mockThread.author.avatar}
                  alt={mockThread.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-900">{mockThread.author.name}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{mockThread.author.postedDate}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {mockThread.views} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Question Body */}
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700">{mockThread.body}</p>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Language:</span>
                <button
                  onClick={() => setLanguage("EN")}
                  className={`px-3 py-1 text-sm rounded ${
                    language === "EN"
                      ? "bg-[#2563EB] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("FR")}
                  className={`px-3 py-1 text-sm rounded ${
                    language === "FR"
                      ? "bg-[#2563EB] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  FR
                </button>
              </div>
            </div>

            {/* Official Answer */}
            <div className="bg-[#F0FDF4] rounded-lg shadow-sm p-6 md:p-8 border-l-4 border-[#10B981] mb-6">
              {/* Answer Header */}
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                <span className="px-3 py-1 bg-[#10B981] text-white rounded-full text-sm">
                  Official Answer
                </span>
              </div>

              {/* Agent Info */}
              <div className="flex items-center gap-3 mb-6">
                <ImageWithFallback
                  src={mockThread.officialAnswer.agent.avatar}
                  alt={mockThread.officialAnswer.agent.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-900">{mockThread.officialAnswer.agent.name}</p>
                  <p className="text-sm text-gray-600">{mockThread.officialAnswer.agent.title}</p>
                </div>
              </div>

              {/* Answer Content */}
              <div className="prose max-w-none mb-6">
                {mockThread.officialAnswer.content.split("\n").map((paragraph, idx) => (
                  <p key={idx} className="text-gray-700 mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Posted Time */}
              <p className="text-sm text-gray-500 mb-6">Posted {mockThread.officialAnswer.postedDate}</p>

              {/* Helpful Buttons */}
              <div className="pt-6 border-t border-[#10B981]/20">
                <p className="mb-3 text-gray-900">Was this helpful?</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setHelpful(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      helpful === true
                        ? "bg-[#10B981] text-white border-[#10B981]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#10B981]"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes
                  </button>
                  <button
                    onClick={() => setHelpful(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      helpful === false
                        ? "bg-[#EF4444] text-white border-[#EF4444]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#EF4444]"
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No
                  </button>
                </div>
                {helpful !== null && (
                  <p className="mt-3 text-sm text-[#10B981]">Thanks for your feedback!</p>
                )}
              </div>
            </div>

            {/* Reply Box */}
            {showReplyBox && (
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Post a Reply</h3>
                  <button
                    onClick={() => setShowReplyBox(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Type your reply here..."
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmitReply}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                      submittingReply ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                    }`}
                    disabled={submittingReply || !replyText.trim()}
                  >
                    {submittingReply ? (
                      <>
                        <LoadingSpinner size="small" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post Reply
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowReplyBox(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Agent Action Buttons */}
            {threadStatus !== "Closed" && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h4 className="mb-4 text-gray-900">Agent Actions</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowReplyBox(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Reply to Thread
                  </button>
                  <button
                    onClick={handleCloseThread}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Answered
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                      More Actions
                    </button>
                    {showActionsMenu && (
                      <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-10">
                        <button
                          onClick={handleLockThread}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Lock className="w-4 h-4" />
                          Lock Thread
                        </button>
                        <button
                          onClick={handleBookmarkFAQ}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                          Save as FAQ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Related Threads */}
          <aside className="hidden lg:block w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="mb-4 text-gray-900">Related Questions</h3>
              <div className="space-y-4">
                {relatedThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => navigate(`/thread/${thread.id}`)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <p className="text-sm text-gray-900 mb-2 line-clamp-2">{thread.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CategoryBadge category={thread.category} size="small" />
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {thread.views}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Floating Action Button */}
        <button
          className="fixed bottom-8 right-8 bg-[#2563EB] text-white p-4 rounded-full shadow-lg hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
          onClick={handleBookmarkFAQ}
        >
          <Bookmark className="w-5 h-5" />
          <span className="hidden md:inline">Bookmark as FAQ</span>
        </button>
      </div>
    </div>
  );
}