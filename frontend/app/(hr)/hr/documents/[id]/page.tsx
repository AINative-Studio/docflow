'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, ArrowLeft, CheckCircle, XCircle, FileIcon, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { Document } from '@/lib/supabase/types';

export default function DocumentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<(Document & { employee?: any }) | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*, employee:employees(*)')
        .eq('id', params.id)
        .maybeSingle();

      if (docError) throw docError;
      setDocument(docData);
      setDocumentType(docData?.type || '');

      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_id', params.id)
        .order('created_at', { ascending: false });

      setActivities(activityData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!document) return;
    setProcessing(true);

    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'approved',
          reviewed_by: 'Sarah Chen',
          reviewed_at: new Date().toISOString(),
          type: documentType || document.type,
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      await supabase.from('activity_logs').insert({
        entity_type: 'document',
        entity_id: document.id,
        event_type: 'approved',
        actor_name: 'Sarah Chen',
        actor_role: 'hr_admin',
        description: 'Document approved',
      });

      toast({
        title: 'Document approved',
        description: 'The employee will be notified',
      });

      setShowApproveDialog(false);
      router.push('/hr/review-queue');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve document',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!document || !rejectNotes.trim()) {
      toast({
        title: 'Notes required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'rejected',
          reviewed_by: 'Sarah Chen',
          reviewed_at: new Date().toISOString(),
          notes: rejectNotes,
          type: documentType || document.type,
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      await supabase.from('activity_logs').insert({
        entity_type: 'document',
        entity_id: document.id,
        event_type: 'rejected',
        actor_name: 'Sarah Chen',
        actor_role: 'hr_admin',
        description: `Document rejected: ${rejectNotes}`,
      });

      toast({
        title: 'Document rejected',
        description: 'The employee will be notified to resubmit',
      });

      setShowRejectDialog(false);
      router.push('/hr/review-queue');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject document',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
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
        <main className="container mx-auto px-4 py-12">
          <div className="h-96 bg-white rounded-lg animate-pulse" />
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
            <h3 className="text-lg font-semibold mb-2">Document not found</h3>
            <Link href="/hr/review-queue">
              <Button>Back to Queue</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DocFlow HR</span>
          </Link>
          <Link href="/hr/review-queue">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Queue
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 rounded-lg p-12 text-center">
                  <FileIcon className="h-24 w-24 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">{document.file_name}</p>
                  <p className="text-sm text-slate-500">
                    {document.file_size && `${(document.file_size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                  <Button variant="outline" className="mt-4">
                    Download Document
                  </Button>
                </div>
              </CardContent>
            </Card>

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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="docType">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="docType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I-9">I-9</SelectItem>
                      <SelectItem value="W-4">W-4</SelectItem>
                      <SelectItem value="Direct Deposit">Direct Deposit</SelectItem>
                      <SelectItem value="Background Check">Background Check</SelectItem>
                      <SelectItem value="Benefits">Benefits</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-600">Submission ID</Label>
                  <p className="text-sm font-mono mt-1">{document.id.substring(0, 13)}...</p>
                </div>

                <div>
                  <Label className="text-slate-600">Status</Label>
                  <p className="text-sm mt-1 capitalize">{document.status.replace('_', ' ')}</p>
                </div>

                <div>
                  <Label className="text-slate-600">Source</Label>
                  <p className="text-sm mt-1 capitalize">{document.source}</p>
                </div>

                <div>
                  <Label className="text-slate-600">Submitted</Label>
                  <p className="text-sm mt-1">
                    {new Date(document.created_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-slate-600">Name</Label>
                  <p className="text-sm font-medium mt-1">{document.employee?.name}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Email</Label>
                  <p className="text-sm mt-1">{document.employee?.email}</p>
                </div>
                {document.employee?.department && (
                  <div>
                    <Label className="text-slate-600">Department</Label>
                    <p className="text-sm mt-1">{document.employee.department}</p>
                  </div>
                )}
                {document.employee?.state && (
                  <div>
                    <Label className="text-slate-600">State</Label>
                    <p className="text-sm mt-1">{document.employee.state}</p>
                  </div>
                )}
                <Link href={`/hr/employees/${document.employee_id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Employee Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {document.status !== 'approved' && document.status !== 'rejected' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Document
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Document
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Document</DialogTitle>
            <DialogDescription>
              Confirm that this document meets all requirements and should be approved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Employee <span className="font-medium">{document.employee?.name}</span> will be
              notified that their <span className="font-medium">{documentType || document.type}</span> has
              been approved.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. The employee will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectNotes">Rejection Reason *</Label>
            <Textarea
              id="rejectNotes"
              placeholder="e.g., Section 2 is incomplete. Please fill out the citizenship status..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectNotes.trim()}>
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
