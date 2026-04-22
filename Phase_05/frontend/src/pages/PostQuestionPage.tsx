import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { X, CheckCircle } from "lucide-react";
import { OrganicBackground } from "../components/OrganicBackground";
import { LoadingSpinner } from "../components/LoadingSpinner";
import api from "../lib/api";
import { useLanguage } from "../context/LanguageContext";

type Category = {
  id: number;
  name: string;
  name_en?: string;
  icon: string;
  icon_url?: string;
};

export function PostQuestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get("q");
    if (q) {
      setTitle(decodeURIComponent(q));
    }

    const fetchCategories = async () => {
      try {
        const res = await api.get('/support/categories/');
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
      newErrors.category = t('post.error_category');
    }
    if (title.length < 10) {
      newErrors.title = t('post.error_title_min');
    }
    if (title.length > 200) {
      newErrors.title = t('post.error_title_max');
    }
    if (body.length < 20) {
      newErrors.body = t('post.error_body_min');
    }
    if (body.length > 5000) {
      newErrors.body = t('post.error_body_max');
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
          language,
          terms_version: "2026-q1-v1"
        });
        setSubmitted(true);
        setTimeout(() => {
          navigate(`/thread/${res.data.id}`);
        }, 2000);
      } catch (err: any) {
        setErrors({ submit: err.response?.data?.detail || t('post.error_submit') });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid = category && title.length >= 10 && title.length <= 200 && body.length >= 20 && body.length <= 5000 && !isSubmitting;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F67C01] flex items-center justify-center relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[40%] bg-[#F89C4A]/25 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[35%] bg-[#F67C01]/20 rounded-full blur-3xl" />
        </div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-[#F67C01] mx-auto mb-4" />
          <h2 className="mb-2 text-gray-900">{t('post.success_title')}</h2>
          <p className="text-gray-600">{t('post.success_redirect')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F67C01] py-8 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[40%] bg-[#F89C4A]/25 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[35%] bg-[#F67C01]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h1 className="mb-8 text-gray-900">{t('post.title')}</h1>
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {errors.submit}
                </div>
              )}

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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01] ${
                    errors.category ? "border-[#EF4444]" : "border-gray-300"
                  }`}
                >
                  <option value="">{isLoadingCats ? t('post.loading_categories') : t('post.select_category')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon_url || cat.icon || "📝"} {cat.name_en || cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-[#EF4444]">{errors.category}</p>
                )}
              </div>

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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01] ${
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
                  <p className="text-sm text-gray-500">{title.length} {t('post.chars_title')}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-gray-900">
                  {t('post.body_label')} <span className="text-[#EF4444]">*</span>
                </label>

                <textarea
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setErrors({ ...errors, body: "" });
                  }}
                  placeholder={t('post.body_placeholder')}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01] min-h-[200px] ${
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
                  <p className="text-sm text-gray-500">{body.length} {t('post.chars_body')}</p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                    isFormValid
                      ? "bg-[#F67C01] text-white hover:bg-[#d56b01]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      {t('post.posting')}
                    </>
                  ) : (
                    t('post.post_question')
                  )}
                </button>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block w-80">
            <div className="bg-orange-50 rounded-lg p-6 sticky top-24">
              <h3 className="mb-4 text-gray-900">{t('post.tips_title')}</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#F67C01] mt-0.5">•</span>
                  <span>{t('post.tip_1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F67C01] mt-0.5">•</span>
                  <span>{t('post.tip_2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F67C01] mt-0.5">•</span>
                  <span>{t('post.tip_3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F67C01] mt-0.5">•</span>
                  <span>{t('post.tip_4')}</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-orange-200">
                <Link to="/ai-help" className="text-[#F67C01] hover:underline text-sm">
                  {t('post.search_first')}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
