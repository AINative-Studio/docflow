'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Employee } from '@/lib/supabase/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<(Employee & { document_count?: number })[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<(Employee & { document_count?: number })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery]);

  const loadEmployees = async () => {
    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (empData) {
        const employeesWithCounts = await Promise.all(
          empData.map(async (emp) => {
            const { count } = await supabase
              .from('documents')
              .select('*', { count: 'exact', head: true })
              .eq('employee_id', emp.id);

            return { ...emp, document_count: count || 0 };
          })
        );

        setEmployees(employeesWithCounts);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchQuery) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
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
            <Link href="/hr/review-queue">
              <Button variant="ghost">Review Queue</Button>
            </Link>
            <Link href="/hr/audit">
              <Button variant="ghost">Audit Log</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Employees</h1>
          <p className="text-slate-600">View employee profiles and document history</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse h-16 bg-slate-200 rounded" />
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No employees found
                </h3>
                <p className="text-slate-600">
                  {employees.length === 0
                    ? 'No employees in the system yet'
                    : 'Try adjusting your search query'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell className="text-slate-600">{emp.email}</TableCell>
                        <TableCell className="text-slate-600">{emp.department || '—'}</TableCell>
                        <TableCell className="text-slate-600">{emp.state}</TableCell>
                        <TableCell className="text-slate-600">
                          {emp.document_count} document{emp.document_count !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            emp.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {emp.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/hr/employees/${emp.id}`}>
                            <Button size="sm" variant="outline">
                              View Profile
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
