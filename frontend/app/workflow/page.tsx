'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, FileText, Clock, CheckCircle, AlertCircle, 
  Settings, Plus, Edit, Trash2, Eye, Download,
  ArrowRight, Calendar, MessageSquare, Flag
} from 'lucide-react'

interface WorkflowItem {
  id: string
  title: string
  type: string
  status: 'draft' | 'review' | 'approved' | 'rejected'
  assignee: string
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  comments: number
  attachments: number
}

const workflowData: WorkflowItem[] = [
  {
    id: 'WF001',
    title: 'Peraturan Menteri Keuangan No. 142/PMK.03/2024',
    type: 'Peraturan Menteri',
    status: 'review',
    assignee: 'Dr. Siti Nurhaliza',
    dueDate: '2024-09-10',
    priority: 'high',
    comments: 3,
    attachments: 2
  },
  {
    id: 'WF002',
    title: 'Keputusan Direktur Jenderal Pajak tentang Reformasi Perpajakan',
    type: 'Keputusan Dirjen',
    status: 'draft',
    assignee: 'Ahmad Fauzi, S.H.',
    dueDate: '2024-09-15',
    priority: 'medium',
    comments: 1,
    attachments: 4
  },
  {
    id: 'WF003',
    title: 'Instruksi Presiden tentang Percepatan Transformasi Digital',
    type: 'Instruksi Presiden',
    status: 'approved',
    assignee: 'Prof. Dr. Maya Indira',
    dueDate: '2024-09-05',
    priority: 'urgent',
    comments: 8,
    attachments: 6
  },
  {
    id: 'WF004',
    title: 'Surat Edaran tentang Implementasi Sistem AI Policy Analyst',
    type: 'Surat Edaran',
    status: 'review',
    assignee: 'Ir. Budi Santoso',
    dueDate: '2024-09-12',
    priority: 'medium',
    comments: 5,
    attachments: 3
  }
]

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertCircle }
}

const priorityConfig = {
  low: { label: 'Rendah', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'Sedang', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Tinggi', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
}

export default function WorkflowManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')

  const filteredWorkflows = workflowData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusStats = () => {
    const stats = {
      draft: workflowData.filter(w => w.status === 'draft').length,
      review: workflowData.filter(w => w.status === 'review').length,
      approved: workflowData.filter(w => w.status === 'approved').length,
      rejected: workflowData.filter(w => w.status === 'rejected').length
    }
    return stats
  }

  const stats = getStatusStats()

  const WorkflowCard: React.FC<{ workflow: WorkflowItem }> = ({ workflow }) => {
    const StatusIcon = statusConfig[workflow.status].icon
    
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                {workflow.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {workflow.id}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {workflow.type}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={priorityConfig[workflow.priority].color}>
                <Flag className="h-3 w-3 mr-1" />
                {priorityConfig[workflow.priority].label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Status and Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4" />
                <Badge className={statusConfig[workflow.status].color}>
                  {statusConfig[workflow.status].label}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Due: {new Date(workflow.dueDate).toLocaleDateString('id-ID')}
              </div>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{workflow.assignee}</span>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{workflow.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{workflow.attachments}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              {workflow.status === 'draft' && (
                <Button size="sm" className="ml-auto">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Submit for Review
                </Button>
              )}
              {workflow.status === 'review' && (
                <>
                  <Button size="sm" className="ml-auto bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔄 Workflow Management AI Policy Analyst
            </h1>
            <p className="text-gray-600">
              Kelola dan pantau alur kerja persetujuan kebijakan secara efisien
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Buat Workflow Baru
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Pengaturan
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.review}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari berdasarkan judul atau assignee..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select 
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Semua Prioritas</option>
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkflows.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Tidak ada workflow ditemukan</p>
            <p className="text-sm">Coba ubah filter atau buat workflow baru</p>
          </div>
        </Card>
      )}

      {/* Quick Actions Panel */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-6 h-auto flex-col">
              <Calendar className="h-8 w-8 mb-2 text-blue-600" />
              <span className="font-medium">Schedule Review</span>
              <span className="text-sm text-gray-600">Atur jadwal review rutin</span>
            </Button>
            
            <Button variant="outline" className="p-6 h-auto flex-col">
              <Users className="h-8 w-8 mb-2 text-green-600" />
              <span className="font-medium">Assign Reviewers</span>
              <span className="text-sm text-gray-600">Tunjuk reviewer untuk workflow</span>
            </Button>
            
            <Button variant="outline" className="p-6 h-auto flex-col">
              <Download className="h-8 w-8 mb-2 text-purple-600" />
              <span className="font-medium">Bulk Export</span>
              <span className="text-sm text-gray-600">Export multiple documents</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
