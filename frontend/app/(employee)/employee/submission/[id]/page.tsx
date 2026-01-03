'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft, FileIcon, CheckCircle, Clock, XCircle, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Document, ActivityLog } from '@/lib/supabase/types';

const statusConfig = {
  received: {
    color: 'bg-blue-100 text-blue-800',
    label: 'Received',
    icon: Clock,
  },
  in_review: {
    color: 'bg-yellow-100 text-yellow-800',
    label: 'In Review',
    icon: Clock,
  },
  approved: {
    color: 'bg-green-100 text-green-800',
    label: 'Approved',
    icon: CheckCircle,
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    label: 'Rejected',
    icon: XCircle,
  },
  expired: {
    color: 'bg-slate-100 text-slate-800',
    label: 'Expired',
    icon: XCircle,
  },
  on_hold: {
    color: 'bg-purple-100 text-purple-800',
    label: 'On Hold',
    icon: Clock,
  },
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (docError) throw docError;
      setDocument(docData);

      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_id', params.id)
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;
      setActivities(activityData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
          </div>
        </nav>
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="space-y-4">
            <div className="h-32 bg-white rounded-lg animate-pulse" />
            <div className="h-64 bg-white rounded-lg animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <FileIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Document not found
            </h3>
            <p className="text-slate-600 mb-6">
              This submission may have been removed or doesn't exist
            </p>
            <Link href="/employee/history">
              <Button>View All Submissions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[document.status].icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DocFlow HR</span>
          </Link>
          <Link href="/employee/history">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Submissions
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                <FileIcon className="h-8 w-8 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      {document.type || 'Document'}
                    </h1>
                    <p className="text-slate-600">{document.file_name}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 ${
                      statusConfig[document.status].color
                    }`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig[document.status].label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-600 mb-1">Submission ID</p>
                <p className="font-mono text-sm">{document.id.substring(0, 13)}...</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Submitted</p>
                <p className="text-sm font-medium">
                  {new Date(document.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Source</p>
                <p className="text-sm font-medium capitalize">{document.source}</p>
              </div>
              {document.file_size && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">File Size</p>
                  <p className="text-sm font-medium">
                    {(document.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {document.status === 'rejected' && document.notes && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <XCircle className="h-5 w-5" />
                Document Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-900 mb-4">{document.notes}</p>
              {document.reviewed_by && (
                <p className="text-sm text-red-800 mb-4">
                  Reviewed by {document.reviewed_by} on{' '}
                  {document.reviewed_at &&
                    new Date(document.reviewed_at).toLocaleString()}
                </p>
              )}
              <Link href="/employee/upload">
                <Button variant="destructive">
                  <Upload className="mr-2 h-4 w-4" />
                  Resubmit Document
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {document.status === 'approved' && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Document Approved</p>
                  {document.reviewed_by && (
                    <p className="text-sm text-green-800">
                      Reviewed by {document.reviewed_by}{' '}
                      {document.reviewed_at &&
                        `on ${new Date(document.reviewed_at).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-4">
                No activity recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-px h-full bg-slate-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.actor_name} • {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
