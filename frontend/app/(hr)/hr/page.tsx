'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface DashboardStats {
  needsReview: number;
  approved: number;
  rejected: number;
  onHold: number;
  total: number;
}

export default function HRDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    needsReview: 0,
    approved: 0,
    rejected: 0,
    onHold: 0,
    total: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: allDocs } = await supabase
        .from('documents')
        .select('*, employee:employees(name, email)');

      if (allDocs) {
        setStats({
          needsReview: allDocs.filter(d => d.status === 'received' || d.status === 'in_review').length,
          approved: allDocs.filter(d => d.status === 'approved').length,
          rejected: allDocs.filter(d => d.status === 'rejected').length,
          onHold: allDocs.filter(d => d.status === 'on_hold').length,
          total: allDocs.length,
        });

        const recent = allDocs
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentDocuments(recent);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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
            <Link href="/hr/review-queue">
              <Button variant="ghost">Review Queue</Button>
            </Link>
            <Link href="/hr/employees">
              <Button variant="ghost">Employees</Button>
            </Link>
            <Link href="/hr/audit">
              <Button variant="ghost">Audit Log</Button>
            </Link>
            <Link href="/settings/intake">
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HR Dashboard</h1>
          <p className="text-slate-600">Overview of document submissions and reviews</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-8 bg-slate-200 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/hr/review-queue?status=received,in_review">
              <Card className="hover:border-blue-600 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Needs Review</p>
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.needsReview}</p>
                  <p className="text-xs text-slate-500 mt-1">Awaiting action</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/hr/review-queue?status=approved">
              <Card className="hover:border-green-600 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Approved</p>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.approved}</p>
                  <p className="text-xs text-slate-500 mt-1">Total approved</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/hr/review-queue?status=rejected">
              <Card className="hover:border-red-600 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Rejected</p>
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.rejected}</p>
                  <p className="text-xs text-slate-500 mt-1">Needs resubmission</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/hr/review-queue?status=on_hold">
              <Card className="hover:border-purple-600 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">On Hold</p>
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.onHold}</p>
                  <p className="text-xs text-slate-500 mt-1">Legal holds active</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Submissions</CardTitle>
            <Link href="/hr/review-queue">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-4 py-3">
                    <div className="w-10 h-10 bg-slate-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No documents submitted yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentDocuments.map((doc) => (
                  <Link key={doc.id} href={`/hr/documents/${doc.id}`}>
                    <div className="py-4 hover:bg-slate-50 -mx-6 px-6 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 truncate">
                              {doc.type || 'Document'} - {doc.employee?.name}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {new Date(doc.created_at).toLocaleString()} • via {doc.source}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                            doc.status === 'received' || doc.status === 'in_review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : doc.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : doc.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {doc.status === 'in_review' ? 'In Review' :
                           doc.status === 'received' ? 'Received' :
                           doc.status === 'approved' ? 'Approved' :
                           doc.status === 'rejected' ? 'Rejected' :
                           doc.status === 'on_hold' ? 'On Hold' : doc.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
