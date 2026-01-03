'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { LegalHold } from '@/lib/supabase/types';

export default function LegalHoldsPage() {
  const [holds, setHolds] = useState<LegalHold[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHolds();
  }, []);

  const loadHolds = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_holds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHolds(data || []);
    } catch (error) {
      console.error('Error loading holds:', error);
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
            <Link href="/hr">
              <Button variant="ghost">← Dashboard</Button>
            </Link>
            <Link href="/settings/intake">
              <Button variant="ghost">Settings</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Legal Holds</h1>
          <p className="text-slate-600">
            Protect documents from deletion during legal proceedings
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Legal Holds</CardTitle>
            <Link href="/settings/legal-holds/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Hold
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-16 bg-slate-200 rounded" />
                ))}
              </div>
            ) : holds.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No legal holds active
                </h3>
                <p className="text-slate-600 mb-6">
                  Create a legal hold to prevent documents from being deleted
                </p>
                <Link href="/settings/legal-holds/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Hold
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holds.map((hold) => (
                      <TableRow key={hold.id}>
                        <TableCell className="font-medium">{hold.title || hold.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            hold.status === 'active'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {hold.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600">{hold.created_by}</TableCell>
                        <TableCell className="text-slate-600">
                          {hold.employee_ids?.length ? `${hold.employee_ids.length} employees` :
                           hold.department ? hold.department :
                           hold.document_category ? hold.document_category : 'All'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(hold.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Details
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
      </main>
    </div>
  );
}
