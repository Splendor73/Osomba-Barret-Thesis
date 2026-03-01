import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Bold, Italic, List, Link as LinkIcon, CheckCircle } from "lucide-react";
import { OrganicBackground } from "../components/OrganicBackground";
import { LoadingSpinner } from "../components/LoadingSpinner";
import api from "../lib/api";
import { useLanguage } from "../context/LanguageContext";

type Category = {
  id: number;
  name_en: string;
  icon_url: string;
};

export function PostQuestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { language, t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for prefill query parameter
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get("q");
    if (q) {
      setTitle(decodeURIComponent(q));
    }

    const fetchCategories = async () => {
      try {
        const res = await api.get('/support/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setIsLoadingCats(false);
      }
    };
    fetchCategories();
  }, [location.search]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!category) {
      newErrors.category = "Please select a category";
    }
    if (title.length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    }
    if (title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }
    if (body.length < 20) {
      newErrors.body = "Please provide more details (at least 20 characters)";
    }
    if (body.length > 5000) {
      newErrors.body = "Description is too long (maximum 5000 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const res = await api.post('/support/topics', {
          title,
          content: body,
          category_id: parseInt(category, 10),
          language
        });
        setSubmitted(true);
        setTimeout(() => {
          navigate(`/thread/${res.data.id}`);
        }, 2000);
      } catch (err: any) {
        setErrors({ submit: err.response?.data?.detail || "Failed to post question. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid = category && title.length >= 10 && title.length <= 200 && body.length >= 20 && body.length <= 5000 && !isSubmitting;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F67C01] via-[#F67C01] to-[#46BB39] flex items-center justify-center relative">
        {/* Organic decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[40%] bg-[#21825C]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[35%] bg-[#4E8149]/20 rounded-full blur-3xl" />
        </div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-[#46BB39] mx-auto mb-4" />
          <h2 className="mb-2 text-gray-900">Question Posted Successfully!</h2>
          <p className="text-gray-600">Redirecting you back to the forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F67C01] via-[#F67C01] to-[#46BB39] py-8 relative">
      {/* Organic decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[40%] bg-[#21825C]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[35%] bg-[#4E8149]/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/90 mb-1">Step {step} of 2: Describe your question</p>
              <div className="flex gap-2">
                <div className={`h-1 w-24 rounded ${step >= 1 ? "bg-[#46BB39]" : "bg-white/30"}`}></div>
                <div className={`h-1 w-24 rounded ${step >= 2 ? "bg-[#46BB39]" : "bg-white/30"}`}></div>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main Form */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h1 className="mb-8 text-gray-900">{t('post.title')}</h1>
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {errors.submit}
                </div>
              )}

              {/* Category */}
              <div className="mb-6">
                <label className="block mb-2 text-gray-900">
                  {t('post.category_label')} <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setErrors({ ...errors, category: "" });
                  }}
                  disabled={isLoadingCats}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                    errors.category ? "border-[#EF4444]" : "border-gray-300"
                  }`}
                >
                  <option value="">{isLoadingCats ? 'Loading categories...' : 'Select a category...'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon_url} {cat.name_en}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-[#EF4444]">{errors.category}</p>
                )}
              </div>

              {/* Title */}
              <div className="mb-6">
                <label className="block mb-2 text-gray-900">
                  {t('post.title_label')} <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({ ...errors, title: "" });
                  }}
                  placeholder={t('post.title_placeholder')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                    errors.title ? "border-[#EF4444]" : "border-gray-300"
                  }`}
                  maxLength={200}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.title ? (
                    <p className="text-sm text-[#EF4444]">{errors.title}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500">{title.length} / 200 characters</p>
                </div>
              </div>

              {/* Body */}
              <div className="mb-6">
                <label className="block mb-2 text-gray-900">
                  {t('post.body_label')} <span className="text-[#EF4444]">*</span>
                </label>
                
                {/* Rich Text Toolbar */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-300 rounded-t-lg">
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bold">
                    <Bold className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Italic">
                    <Italic className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="List">
                    <List className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Link">
                    <LinkIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <textarea
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setErrors({ ...errors, body: "" });
                  }}
                  placeholder={t('post.body_placeholder')}
                  className={`w-full px-4 py-3 border border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[200px] ${
                    errors.body ? "border-[#EF4444]" : "border-gray-300"
                  }`}
                  maxLength={5000}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.body ? (
                    <p className="text-sm text-[#EF4444]">{errors.body}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500">{body.length} / 5000 characters</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button className="text-[#2563EB] hover:underline">
                  Save as Draft
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {/* Preview functionality */}}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                      isFormValid
                        ? "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="small" />
                        Posting...
                      </>
                    ) : (
                      "Post Question"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Help Sidebar */}
          <aside className="hidden lg:block w-80">
            <div className="bg-blue-50 rounded-lg p-6 sticky top-24">
              <h3 className="mb-4 text-gray-900">Tips for a good question</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#2563EB] mt-0.5">•</span>
                  <span>Be specific and clear about your issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563EB] mt-0.5">•</span>
                  <span>Include any error messages you received</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563EB] mt-0.5">•</span>
                  <span>Mention what steps you've already tried</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563EB] mt-0.5">•</span>
                  <span>Provide relevant IDs or reference numbers</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-blue-200">
                <a href="/ai-help" className="text-[#2563EB] hover:underline text-sm">
                  Search existing questions first →
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}