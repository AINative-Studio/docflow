'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Upload, FileIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Document } from '@/lib/supabase/types';

const statusColors = {
  received: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-slate-100 text-slate-800',
  on_hold: 'bg-purple-100 text-purple-800',
};

const statusLabels = {
  received: 'Received',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
  on_hold: 'On Hold',
};

export default function HistoryPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, statusFilter]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('employee_id', '11111111-1111-1111-1111-111111111111')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DocFlow HR</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/employee">
              <Button variant="ghost">← Back</Button>
            </Link>
            <Link href="/employee/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Submit Document
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Submissions</h1>
          <p className="text-slate-600">
            View and track the status of your document submissions
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {documents.length === 0
                  ? 'No submissions yet'
                  : 'No matching documents'}
              </h3>
              <p className="text-slate-600 mb-6">
                {documents.length === 0
                  ? 'Get started by submitting your first document'
                  : 'Try adjusting your search or filters'}
              </p>
              {documents.length === 0 && (
                <Link href="/employee/upload">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Document
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Link key={doc.id} href={`/employee/submission/${doc.id}`}>
                <Card className="hover:border-blue-600 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                        <FileIcon className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {doc.type || 'Document'}
                            </h3>
                            <p className="text-sm text-slate-600 truncate">
                              {doc.file_name}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              statusColors[doc.status]
                            }`}
                          >
                            {statusLabels[doc.status]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span>
                            Submitted {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                          <span className="capitalize">via {doc.source}</span>
                          {doc.reviewed_at && (
                            <span>
                              Reviewed {new Date(doc.reviewed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
