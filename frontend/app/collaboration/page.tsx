'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, MessageSquare, Clock, CheckCircle, AlertCircle, 
  Eye, Edit, Share2, Download, Plus, Send, File, Calendar
} from 'lucide-react'

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  type: 'suggestion' | 'question' | 'approval' | 'concern'
  resolved: boolean
}

interface Collaborator {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'away'
  lastActive: string
}

const documentData = {
  id: 'DOC001',
  title: 'Peraturan Menteri Keuangan No. 142/PMK.03/2024',
  type: 'Peraturan Menteri',
  status: 'review',
  version: '2.1',
  lastModified: '2024-09-04 14:30',
  collaborators: [
    { id: '1', name: 'Dr. Siti Nurhaliza', role: 'Lead Reviewer', status: 'online', lastActive: '2 menit lalu' },
    { id: '2', name: 'Ahmad Fauzi, S.H.', role: 'Legal Expert', status: 'online', lastActive: '5 menit lalu' },
    { id: '3', name: 'Prof. Dr. Maya Indira', role: 'Senior Advisor', status: 'away', lastActive: '1 jam lalu' },
    { id: '4', name: 'Ir. Budi Santoso', role: 'Technical Review', status: 'offline', lastActive: '3 jam lalu' }
  ] as Collaborator[],
  comments: [
    {
      id: '1',
      author: 'Dr. Siti Nurhaliza',
      content: 'Pasal 3 ayat (2) perlu diperjelas mengenai batasan waktu implementasi. Saya sarankan menambahkan klausul "dalam jangka waktu paling lambat 90 hari."',
      timestamp: '2024-09-04 13:45',
      type: 'suggestion',
      resolved: false
    },
    {
      id: '2',
      author: 'Ahmad Fauzi, S.H.',
      content: 'Setuju dengan saran Dr. Siti. Selain itu, definisi "instansi terkait" di Pasal 1 masih terlalu umum dan perlu spesifikasi lebih lanjut.',
      timestamp: '2024-09-04 14:10',
      type: 'question',
      resolved: false
    },
    {
      id: '3',
      author: 'Prof. Dr. Maya Indira',
      content: 'Draft sudah sangat baik secara struktur. Hanya perlu penyesuaian minor pada referensi peraturan dasar di bagian "Menimbang".',
      timestamp: '2024-09-04 11:20',
      type: 'approval',
      resolved: true
    }
  ] as Comment[]
}

const commentTypeConfig = {
  suggestion: { label: 'Saran', color: 'bg-blue-100 text-blue-800', icon: Edit },
  question: { label: 'Pertanyaan', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  approval: { label: 'Persetujuan', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  concern: { label: 'Kekhawatiran', color: 'bg-red-100 text-red-800', icon: AlertCircle }
}

const statusConfig = {
  online: { label: 'Online', color: 'bg-green-500', textColor: 'text-green-700' },
  offline: { label: 'Offline', color: 'bg-gray-400', textColor: 'text-gray-700' },
  away: { label: 'Away', color: 'bg-yellow-500', textColor: 'text-yellow-700' }
}

export default function DocumentCollaboration() {
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'suggestion' | 'question' | 'approval' | 'concern'>('suggestion')
  const [showComments, setShowComments] = useState(true)

  const addComment = () => {
    if (newComment.trim()) {
      // In real app, this would call an API
      console.log('Adding comment:', { content: newComment, type: commentType })
      setNewComment('')
    }
  }

  const resolveComment = (commentId: string) => {
    console.log('Resolving comment:', commentId)
  }

  const CollaboratorItem: React.FC<{ collaborator: Collaborator }> = ({ collaborator }) => {
    const statusInfo = statusConfig[collaborator.status]
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {collaborator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusInfo.color} rounded-full border-2 border-white`}></div>
          </div>
          <div>
            <p className="font-medium text-gray-900">{collaborator.name}</p>
            <p className="text-sm text-gray-600">{collaborator.role}</p>
            <p className="text-xs text-gray-500">{collaborator.lastActive}</p>
          </div>
        </div>
        <Badge className={`${statusInfo.textColor} bg-transparent border-0 text-xs`}>
          {statusInfo.label}
        </Badge>
      </div>
    )
  }

  const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
    const TypeIcon = commentTypeConfig[comment.type].icon
    
    return (
      <div className={`p-4 rounded-lg border-l-4 ${comment.resolved ? 'bg-gray-50 opacity-75' : 'bg-white'} ${comment.resolved ? 'border-l-gray-300' : 'border-l-blue-500'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {comment.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{comment.author}</p>
              <p className="text-xs text-gray-500">{comment.timestamp}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={commentTypeConfig[comment.type].color}>
              <TypeIcon className="h-3 w-3 mr-1" />
              {commentTypeConfig[comment.type].label}
            </Badge>
            {comment.resolved && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-3">{comment.content}</p>
        
        {!comment.resolved && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => resolveComment(comment.id)}
              className="text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Tandai Selesai
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Balas
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🤝 Document Collaboration
            </h1>
            <p className="text-gray-600">
              Kolaborasi real-time untuk review dan penyempurnaan dokumen
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Document
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Info & Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Document Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{documentData.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{documentData.id}</Badge>
                    <Badge variant="secondary">{documentData.type}</Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {documentData.status}
                    </Badge>
                    <Badge variant="outline">v{documentData.version}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Terakhir dimodifikasi: {documentData.lastModified}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Document Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5 text-blue-600" />
                Document Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 min-h-[400px]">
                <div className="text-center text-gray-600">
                  <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Document Content</p>
                  <p className="text-sm">
                    Preview dokumen akan ditampilkan di sini dengan highlights untuk komentar dan saran
                  </p>
                  <Button className="mt-4" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Open Full Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Comments & Discussions ({documentData.comments.length})
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  {showComments ? 'Hide' : 'Show'} Comments
                </Button>
              </div>
            </CardHeader>
            
            {showComments && (
              <CardContent>
                <div className="space-y-4 mb-6">
                  {documentData.comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>

                {/* Add New Comment */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Add Comment</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select 
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="suggestion">Saran</option>
                        <option value="question">Pertanyaan</option>
                        <option value="approval">Persetujuan</option>
                        <option value="concern">Kekhawatiran</option>
                      </select>
                    </div>
                    <Textarea
                      placeholder="Tambahkan komentar atau saran..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setNewComment('')}>
                        Cancel
                      </Button>
                      <Button onClick={addComment} disabled={!newComment.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Collaborators ({documentData.collaborators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentData.collaborators.map((collaborator) => (
                  <CollaboratorItem key={collaborator.id} collaborator={collaborator} />
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Invite Collaborator
              </Button>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Dr. Siti added a comment</p>
                    <p className="text-xs text-gray-600">2 menit lalu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Ahmad approved section 3</p>
                    <p className="text-xs text-gray-600">15 menit lalu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Version 2.1 created</p>
                    <p className="text-xs text-gray-600">1 jam lalu</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Review
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Comments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
