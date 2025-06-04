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
  Upload
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
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'current':
        return 'bg-purple-100 text-purple-800';
      case 'template':
        return 'bg-yellow-100 text-yellow-800';
      case 'reference':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-1">Access and manage your personal documents</p>
        </div>
        <Button className="flex items-center gap-2" variant="outline">
          <Upload className="h-4 w-4" />
          Request Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-xl font-semibold">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-xl font-semibold">{Object.keys(categoryNames).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Downloads</p>
                <p className="text-xl font-semibold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-semibold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="employment">Employment</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="benefits">Benefits</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="hr">HR Forms</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
            <SelectItem value="tax">Tax Documents</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="review">Reviews</SelectItem>
            <SelectItem value="certificate">Certificates</SelectItem>
            <SelectItem value="payslip">Pay Slips</SelectItem>
            <SelectItem value="form">Forms</SelectItem>
            <SelectItem value="policy">Policies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents by Category */}
      <div className="space-y-6">
        {Object.entries(documentsByCategory).map(([category, categoryDocs]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {categoryNames[category]} ({categoryDocs.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryDocs.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getDocumentTypeIcon(document.type)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium line-clamp-2">
                            {document.name}
                          </CardTitle>
                          <Badge className={getStatusColor(document.status)} variant="outline">
                            {document.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="line-clamp-2">{document.description}</p>
                      <div className="flex items-center justify-between">
                        <span>Size: {document.size}</span>
                        <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(document)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(document)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your filters to see more documents.'
                  : 'Your documents will appear here once they are uploaded.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Document View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedDocument && getDocumentTypeIcon(selectedDocument.type)}</span>
              {selectedDocument?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="capitalize">{selectedDocument.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="capitalize">{selectedDocument.category}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Size:</span>
                  <p>{selectedDocument.size}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Upload Date:</span>
                  <p>{new Date(selectedDocument.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700 text-sm">Description:</span>
                <p className="text-gray-600">{selectedDocument.description}</p>
              </div>
              <div className="flex justify-center p-8 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Document preview not available</p>
                  <Button onClick={() => handleDownload(selectedDocument)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDocuments;
