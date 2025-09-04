"use client";

import { useState, useEffect } from 'react';
import PolicyList from '../../components/PolicyList';
import { FileText, Upload, Search, Filter, BarChart3, Calendar, Archive, Eye } from 'lucide-react';
import Link from 'next/link';

interface PolicyStats {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recent: number;
}

export default function PoliciesPage() {
  const [stats, setStats] = useState<PolicyStats>({
    total: 0,
    byCategory: {},
    byType: {},
    recent: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch policy statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/policies/documents');
        if (response.ok) {
          const data = await response.json();
          // Process stats from the documents
          const categoryStats: Record<string, number> = {};
          const typeStats: Record<string, number> = {};
          let recentCount = 0;
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

          data.documents?.forEach((doc: any) => {
            categoryStats[doc.category] = (categoryStats[doc.category] || 0) + 1;
            typeStats[doc.document_type] = (typeStats[doc.document_type] || 0) + 1;
            if (new Date(doc.created_at) > oneWeekAgo) {
              recentCount++;
            }
          });

          setStats({
            total: data.total || 0,
            byCategory: categoryStats,
            byType: typeStats,
            recent: recentCount
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const filters = [
    { value: 'all', label: 'Semua Kategori', count: stats.total },
    { value: 'legal', label: 'Hukum', count: stats.byCategory.legal || 0 },
    { value: 'hr', label: 'Kepegawaian', count: stats.byCategory.hr || 0 },
    { value: 'finance', label: 'Keuangan', count: stats.byCategory.finance || 0 },
    { value: 'operations', label: 'Operasional', count: stats.byCategory.operations || 0 },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Archive className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Repositori Kebijakan Terpusat</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Basis Data Kebijakan Digital
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-6">
              Koleksi lengkap peraturan, kebijakan, dan panduan operasional 
              yang tersimpan dalam sistem digital pemerintah Indonesia
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/upload"
                className="btn-primary bg-white text-green-600 hover:bg-gray-50 flex items-center justify-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                Unggah Dokumen Baru
              </Link>
              <Link
                href="/qa"
                className="btn-secondary border-white text-white hover:bg-white hover:text-green-600 flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Konsultasi Kebijakan
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total}</h3>
            <p className="text-gray-600 font-medium">Total Dokumen</p>
            <p className="text-sm text-gray-500 mt-1">Terakumulasi dalam sistem</p>
          </div>
          
          <div className="card text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.recent}</h3>
            <p className="text-gray-600 font-medium">Baru Ditambahkan</p>
            <p className="text-sm text-gray-500 mt-1">7 hari terakhir</p>
          </div>
          
          <div className="card text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{Object.keys(stats.byCategory).length}</h3>
            <p className="text-gray-600 font-medium">Kategori Aktif</p>
            <p className="text-sm text-gray-500 mt-1">Berbagai bidang</p>
          </div>
          
          <div className="card text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
            <p className="text-gray-600 font-medium">Dapat Dicari</p>
            <p className="text-sm text-gray-500 mt-1">Sistem terintegrasi</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">Pencarian & Filter Dokumen</h2>
            <p className="card-subtitle">Temukan dokumen kebijakan dengan mudah</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="input-label">
                Cari Dokumen
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari berdasarkan judul, konten, atau nomor peraturan..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            
            {/* Filter Dropdown */}
            <div>
              <label htmlFor="filter" className="input-label">
                Filter Kategori
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  id="filter"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="input-field pl-10"
                >
                  {filters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label} ({filter.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Category Quick Stats */}
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="card-title">Distribusi per Kategori</h3>
            <p className="card-subtitle">Sebaran dokumen berdasarkan bidang</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div 
                key={category}
                className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 text-center hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedFilter(category)}
              >
                <div className="text-2xl font-bold text-blue-600 mb-1">{count}</div>
                <div className="text-sm font-medium text-gray-700 capitalize">{category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Policy List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daftar Dokumen Kebijakan</h3>
            <p className="card-subtitle">
              {selectedFilter === 'all' 
                ? `Menampilkan ${stats.total} dokumen` 
                : `Menampilkan kategori ${selectedFilter}`}
            </p>
          </div>
          
          <PolicyList 
            showPreview={true} 
            searchTerm={searchTerm}
            categoryFilter={selectedFilter === 'all' ? undefined : selectedFilter}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="card bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h3 className="text-2xl font-bold mb-4">Butuh Bantuan?</h3>
            <p className="text-blue-100 mb-6">
              Tim support siap membantu Anda mengelola dan mengoptimalkan penggunaan sistem kebijakan digital
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/qa" 
                className="btn-primary bg-white text-blue-600 hover:bg-gray-50"
              >
                Konsultasi Smart Assistant
              </Link>
              <button className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600">
                Hubungi Administrator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
