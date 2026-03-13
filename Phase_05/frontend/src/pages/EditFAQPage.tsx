import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { OrganicBackground } from "../components/OrganicBackground";
import { useLanguage } from "../context/LanguageContext";
import api from "../lib/api";

type Category = {
  id: number;
  name: string;
  name_en?: string;
  icon: string;
  icon_url?: string;
};

export function EditFAQPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch categories and FAQ concurrently
        const [catsRes, faqRes] = await Promise.all([
          api.get('/support/categories/'),
          api.get(`/support/faq/${id}?lang=en`) // Always fetch english for editing
        ]);
        
        setCategories(catsRes.data);
        
        const faq = faqRes.data;
        setQuestion(faq.question);
        setAnswer(faq.answer);
        
        // Find category ID based on name if category_id isn't directly returned
        if (faq.category_id) {
          setCategoryId(faq.category_id.toString());
        } else if (faq.category_name) {
          const cat = catsRes.data.find((c: Category) => 
            c.name === faq.category_name || c.name_en === faq.category_name
          );
          if (cat) setCategoryId(cat.id.toString());
        }
        
      } catch (err: any) {
        console.error("Failed to load data", err);
        setError(err.response?.data?.detail || "Failed to load FAQ details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !question.trim() || !answer.trim() || !categoryId) {
      setError("Please fill out all fields");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await api.put(`/support/faq/${id}`, {
        question: question.trim(),
        answer: answer.trim(),
        category_id: parseInt(categoryId, 10)
      });
      navigate(`/faq/${id}`);
    } catch (err: any) {
      console.error("Failed to update FAQ", err);
      setError(err.response?.data?.detail || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm(t('faq.confirm_delete') || "Are you sure you want to delete this FAQ?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/support/faq/${id}`);
      navigate("/");
    } catch (err) {
      console.error('Failed to delete FAQ', err);
      alert(t('faq.delete_failed') || "Failed to delete FAQ");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] relative overflow-hidden">
      <OrganicBackground variant="alternate" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F67C01] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit FAQ</h1>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <LoadingSpinner size="large" />
            </div>
          ) : error && !question ? (
             <ErrorMessage message={error} onRetry={() => window.location.reload()} />
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon_url || cat.icon || "📝"} {cat.name_en || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01] resize-y"
                  required
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete FAQ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#F67C01] hover:bg-[#d56b01] text-white px-6 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <LoadingSpinner size="small" color="#ffffff" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
