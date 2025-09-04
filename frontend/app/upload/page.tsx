"use client";

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Shield, Database, Clock, Users } from 'lucide-react';
import { ClientUploadIcon } from '../../components/ClientUploadIcon';

interface UploadResult {
  success: boolean;
  message: string;
  document_id?: string;
  processed_chunks: number;
}

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [policyType, setPolicyType] = useState('undang-undang');
  const [instansiPenerbit, setInstansiPenerbit] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState('');
  const [status, setStatus] = useState('aktif');
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    { value: 'general', label: 'Umum', icon: '📋' },
    { value: 'hr', label: 'Kepegawaian', icon: '👥' },
    { value: 'finance', label: 'Keuangan', icon: '💰' },
    { value: 'it', label: 'Teknologi Informasi', icon: '💻' },
    { value: 'legal', label: 'Hukum dan Peraturan', icon: '⚖️' },
    { value: 'operations', label: 'Operasional', icon: '🔧' }
  ];

  const policyTypes = [
    { value: 'undang-undang', label: 'Undang-Undang', level: 'Nasional' },
    { value: 'peraturan-pemerintah', label: 'Peraturan Pemerintah', level: 'Nasional' },
    { value: 'peraturan-menteri', label: 'Peraturan Menteri', level: 'Kementerian' },
    { value: 'peraturan-lembaga', label: 'Peraturan Lembaga', level: 'Lembaga' },
    { value: 'peraturan-daerah', label: 'Peraturan Daerah', level: 'Daerah' },
    { value: 'regulation', label: 'Peraturan Teknis', level: 'Internal' },
    { value: 'guideline', label: 'Pedoman', level: 'Internal' },
    { value: 'procedure', label: 'Prosedur Operasional', level: 'Internal' },
    { value: 'policy', label: 'Kebijakan Organisasi', level: 'Internal' },
    { value: 'standard', label: 'Standar Operasional', level: 'Internal' }
  ];

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('category', category);
      formData.append('policy_type', policyType);
      formData.append('instansi_penerbit', instansiPenerbit);
      formData.append('tahun_terbit', tahunTerbit);
      formData.append('status', status);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/policies/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload gagal',
        processed_chunks: 0
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Database className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Repositori Digital Terpercaya</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Unggah Dokumen Kebijakan
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Kontribusikan dokumen peraturan dan kebijakan untuk memperkaya basis pengetahuan 
              sistem digital pemerintah Indonesia
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Security Notice */}
        <div className="card border-l-4 border-l-blue-500 bg-blue-50 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Jaminan Keamanan Data</h3>
              <p className="text-blue-800 text-sm">
                Semua dokumen yang diunggah akan dienkripsi dan disimpan dengan standar keamanan tinggi. 
                Data hanya digunakan untuk keperluan konsultasi kebijakan internal dan tidak akan dibagikan 
                kepada pihak ketiga tanpa izin resmi.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">Form Unggah Dokumen</h2>
            <p className="card-subtitle">Lengkapi informasi dokumen untuk kategorisasi yang optimal</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Document Information */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="input-label">
                  Judul Dokumen
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: UU No. 5 Tahun 2014 tentang Aparatur Sipil Negara"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Jika kosong, akan menggunakan nama file sebagai judul
                </p>
              </div>
              
              <div>
                <label htmlFor="category" className="input-label">
                  Kategori Dokumen
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="policyType" className="input-label">
                  Jenis Peraturan
                </label>
                <select
                  id="policyType"
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                  className="input-field"
                >
                  {policyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({type.level})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="instansiPenerbit" className="input-label">
                  Instansi Penerbit
                </label>
                <input
                  id="instansiPenerbit"
                  type="text"
                  value={instansiPenerbit}
                  onChange={(e) => setInstansiPenerbit(e.target.value)}
                  placeholder="Contoh: Kementerian PANRB"
                  className="input-field"
                />
              </div>
              
              <div>
                <label htmlFor="tahunTerbit" className="input-label">
                  Tahun Terbit
                </label>
                <input
                  id="tahunTerbit"
                  type="number"
                  value={tahunTerbit}
                  onChange={(e) => setTahunTerbit(e.target.value)}
                  placeholder="Contoh: 2023"
                  min="1900"
                  max="2100"
                  className="input-field"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="input-label">
                  Status Dokumen
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="aktif">🟢 Aktif</option>
                  <option value="tidak aktif">🔴 Tidak Aktif</option>
                </select>
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-6">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-purple-400 bg-purple-50 scale-105'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">{uploadProgress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Memproses Dokumen...</p>
                      <p className="text-sm text-gray-600">Dokumen sedang dianalisis dan diindeks</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-purple-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                      <ClientUploadIcon className="h-10 w-10 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Seret & Lepas File di Sini
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        atau klik untuk memilih file dari komputer
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          PDF, DOCX, TXT
                        </span>
                        <span>•</span>
                        <span>Maksimal 10MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Features */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-green-800">Proses Cepat</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-blue-800">Aman & Privat</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Database className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-purple-800">Auto Index</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className={`card border-l-4 mb-8 animate-slide-in ${
            uploadResult.success 
              ? 'border-l-green-500 bg-green-50' 
              : 'border-l-red-500 bg-red-50'
          }`}>
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${
                uploadResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {uploadResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg mb-2 ${
                  uploadResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {uploadResult.success ? 'Berhasil Diunggah!' : 'Upload Gagal'}
                </h3>
                <p className={`mb-3 ${
                  uploadResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {uploadResult.message}
                </p>
                {uploadResult.success && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <Database className="h-4 w-4 mr-2" />
                      <span>{uploadResult.processed_chunks} bagian diproses</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Siap untuk konsultasi</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Guidelines Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Best Practices */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Panduan Upload Optimal</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Pastikan dokumen dalam format yang jelas dan terbaca (PDF, DOCX, TXT)</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Gunakan judul yang deskriptif sesuai nomenklatur resmi</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Pilih kategori dan jenis peraturan dengan tepat untuk indexing</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Dokumen akan otomatis dianalisis dan diindeks untuk pencarian</span>
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informasi Teknis</h3>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Format Didukung:</span>
                <span className="text-gray-600">PDF, DOCX, TXT</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Ukuran Maksimal:</span>
                <span className="text-gray-600">10 MB per file</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Waktu Proses:</span>
                <span className="text-gray-600">1-5 menit</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Enkripsi:</span>
                <span className="text-gray-600">AES-256</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Retensi Data:</span>
                <span className="text-gray-600">Sesuai kebijakan organisasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
