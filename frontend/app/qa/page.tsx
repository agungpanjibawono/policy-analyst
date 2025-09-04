"use client";

import { useState, useEffect } from 'react';
import { Search, Send, FileText, ExternalLink, MessageCircle, Clock, Shield, CheckCircle } from 'lucide-react';
import PolicyList from '../../components/PolicyList';

interface PolicyAnswer {
  answer: string;
  sources: Array<{
    title: string;
    content_preview: string;
    category: string;
    relevance_score: number;
  }>;
  confidence_score: number;
}

export default function QAPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<PolicyAnswer | null>(null);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('session-loading');

  // Set sessionId on client side to avoid hydration mismatch
  useEffect(() => {
    setSessionId(`session-${Date.now()}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setAnswer(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qa/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          language: 'id',
          limit: 5
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan dalam sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    {
      category: "Kepegawaian",
      question: "Apa syarat untuk mengajukan cuti melahirkan?",
      icon: "👥"
    },
    {
      category: "Pengadaan",
      question: "Bagaimana prosedur pengadaan barang dan jasa?",
      icon: "📋"
    },
    {
      category: "Kode Etik",
      question: "Apa sanksi untuk pelanggaran kode etik pegawai?",
      icon: "⚖️"
    },
    {
      category: "Rekrutmen",
      question: "Berapa lama masa percobaan untuk pegawai baru?",
      icon: "🎯"
    },
    {
      category: "Kebijakan Kerja",
      question: "Apa kebijakan mengenai work from home?",
      icon: "🏠"
    }
  ];

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'Tinggi';
    if (score >= 0.6) return 'Sedang';
    return 'Rendah';
  };

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Konsultasi Kebijakan Terpercaya</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Layanan Konsultasi Digital
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Dapatkan informasi kebijakan yang akurat dan terpercaya dari sistem digital 
              pemerintah Indonesia yang terintegrasi dengan basis data resmi
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Consultation Section */}
          <div className="lg:col-span-2">
            {/* Professional Search Interface */}
            <div className="card mb-8">
              <div className="card-header">
                <h2 className="card-title">Form Konsultasi Kebijakan</h2>
                <p className="card-subtitle">Masukkan pertanyaan Anda mengenai kebijakan atau peraturan</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label htmlFor="query" className="input-label">
                    Pertanyaan Konsultasi
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <textarea
                      id="query"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Contoh: Bagaimana prosedur pengajuan cuti melahirkan untuk pegawai negeri sipil sesuai dengan peraturan terbaru?"
                      className="input-field pl-12 pt-4 min-h-[120px] resize-none"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Minimum 10 karakter untuk hasil optimal
                    </span>
                    <span className="text-xs text-gray-400">
                      {query.length}/500 karakter
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      <span>Data Terlindungi</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Respons Real-time</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || query.trim().length < 10}
                    className="btn-primary flex items-center justify-center min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Konsultasi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Professional Example Questions */}
            {!answer && !isLoading && (
              <div className="card mb-8">
                <div className="card-header">
                  <h3 className="card-title">Contoh Pertanyaan Konsultasi</h3>
                  <p className="card-subtitle">Pilih salah satu topik di bawah untuk memulai konsultasi</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {exampleQuestions.map((item, index) => (
                    <button
                      key={`${item.category}-${item.question.slice(0, 20)}`}
                      onClick={() => setQuery(item.question)}
                      className="text-left p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-blue-100 border border-gray-200 hover:border-blue-300 transition-all duration-200 group"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="badge badge-info text-xs">{item.category}</span>
                            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Klik untuk menggunakan
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                            {item.question}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Error Message */}
            {error && (
              <div className="card border-l-4 border-l-red-500 bg-red-50 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <ExternalLink className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-1">Terjadi Kesalahan Sistem</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                    <p className="text-red-600 text-xs mt-2">
                      Silakan coba lagi atau hubungi administrator sistem jika masalah berlanjut.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Answer Section */}
            {answer && (
              <div className="space-y-6 animate-slide-in">
                {/* Professional Answer Display */}
                <div className="card border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Hasil Konsultasi</h3>
                        <p className="text-sm text-gray-500">Berdasarkan peraturan dan kebijakan resmi</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-sm font-semibold ${getConfidenceColor(answer.confidence_score)}`}>
                      Akurasi: {Math.round(answer.confidence_score * 100)}% ({getConfidenceLabel(answer.confidence_score)})
                    </div>
                  </div>
                  
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
                      {answer.answer}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      ⚠️ Informasi ini bersifat konsultatif. Untuk kepastian hukum, silakan merujuk pada dokumen resmi atau konsultasi dengan unit hukum.
                    </p>
                  </div>
                </div>

                {/* Enhanced Sources Section */}
                {answer.sources && answer.sources.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Sumber Peraturan & Kebijakan
                      </h3>
                      <p className="card-subtitle">
                        Referensi resmi yang menjadi dasar jawaban konsultasi
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {answer.sources.map((source, index) => (
                        <div key={`${source.title}-${source.category}`} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-base leading-tight flex-1">
                              {source.title}
                            </h4>
                            <div className="flex items-center space-x-2 ml-4">
                              <span className="badge badge-info text-xs whitespace-nowrap">
                                {source.category}
                              </span>
                              <span className="badge badge-success text-xs whitespace-nowrap">
                                {Math.round(source.relevance_score * 100)}% relevan
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            {source.content_preview}
                          </p>
                          <button className="btn-secondary text-xs flex items-center">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Lihat Dokumen Lengkap
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="card-title">Status Sesi Konsultasi</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">ID Sesi:</span>
                  <span className="font-mono text-gray-800">{sessionId.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="badge badge-success">Aktif</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Keamanan:</span>
                  <span className="badge badge-info">Terenkripsi</span>
                </div>
              </div>
            </div>
            
            <PolicyList showPreview={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
