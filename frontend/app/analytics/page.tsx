'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, Users, FileText, Clock, 
  Shield, Award, Target, Calendar, Database, Activity,
  CheckCircle, XCircle, AlertCircle, Download, Share2,
  Search, RefreshCw, Bell, Settings
} from 'lucide-react'

// Mock data for advanced analytics
const dashboardData = {
  totalPolicies: 156,
  activePolicies: 142,
  pendingReview: 14,
  compliance: 94.2,
  userActivity: [
    { name: 'Sen', views: 120, downloads: 45, uploads: 8 },
    { name: 'Sel', views: 98, downloads: 52, uploads: 12 },
    { name: 'Rab', views: 150, downloads: 38, uploads: 6 },
    { name: 'Kam', views: 180, downloads: 65, uploads: 15 },
    { name: 'Jum', views: 220, downloads: 78, uploads: 20 },
    { name: 'Sab', views: 95, downloads: 25, uploads: 4 },
    { name: 'Min', views: 85, downloads: 18, uploads: 2 }
  ],
  policyTrends: [
    { month: 'Jan', created: 12, updated: 8, archived: 2 },
    { month: 'Feb', created: 18, updated: 15, archived: 3 },
    { month: 'Mar', created: 22, updated: 12, archived: 1 },
    { month: 'Apr', created: 15, updated: 20, archived: 4 },
    { month: 'Mei', created: 25, updated: 18, archived: 2 },
    { month: 'Jun', created: 30, updated: 22, archived: 5 }
  ],
  categoryDistribution: [
    { name: 'Undang-Undang', value: 45 },
    { name: 'Peraturan Pemerintah', value: 38 },
    { name: 'Keputusan Menteri', value: 32 },
    { name: 'Instruksi Presiden', value: 25 },
    { name: 'Surat Edaran', value: 16 }
  ],
  recentActivities: [
    { id: 1, action: 'Upload dokumen', user: 'Admin Kemenkeu', time: '2 menit lalu', type: 'success' },
    { id: 2, action: 'Review kebijakan', user: 'Tim Legal', time: '15 menit lalu', type: 'warning' },
    { id: 3, action: 'Approve peraturan', user: 'Direktur', time: '1 jam lalu', type: 'success' },
    { id: 4, action: 'Query sistem', user: 'Staff Hukum', time: '2 jam lalu', type: 'info' },
    { id: 5, action: 'Backup data', user: 'System', time: '3 jam lalu', type: 'info' }
  ]
}

const COLORS = ['#1e40af', '#ffcc02', '#c53030', '#059669', '#7c3aed', '#dc2626']

// Separate components to avoid lint issues
const StatCard: React.FC<{
  title: string
  value: string | number
  icon: React.ComponentType<any>
  trend?: number
  color: string
  badge?: string
}> = ({ title, value, icon: Icon, trend, color, badge }) => (
  <Card className="relative overflow-hidden border-l-4" style={{ borderLeftColor: color }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className="flex items-center space-x-2">
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {trend && (
        <p className="text-xs text-gray-600 mt-1">
          <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          {' '}dari bulan lalu
        </p>
      )}
    </CardContent>
  </Card>
)

const ActivityIndicator: React.FC<{ type: string }> = ({ type }) => {
  const getConfig = (activityType: string) => {
    const configs = {
      success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      info: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
      error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' }
    }
    return configs[activityType as keyof typeof configs] || configs.info
  }

  const config = getConfig(type)
  const Icon = config.icon

  return (
    <div className={`p-2 rounded-full ${config.bg}`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
    </div>
  )
}

export default function AdvancedAnalytics() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Analytics Dashboard AI Policy Analyst
            </h1>
            <p className="text-gray-600">
              AI-Powered Policy Monitoring and Analysis System
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-100 text-green-800">
                🟢 Sistem Aktif
              </Badge>
              <Badge variant="outline">
                🔒 Keamanan Tinggi
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                ⚡ Performa Optimal
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari kebijakan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifikasi
            </Button>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Kebijakan"
          value={dashboardData.totalPolicies}
          icon={FileText}
          trend={12.5}
          color="#1e40af"
          badge="Aktif"
        />
        <StatCard
          title="Kebijakan Aktif"
          value={dashboardData.activePolicies}
          icon={CheckCircle}
          trend={8.2}
          color="#059669"
        />
        <StatCard
          title="Pending Review"
          value={dashboardData.pendingReview}
          icon={Clock}
          trend={-3.1}
          color="#f59e0b"
          badge="Urgent"
        />
        <StatCard
          title="Compliance Rate"
          value={`${dashboardData.compliance}%`}
          icon={Shield}
          trend={2.4}
          color="#10b981"
        />
      </div>

      {/* Professional Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Activity Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Aktivitas Pengguna (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.userActivity.map((day, index) => (
                <div key={day.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-900">{day.name}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>{day.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>{day.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>{day.uploads} uploads</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Distribusi Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.categoryDistribution.map((item, index) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <Progress 
                    value={(item.value / 45) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Trends and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Tren Kebijakan (6 Bulan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.policyTrends.map((month) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {month.created} dibuat
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        {month.updated} diperbarui
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                        {month.archived} diarsipkan
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div 
                      className="h-2 bg-blue-500 rounded" 
                      style={{ width: `${(month.created / 30) * 100}%` }}
                    />
                    <div 
                      className="h-2 bg-yellow-500 rounded" 
                      style={{ width: `${(month.updated / 30) * 100}%` }}
                    />
                    <div 
                      className="h-2 bg-red-500 rounded" 
                      style={{ width: `${(month.archived / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Aktivitas Terkini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <ActivityIndicator type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">oleh {activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Lihat Semua Aktivitas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Fitur Lanjutan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="collaboration" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="collaboration">Kolaborasi</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="automation">Otomasi</TabsTrigger>
              <TabsTrigger value="reports">Laporan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="collaboration" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tim Kolaborasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Reviewer Aktif</span>
                        <Badge>12 Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Dokumen Shared</span>
                        <Badge variant="secondary">28</Badge>
                      </div>
                      <Progress value={75} className="mt-2" />
                      <p className="text-sm text-gray-600">75% tugas review selesai</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Workflow Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Draft</span>
                        <Badge variant="outline">8</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Review</span>
                        <Badge className="bg-yellow-100 text-yellow-800">14</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Approved</span>
                        <Badge className="bg-green-100 text-green-800">142</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Response Time</span>
                        <span className="font-medium">1.2s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate</span>
                        <span className="font-medium">99.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>User Satisfaction</span>
                        <span className="font-medium">4.9/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Daily Queries</span>
                        <span className="font-medium">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Document Views</span>
                        <span className="font-medium">3,892</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Downloads</span>
                        <span className="font-medium">456</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Accuracy Score</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Model Confidence</span>
                        <span className="font-medium">87.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Learning Rate</span>
                        <span className="font-medium">+2.1%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="automation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Automated Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <Award className="h-4 w-4 mr-2" />
                        Auto-categorization
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Compliance Check
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Data Validation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scheduled Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Daily Backup</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Weekly Report</span>
                        <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Monthly Audit</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generate Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Policy Summary Report
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Monthly Analytics
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        User Activity Report
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Compliance Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Export as Excel
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
