"use client";

import { useState } from 'react';
import { Edit, Wand2, Download, Copy } from 'lucide-react';

interface PolicyDraft {
  title: string;
  category: string;
  policy_type: string;
  content: string;
}

export default function DraftPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<PolicyDraft | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    category: 'general',
    policy_type: 'regulation',
    requirements: [''],
    reference_policies: [''],
    language: 'id'
  });

  const categories = [
    { value: 'general', label: 'Umum' },
    { value: 'hr', label: 'Sumber Daya Manusia' },
    { value: 'finance', label: 'Keuangan' },
    { value: 'it', label: 'Teknologi Informasi' },
    { value: 'legal', label: 'Hukum' },
    { value: 'operations', label: 'Operasional' }
  ];

  const policyTypes = [
    { value: 'regulation', label: 'Peraturan' },
    { value: 'guideline', label: 'Pedoman' },
    { value: 'procedure', label: 'Prosedur' },
    { value: 'policy', label: 'Kebijakan' },
    { value: 'standard', label: 'Standar' }
  ];

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addReferencePolicy = () => {
    setFormData(prev => ({
      ...prev,
      reference_policies: [...prev.reference_policies, '']
    }));
  };

  const updateReferencePolicy = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      reference_policies: prev.reference_policies.map((ref, i) => i === index ? value : ref)
    }));
  };

  const removeReferencePolicy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reference_policies: prev.reference_policies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const cleanFormData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        reference_policies: formData.reference_policies.filter(ref => ref.trim() !== '')
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drafting/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }

      const result = await response.json();
      setDraft(result);
    } catch (error) {
      console.error('Error generating draft:', error);
      // Handle error
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (draft) {
      await navigator.clipboard.writeText(draft.content);
      // Show toast notification
    }
  };

  const downloadDraft = () => {
    if (draft) {
      const element = document.createElement('a');
      const file = new Blob([draft.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${draft.title}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ✍️ Policy Drafting Assistant
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">
          Buat draft kebijakan baru berdasarkan best practices
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Detail Kebijakan
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topik Kebijakan *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Contoh: Kebijakan Work From Home"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kebijakan
                </label>
                <select
                  value={formData.policy_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, policy_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {policyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Persyaratan/Ketentuan
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Contoh: Maksimal 3 hari per minggu"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Tambah persyaratan
              </button>
            </div>

            {/* Reference Policies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kebijakan Referensi (opsional)
              </label>
              {formData.reference_policies.map((ref, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ref}
                    onChange={(e) => updateReferencePolicy(index, e.target.value)}
                    placeholder="Contoh: PP No. 49 Tahun 2018"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.reference_policies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReferencePolicy(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addReferencePolicy}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Tambah referensi
              </button>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !formData.topic}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Draft...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" />
                  Generate Draft
                </>
              )}
            </button>
          </form>
        </div>

        {/* Draft Result Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Draft Kebijakan
            </h2>
            {draft && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </button>
                <button
                  onClick={downloadDraft}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            )}
          </div>

          {draft ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg text-gray-900">{draft.title}</h3>
                <p className="text-sm text-gray-500">
                  {categories.find(c => c.value === draft.category)?.label} • {' '}
                  {policyTypes.find(t => t.value === draft.policy_type)?.label}
                </p>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {draft.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Edit className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Isi formulir di sebelah kiri untuk generate draft kebijakan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
