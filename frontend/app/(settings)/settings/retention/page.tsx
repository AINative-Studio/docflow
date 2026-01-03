'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { RetentionPolicy } from '@/lib/supabase/types';

export default function RetentionPage() {
  const [selectedState, setSelectedState] = useState('FL');
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, [selectedState]);

  const loadPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('retention_policies')
        .select('*')
        .eq('state', selectedState)
        .order('document_type');

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDays = (days: number) => {
    const years = Math.floor(days / 365);
    return years > 0 ? `${years} year${years > 1 ? 's' : ''}` : `${days} days`;
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
            <Link href="/settings/intake">
              <Button variant="ghost">Settings</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Retention Policies</h1>
          <p className="text-slate-600">
            State-specific document retention requirements
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-slate-900 font-medium mb-1">About Retention Policies</p>
                <p className="text-slate-600">
                  DocFlow HR automatically applies retention requirements based on your state's
                  employment law. Documents are kept for the minimum required period and
                  can be extended if needed. Legal holds override these policies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Document Retention by State</CardTitle>
              <div className="flex items-center gap-3">
                <Label htmlFor="state" className="text-sm font-normal">
                  Select State:
                </Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger id="state" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse h-12 bg-slate-200 rounded" />
                ))}
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No policies configured
                </h3>
                <p className="text-slate-600">
                  Default retention policies for {selectedState} will be applied
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Retention Period</TableHead>
                      <TableHead>Override</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">
                          {policy.document_type}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{formatDays(policy.retention_period_days ?? policy.retention_days)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {policy.is_override ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Custom
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">Default</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" disabled>
                            Edit Policy
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Common Retention Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-slate-900 mb-1">I-9 Forms</p>
                <p className="text-slate-600">
                  3 years from hire date or 1 year after termination (whichever is later)
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">W-4 Forms</p>
                <p className="text-slate-600">
                  4 years from date tax becomes due
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">Background Checks</p>
                <p className="text-slate-600">
                  7 years (varies by state)
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">Direct Deposit</p>
                <p className="text-slate-600">
                  7 years from last payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
