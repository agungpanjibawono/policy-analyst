"use client";

import { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, RefreshCw, Trash2 } from 'lucide-react';

interface PolicyDocument {
  title: string;
  category: string;
  document_type: string;
  source: string;
  date_created: string;
  language: string;
  chunk_count: number;
  preview: string;
  instansi_penerbit?: string;
  tahun_terbit?: number;
  status: string;
}

interface PolicyListProps {
  showPreview?: boolean;
  maxItems?: number;
}

export default function PolicyList({ showPreview = true, maxItems }: PolicyListProps) {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/policies/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      let docs = data.documents || [];
      
      // Limit items if maxItems is specified
      if (maxItems && docs.length > maxItems) {
        docs = docs.slice(0, maxItems);
      }
      
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${title}"?`)) {
      return;
    }

    setDeletingDocument(title);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/policies/${encodeURIComponent(title)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      const result = await response.json();
      
      // Show success message
      alert(result.message || 'Dokumen berhasil dihapus');
      
      // Refresh the document list
      await fetchDocuments();
      
    } catch (err) {
      console.error('Error deleting document:', err);
      alert(err instanceof Error ? err.message : 'Gagal menghapus dokumen');
    } finally {
      setDeletingDocument(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      aktif: 'bg-green-100 text-green-800',
      tidak_aktif: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      aktif: 'Aktif',
      tidak_aktif: 'Tidak Aktif'
    };
    return labels[status] || status;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      hr: 'bg-blue-100 text-blue-800',
      finance: 'bg-green-100 text-green-800',
      legal: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800',
      it: 'bg-purple-100 text-purple-800',
      operations: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'undang-undang': 'bg-red-100 text-red-800',
      'peraturan-pemerintah': 'bg-blue-100 text-blue-800',
      'peraturan-menteri': 'bg-green-100 text-green-800',
      'peraturan-lembaga': 'bg-purple-100 text-purple-800',
      'peraturan-daerah': 'bg-amber-100 text-amber-800',
      'regulation': 'bg-indigo-100 text-indigo-800',
      'policy': 'bg-yellow-100 text-yellow-800',
      'guideline': 'bg-cyan-100 text-cyan-800',
      'procedure': 'bg-teal-100 text-teal-800',
      'standard': 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'undang-undang': 'Undang-undang',
      'peraturan-pemerintah': 'Peraturan Pemerintah',
      'peraturan-menteri': 'Peraturan Menteri',
      'peraturan-lembaga': 'Peraturan Lembaga',
      'peraturan-daerah': 'Peraturan Daerah',
      'regulation': 'Peraturan',
      'policy': 'Kebijakan',
      'guideline': 'Panduan',
      'procedure': 'Prosedur',
      'standard': 'Standar',
      'law': 'Undang-undang'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Memuat daftar kebijakan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDocuments}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Belum ada kebijakan yang diunggah</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Daftar Kebijakan ({documents.length})
        </h3>
        <button
          onClick={fetchDocuments}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.title} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
                <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(doc.date_created)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {doc.chunk_count} bagian
                  </span>
                </div>
                
                {/* Metadata tambahan */}
                {(doc.instansi_penerbit || doc.tahun_terbit) && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                    {doc.instansi_penerbit && (
                      <span>🏛️ {doc.instansi_penerbit}</span>
                    )}
                    {doc.tahun_terbit && (
                      <span>📅 {doc.tahun_terbit}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(doc.document_type)}`}>
                  {getDocumentTypeLabel(doc.document_type)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                  {doc.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {getStatusLabel(doc.status)}
                </span>
              </div>
            </div>

            {showPreview && doc.preview && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-600 line-clamp-3">{doc.preview}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Sumber: {doc.source}
              </span>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors">
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat Detail
                </button>
                <button 
                  onClick={() => handleDeleteDocument(doc.title)}
                  disabled={deletingDocument === doc.title}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Hapus dokumen"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deletingDocument === doc.title ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {maxItems && documents.length === maxItems && (
        <div className="mt-4 text-center">
          <a href="/policies" className="text-blue-600 hover:text-blue-800 text-sm">
            Lihat Semua Kebijakan →
          </a>
        </div>
      )}
    </div>
  );
}
