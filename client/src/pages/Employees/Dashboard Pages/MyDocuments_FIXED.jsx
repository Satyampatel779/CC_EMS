import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  Eye,
  Filter,
  FolderOpen,
  Upload,
  File,
  FileCheck,
  Award,
  CreditCard,
  Briefcase,
  DollarSign
} from 'lucide-react';

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock documents data
  const mockDocuments = [
    {
      id: 1,
      name: 'Employment Contract',
      type: 'contract',
      category: 'employment',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      description: 'Official employment contract and terms',
      status: 'active',
      downloadUrl: '/documents/employment-contract.pdf'
    },
    {
      id: 2,
      name: 'Tax Declaration 2023',
      type: 'tax',
      category: 'financial',
      size: '856 KB',
      uploadDate: '2024-03-10',
      description: 'Annual tax declaration form',
      status: 'completed',
      downloadUrl: '/documents/tax-declaration-2023.pdf'
    },
    {
      id: 3,
      name: 'Health Insurance Card',
      type: 'insurance',
      category: 'benefits',
      size: '1.2 MB',
      uploadDate: '2024-01-20',
      description: 'Health insurance membership card and details',
      status: 'active',
      downloadUrl: '/documents/health-insurance.pdf'
    },
    {
      id: 4,
      name: 'Performance Review Q4 2023',
      type: 'review',
      category: 'performance',
      size: '3.1 MB',
      uploadDate: '2024-01-05',
      description: 'Quarterly performance evaluation and feedback',
      status: 'completed',
      downloadUrl: '/documents/performance-review-q4-2023.pdf'
    },
    {
      id: 5,
      name: 'Training Certificate - React Advanced',
      type: 'certificate',
      category: 'training',
      size: '1.8 MB',
      uploadDate: '2024-02-14',
      description: 'Certificate of completion for React Advanced course',
      status: 'completed',
      downloadUrl: '/documents/react-advanced-certificate.pdf'
    },
    {
      id: 6,
      name: 'Salary Slip - June 2024',
      type: 'payslip',
      category: 'financial',
      size: '456 KB',
      uploadDate: '2024-06-01',
      description: 'Monthly salary slip and deductions breakdown',
      status: 'current',
      downloadUrl: '/documents/salary-slip-june-2024.pdf'
    },
    {
      id: 7,
      name: 'Leave Application Form',
      type: 'form',
      category: 'hr',
      size: '234 KB',
      uploadDate: '2024-05-15',
      description: 'Template for leave application submissions',
      status: 'template',
      downloadUrl: '/documents/leave-application-form.pdf'
    },
    {
      id: 8,
      name: 'Company Policy Handbook',
      type: 'policy',
      category: 'company',
      size: '5.7 MB',
      uploadDate: '2024-01-01',
      description: 'Complete company policies and procedures handbook',
      status: 'reference',
      downloadUrl: '/documents/company-policy-handbook.pdf'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'contract':
        return '📄';
      case 'tax':
        return '🧾';
      case 'insurance':
        return '🏥';
      case 'review':
        return '📊';
      case 'certificate':
        return '🏆';
      case 'payslip':
        return '💰';
      case 'form':
        return '📝';
      case 'policy':
        return '📋';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'current':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'template':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'reference':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleDownload = (document) => {
    // In a real application, this would trigger a download
    console.log('Downloading document:', document.name);
    // You can implement actual download logic here
  };

  const handleView = (document) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || document.type === filterType;
    const matchesCategory = filterCategory === 'all' || document.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {});

  const categoryNames = {
    employment: 'Employment Documents',
    financial: 'Financial Documents',
    benefits: 'Benefits & Insurance',
    performance: 'Performance Reviews',
    training: 'Training & Certificates',
    hr: 'HR Forms & Templates',
    company: 'Company Documents'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-white text-lg font-medium">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <FolderOpen className="w-10 h-10 text-purple-400" />
            My Documents
          </h1>
          <p className="text-gray-300 text-lg mt-2">Access and manage your personal documents</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Request Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Documents</p>
              <p className="text-3xl font-bold text-white">{documents.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-300 text-sm font-medium">Categories</p>
              <p className="text-3xl font-bold text-white">{Object.keys(categoryNames).length}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <FolderOpen className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-300 text-sm font-medium">Recent Downloads</p>
              <p className="text-3xl font-bold text-white">3</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Download className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-300 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-white">2</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Calendar className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="pl-10 w-48 bg-white/5 border-white/20 text-white rounded-xl focus:border-purple-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-white/20 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="tax">Tax Documents</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="review">Reviews</SelectItem>
                <SelectItem value="certificate">Certificates</SelectItem>
                <SelectItem value="payslip">Pay Slips</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="pl-10 w-48 bg-white/5 border-white/20 text-white rounded-xl focus:border-purple-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-white/20 text-white">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="employment">Employment</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="benefits">Benefits</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-8">
        {Object.keys(documentsByCategory).length > 0 ? (
          Object.entries(documentsByCategory).map(([category, docs]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-purple-400" />
                {categoryNames[category] || category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docs.map((document) => (
                  <div key={document.id} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{getDocumentTypeIcon(document.type)}</div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{document.name}</h3>
                          <p className="text-gray-300 text-sm">{document.size}</p>
                        </div>
                      </div>
                      <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                        {document.status}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{document.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(document.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleView(document)}
                        className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl py-2 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        onClick={() => handleDownload(document)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl py-2 text-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl text-center">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No documents found</h3>
            <p className="text-gray-300 text-lg">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters to see more documents.'
                : 'Your documents will appear here once they are uploaded.'}
            </p>
          </div>
        )}
      </div>

      {/* Document View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="backdrop-blur-lg bg-gray-900/90 border border-white/20 rounded-3xl max-w-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              Document Preview
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{getDocumentTypeIcon(selectedDocument.type)}</div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedDocument.name}</h3>
                  <p className="text-gray-300">{selectedDocument.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm">File Size</p>
                  <p className="text-white font-medium">{selectedDocument.size}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm">Upload Date</p>
                  <p className="text-white font-medium">{new Date(selectedDocument.uploadDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm">Type</p>
                  <p className="text-white font-medium">{selectedDocument.type}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm">Status</p>
                  <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDocument.status)}`}>
                    {selectedDocument.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleDownload(selectedDocument)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-6 py-3 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Document
                </Button>
                <Button 
                  onClick={() => setIsViewDialogOpen(false)}
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl px-6 py-3"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDocuments;
