'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

export default function NewLegalHoldPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [scope, setScope] = useState('all');
  const [department, setDepartment] = useState('');
  const [docCategory, setDocCategory] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for this legal hold',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const holdData: any = {
        title: title.trim(),
        reason: reason.trim() || null,
        status: 'active',
        created_by: 'Sarah Chen',
      };

      if (scope === 'department' && department) {
        holdData.department = department;
      } else if (scope === 'category' && docCategory) {
        holdData.document_category = docCategory;
      }

      const { data, error } = await supabase
        .from('legal_holds')
        .insert(holdData)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activity_logs').insert({
        entity_type: 'hold',
        entity_id: data.id,
        event_type: 'hold_applied',
        actor_name: 'Sarah Chen',
        actor_role: 'hr_admin',
        description: `Legal hold created: ${title}`,
      });

      toast({
        title: 'Legal hold created',
        description: 'Documents matching this hold are now protected',
      });

      router.push('/settings/legal-holds');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create legal hold',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
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
          <Link href="/settings/legal-holds">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Legal Holds
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Legal Hold</h1>
          <p className="text-slate-600">
            Prevent documents from being deleted during legal proceedings
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Hold Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Smith v. Company Litigation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Brief description of why this hold is necessary..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger id="scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="department">Specific Department</SelectItem>
                    <SelectItem value="category">Document Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scope === 'department' && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scope === 'category' && (
                <div className="space-y-2">
                  <Label htmlFor="category">Document Category</Label>
                  <Select value={docCategory} onValueChange={setDocCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I-9">I-9</SelectItem>
                      <SelectItem value="W-4">W-4</SelectItem>
                      <SelectItem value="Direct Deposit">Direct Deposit</SelectItem>
                      <SelectItem value="Background Check">Background Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="text-blue-900 font-medium mb-1">
                  Important: Legal Hold Effects
                </p>
                <ul className="text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Documents matching this hold cannot be deleted</li>
                  <li>Retention policies are overridden for held documents</li>
                  <li>All affected documents will show "On Hold" status</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/settings/legal-holds" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Legal Hold'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
