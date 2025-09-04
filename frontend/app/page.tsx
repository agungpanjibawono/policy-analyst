"use client";

import { useState, useEffect } from 'react';
import { FileText, Search, Edit, BarChart3, Shield, Award, Clock } from 'lucide-react';
import { ClientUploadIcon } from '../components/ClientUploadIcon';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    totalQueries: 0,
    activeDrafts: 0,
    userSessions: 0
  });

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep default values if API fails
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: Search,
      title: "Konsultasi Kebijakan",
      description: "Sistem konsultasi untuk memperoleh informasi kebijakan yang akurat dan terkini",
      color: "from-blue-600 to-blue-700",
      stats: "Konsultasi Cerdas",
      link: "/qa"
    },
    {
      icon: Edit,
      title: "Document Collaboration",
      description: "Platform kolaborasi real-time untuk review, komentar, dan penyempurnaan dokumen",
      color: "from-emerald-600 to-emerald-700",
      stats: "Kolaborasi real-time",
      link: "/collaboration"
    },
    {
      icon: ClientUploadIcon,
      title: "Repositori Digital",
      description: "Sistem penyimpanan dan pengelolaan dokumen kebijakan yang terintegrasi",
      color: "from-orange-600 to-orange-700",
      stats: "Kapasitas unlimited",
      link: "/upload"
    },
    {
      icon: Shield,
      title: "Compliance & Security",
      description: "Sistem keamanan tingkat enterprise dengan compliance audit otomatis",
      color: "from-red-600 to-red-700",
      stats: "99.9% uptime",
      link: "/policies"
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section - Professional Government Style */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Sistem Manajemen Kebijakan
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent"> Digital</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              Platform terintegrasi untuk pengelolaan, konsultasi, dan penyusunan kebijakan pemerintah 
              yang efisien, transparan, dan berbasis teknologi modern terdepan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/qa" 
                className="btn-primary inline-flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Mulai Konsultasi
              </a>
              <a 
                href="/policies" 
                className="btn-secondary inline-flex items-center justify-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Jelajahi Kebijakan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="card text-center animate-slide-in">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalPolicies.toLocaleString()}</h3>
              <p className="text-gray-600 font-medium">Dokumen Kebijakan</p>
              <p className="text-sm text-gray-500 mt-1">Tersimpan dalam sistem</p>
            </div>
            <div className="card text-center animate-slide-in">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalQueries.toLocaleString()}</h3>
              <p className="text-gray-600 font-medium">Konsultasi Selesai</p>
              <p className="text-sm text-gray-500 mt-1">Dengan tingkat kepuasan 96%</p>
            </div>
            <div className="card text-center animate-slide-in">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.activeDrafts}</h3>
              <p className="text-gray-600 font-medium">Draft Peraturan</p>
              <p className="text-sm text-gray-500 mt-1">Sedang dalam proses</p>
            </div>
            <div className="card text-center animate-slide-in">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.userSessions}</h3>
              <p className="text-gray-600 font-medium">Pengguna Aktif</p>
              <p className="text-sm text-gray-500 mt-1">Instansi pemerintah</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Fitur Unggulan Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solusi komprehensif untuk kebutuhan manajemen kebijakan di era digital
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, featureIndex) => (
              <a 
                key={`feature-${featureIndex}`} 
                href={feature.link}
                className="card group hover:shadow-2xl cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <span className="badge badge-info text-xs">{feature.stats}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </p>
                    <div className="mt-3 flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                      <span className="text-sm font-medium">Explore →</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Keunggulan Sistem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mengapa institusi pemerintah mempercayai platform kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Keamanan Tingkat Tinggi</h3>
              <p className="text-gray-600 leading-relaxed">
                Sistem keamanan berlapis dengan enkripsi end-to-end dan compliance terhadap standar keamanan pemerintah Indonesia
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Efisiensi Maksimal</h3>
              <p className="text-gray-600 leading-relaxed">
                Mengurangi waktu pemrosesan kebijakan hingga 75% dengan automasi cerdas dan sistem terintegrasi
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Standar Internasional</h3>
              <p className="text-gray-600 leading-relaxed">
                Mengikuti best practices global dalam e-governance dengan adaptasi khusus untuk konteks hukum Indonesia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Siap Memulai Transformasi Digital?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Bergabunglah dengan puluhan instansi pemerintah yang telah merasakan manfaat 
            digitalisasi manajemen kebijakan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/qa" 
              className="btn-primary bg-white text-blue-600 hover:bg-gray-50"
            >
              <Search className="w-5 h-5 mr-2" />
              Mulai Konsultasi Gratis
            </a>
            <a 
              href="/upload" 
              className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600"
            >
              <ClientUploadIcon className="w-5 h-5 mr-2" />
              Upload Dokumen Pertama
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
