'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, ArrowUpDown } from 'lucide-react';
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

export default function ReviewQueuePage() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<(Document & { employee?: any })[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<(Document & { employee?: any })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'employee' | 'type'>('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, searchQuery, statusFilter, typeFilter, sortBy]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*, employee:employees(id, name, email, department)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = [...documents];

    if (statusFilter !== 'all') {
      if (statusFilter.includes(',')) {
        const statuses = statusFilter.split(',');
        filtered = filtered.filter(doc => statuses.includes(doc.status));
      } else {
        filtered = filtered.filter(doc => doc.status === statusFilter);
      }
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.employee?.name.toLowerCase().includes(query) ||
        doc.employee?.email.toLowerCase().includes(query) ||
        doc.type?.toLowerCase().includes(query) ||
        doc.file_name?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'employee') {
        return (a.employee?.name || '').localeCompare(b.employee?.name || '');
      } else if (sortBy === 'type') {
        return (a.type || '').localeCompare(b.type || '');
      }
      return 0;
    });

    setFilteredDocs(filtered);
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
            <Link href="/hr">
              <Button variant="ghost">← Dashboard</Button>
            </Link>
            <Link href="/hr/employees">
              <Button variant="ghost">Employees</Button>
            </Link>
            <Link href="/hr/audit">
              <Button variant="ghost">Audit Log</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Review Queue</h1>
          <p className="text-slate-600">Review and manage document submissions</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by employee name, email, or document type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="received,in_review">Needs Review</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="I-9">I-9</SelectItem>
                    <SelectItem value="W-4">W-4</SelectItem>
                    <SelectItem value="Direct Deposit">Direct Deposit</SelectItem>
                    <SelectItem value="Background Check">Background Check</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => {
                  const next = sortBy === 'date' ? 'employee' : sortBy === 'employee' ? 'type' : 'date';
                  setSortBy(next);
                }}>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse flex gap-4 py-3">
                    <div className="flex-1 h-12 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No documents found
                </h3>
                <p className="text-slate-600">
                  {documents.length === 0
                    ? 'No documents have been submitted yet'
                    : 'Try adjusting your filters or search query'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map((doc) => (
                      <TableRow key={doc.id} className="cursor-pointer hover:bg-slate-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">
                              {doc.employee?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-slate-500">
                              {doc.employee?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{doc.type || 'Not specified'}</p>
                          <p className="text-sm text-slate-500 truncate max-w-xs">
                            {doc.file_name}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(doc.created_at).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-slate-500">
                            {new Date(doc.created_at).toLocaleTimeString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-sm">{doc.source}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              statusColors[doc.status]
                            }`}
                          >
                            {doc.status === 'in_review' ? 'In Review' :
                             doc.status === 'received' ? 'Received' :
                             doc.status === 'approved' ? 'Approved' :
                             doc.status === 'rejected' ? 'Rejected' :
                             doc.status === 'on_hold' ? 'On Hold' : doc.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/hr/documents/${doc.id}`}>
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
