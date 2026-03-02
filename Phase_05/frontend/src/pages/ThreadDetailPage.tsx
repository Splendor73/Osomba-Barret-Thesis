import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, Bookmark, Lock, Send, X, User } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { StatusBadge } from "../components/StatusBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { OrganicBackground } from "../components/OrganicBackground";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

type Topic = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  author_name: string;
  author_avatar: string;
  status: "Answered" | "Open" | "Closed" | "FAQ" | "Forum Post";
  is_locked: boolean;
  view_count: number;
  created_at: string;
};

interface CustomerContext {
  user_id: number;
  full_name: string;
  email: string;
  country: string;
  member_since: string;
  total_orders: number;
  failed_payments: number;
  recent_orders: {
    order_id: number;
    total_cost: number;
    shipping_status: string;
    payment_status: string;
    items_count: number;
  }[];
  past_forum_posts: number;
  past_resolved_posts: number;
}

type Post = {
  id: number;
  content: string;
  user_id: number;
  author_name: string;
  author_avatar: string;
  author_role: string;
  is_accepted_answer: boolean;
  created_at: string;
};

export function ThreadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, role } = useAuth();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [relatedThreads, setRelatedThreads] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [language, setLanguage] = useState("EN");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isOfficialAnswer, setIsOfficialAnswer] = useState(false);
  const [context, setContext] = useState<CustomerContext | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchThreadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [topicRes, postsRes, relatedRes] = await Promise.all([
        api.get(`/support/topics/${id}`),
        api.get(`/support/topics/${id}/posts`),
        api.get('/support/topics?limit=5')
      ]);
      setTopic(topicRes.data);
      setPosts(postsRes.data);
      setRelatedThreads(relatedRes.data.filter((t: Topic) => t.id !== Number(id)).slice(0, 3));

      if (role === 'agent' || role === 'admin') {
        try {
          const ctxRes = await api.get(`/admin/users/${topicRes.data.user_id}/support-context`);
          setContext(ctxRes.data);
        } catch (e) {
          console.error("Failed to fetch context", e);
        }
      }
    } catch (err: any) {
      console.error("Error fetching thread:", err);
      const detail = err.response?.data?.detail || err.message || "Unknown error";
      setError(`Error loading thread: ${detail}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchThreadData();
    }
  }, [id]);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      if (isOfficialAnswer && (role === 'agent' || role === 'admin')) {
        await api.post(`/support/topics/${id}/official-answer`, { content: replyText });
      } else {
        await api.post(`/support/topics/${id}/posts`, { content: replyText });
      }
      setShowReplyBox(false);
      setReplyText("");
      setIsOfficialAnswer(false);
      fetchThreadData(); // Refresh to show new post
    } catch (err) {
      console.error("Failed to post reply:", err);
      setToast({ message: "Failed to post reply. Please try again.", type: "error" });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLockThread = async () => {
    try {
      await api.post(`/support/topics/${id}/lock`, { is_locked: true });
      setShowActionsMenu(false);
      setToast({ message: "Thread locked successfully!", type: "success" });
      fetchThreadData();
    } catch (err) {
      setToast({ message: "Failed to lock thread.", type: "error" });
    }
  };

  const handleBookmarkFAQ = async () => {
    const acceptedPost = posts.find(p => p.is_accepted_answer);
    if (!acceptedPost) {
      setToast({ message: "Only answered threads can be converted to FAQ.", type: "error" });
      return;
    }
    
    try {
      await api.post(`/support/topics/${id}/convert-to-faq`, { 
        post_id: acceptedPost.id,
        question: topic?.title 
      });
      setBookmarked(true);
      setShowActionsMenu(false);
      setToast({ message: "Thread converted to FAQ successfully!", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to convert to FAQ.", type: "error" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message={error || "Thread not found"} />
        <button onClick={() => navigate("/")} className="mt-4 text-[#F67C01] hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  const officialAnswer = posts.find(p => p.is_accepted_answer);
  const regularPosts = posts.filter(p => !p.is_accepted_answer);

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganicBackground variant="alternate" />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
          toast.type === 'success' ? 'bg-[#46BB39]' : 'bg-red-500'
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-3 text-white/80 hover:text-white">&times;</button>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-700 hover:text-[#F67C01] mb-6 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Forum
        </button>

        <div className="flex gap-8">
          <div className="flex-1">
            {/* Thread Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6 border border-gray-100">
              <div className="flex items-start gap-3 mb-4 flex-wrap">
                <CategoryBadge category={topic.category_name} icon={topic.category_icon || "📝"} size="small" />
                <StatusBadge status={topic.status} size="small" />
              </div>

              <h1 className="mb-4 text-gray-900">{topic.title}</h1>

              <div className="flex items-center gap-3 mb-6">
                <ImageWithFallback
                  src={topic.author_avatar}
                  alt={topic.author_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-900 font-medium">{topic.author_name}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{formatDate(topic.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{topic.content}</p>
              </div>
            </div>

            {/* Official Answer */}
            {officialAnswer && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 md:p-8 border-l-4 border-[#46BB39] mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-[#46BB39]" />
                  <span className="px-3 py-1 bg-[#46BB39] text-white rounded-full text-sm shadow-sm font-medium">
                    Official Answer
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <ImageWithFallback
                    src={officialAnswer.author_avatar}
                    alt={officialAnswer.author_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-gray-900 font-medium">{officialAnswer.author_name}</p>
                    <p className="text-sm text-gray-600">{officialAnswer.author_role}</p>
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{officialAnswer.content}</p>
                </div>

                <p className="text-sm text-gray-500 mb-6">Posted {formatDate(officialAnswer.created_at)}</p>
              </div>
            )}

            {/* Regular Posts */}
            {regularPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <ImageWithFallback
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{post.author_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}

            {/* Reply Section */}
            {!topic.is_locked ? (
              isAuthenticated ? (
                <>
                  {!showReplyBox ? (
                    <button
                      onClick={() => { setShowReplyBox(true); setIsOfficialAnswer(false); }}
                      className="flex items-center gap-2 px-6 py-3 bg-[#F67C01] text-white rounded-lg hover:bg-[#d56b01] transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      Write a Reply
                    </button>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-900">{isOfficialAnswer ? "Post Official Answer" : "Post a Reply"}</h3>
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
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                        placeholder="Type your reply here..."
                      />
                      {(role === 'agent' || role === 'admin') && !officialAnswer && (
                        <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isOfficialAnswer}
                            onChange={(e) => setIsOfficialAnswer(e.target.checked)}
                            className="w-4 h-4 accent-[#46BB39]"
                          />
                          <span className="text-sm font-medium text-gray-700">Mark as Official Answer</span>
                          <CheckCircle className={`w-4 h-4 ${isOfficialAnswer ? 'text-[#46BB39]' : 'text-gray-300'}`} />
                        </label>
                      )}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSubmitReply}
                          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                            submittingReply ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : isOfficialAnswer ? "bg-[#46BB39] text-white hover:bg-[#3ca330]"
                            : "bg-[#F67C01] text-white hover:bg-[#d56b01]"
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
                              {isOfficialAnswer ? "Submit Official Answer" : "Post Reply"}
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
                </>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-700 mb-4">Log in to participate in this discussion.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-[#F67C01] text-white rounded-lg hover:bg-[#e06d00] transition-colors"
                  >
                    Log In
                  </button>
                </div>
              )
            ) : (
              <div className="bg-gray-100 rounded-lg p-6 text-center flex flex-col items-center justify-center">
                <Lock className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-700 font-medium">This thread has been locked.</p>
                <p className="text-gray-500 text-sm mt-1">No new replies can be added.</p>
              </div>
            )}

            {/* Agent Action Buttons */}
            {(role === 'agent' || role === 'admin') && (
              <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h4 className="mb-4 text-gray-900 font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Agent Actions
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {!topic.is_locked && (
                    <button
                      onClick={handleLockThread}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Lock Thread
                    </button>
                  )}

                  {officialAnswer && role === 'admin' && (
                    <button
                      onClick={handleBookmarkFAQ}
                      className="flex items-center gap-2 px-4 py-2 bg-[#F67C01] text-white rounded-lg hover:bg-[#e06d00] transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                      Convert to FAQ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="hidden lg:block w-80">
            {context && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="mb-4 text-gray-900 font-medium border-b pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  Customer Context
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer Info</p>
                    <p className="text-gray-900 font-medium">{context.full_name}</p>
                    <p className="text-sm text-gray-600">{context.country} • Member since {context.member_since}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                      <p className="text-2xl font-bold text-gray-900">{context.total_orders}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">Orders</p>
                    </div>
                    {context.failed_payments > 0 && (
                      <div className="flex-1 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                        <p className="text-2xl font-bold text-red-600">{context.failed_payments}</p>
                        <p className="text-xs text-red-600 uppercase font-medium">Failed Pmt</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Past Interactions</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Forum Posts</span>
                      <span className="font-medium bg-gray-100 px-2 rounded-full">{context.past_forum_posts}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-700">Resolved</span>
                      <span className="font-medium bg-green-100 text-green-700 px-2 rounded-full">{context.past_resolved_posts}</span>
                    </div>
                  </div>

                  {context.recent_orders.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-500 mb-2">Recent Orders</p>
                      {context.recent_orders.map((order: any) => (
                        <div key={order.order_id} className="text-sm mb-2 pb-2 border-b last:border-0 last:mb-0 last:pb-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900">#{order.order_id}</span>
                            <span className="font-medium text-gray-900">${order.total_cost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{order.items_count} items • {order.shipping_status}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${order.payment_status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="mb-4 text-gray-900 font-medium">Related Questions</h3>
              <div className="space-y-4">
                {relatedThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => navigate(`/thread/${thread.id}`)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <p className="text-sm text-gray-900 mb-2 line-clamp-2">{thread.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CategoryBadge category={thread.category_name} size="small" />
                    </div>
                  </button>
                ))}
                {relatedThreads.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No related threads found.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}