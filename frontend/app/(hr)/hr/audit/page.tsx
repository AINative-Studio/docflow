'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Download, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { ActivityLog } from '@/lib/supabase/types';

const eventIcons: Record<string, string> = {
  submitted: '📤',
  reviewed: '👁️',
  approved: '✅',
  rejected: '❌',
  resubmitted: '🔄',
  hold_applied: '🔒',
  hold_released: '🔓',
  notes_added: '📝',
};

export default function AuditPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, eventFilter, roleFilter]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    if (eventFilter !== 'all') {
      filtered = filtered.filter(a => a.event_type === eventFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(a => a.actor_role === roleFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.actor_name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      );
    }

    setFilteredActivities(filtered);
  };

  const handleExport = () => {
    alert('Export functionality would download audit logs as CSV or JSON');
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
            <Link href="/hr/employees">
              <Button variant="ghost">Employees</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Log</h1>
          <p className="text-slate-600">
            Complete activity history for compliance and tracking
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by actor or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hold_applied">Hold Applied</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="hr_admin">HR Admin</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse h-20 bg-slate-200 rounded" />
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No activities found
                </h3>
                <p className="text-slate-600">
                  {activities.length === 0
                    ? 'No activities have been recorded yet'
                    : 'Try adjusting your filters or search query'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-lg border">
                        {eventIcons[activity.event_type] || '📄'}
                      </div>
                      {index < filteredActivities.length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 my-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div>
                          <p className="font-medium text-slate-900">
                            {activity.description}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{activity.actor_name}</span>
                              <span className="text-slate-400">•</span>
                              <span className="capitalize">{activity.actor_role.replace('_', ' ')}</span>
                            </span>
                            <span className="text-slate-400">•</span>
                            <span>{new Date(activity.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          activity.event_type === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : activity.event_type === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : activity.event_type === 'submitted' || activity.event_type === 'resubmitted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {activity.event_type.replace('_', ' ')}
                        </span>
                      </div>
                      {activity.entity_type && (
                        <p className="text-xs text-slate-500 mt-1">
                          Entity: {activity.entity_type} • ID: {activity.entity_id?.substring(0, 8)}...
                        </p>
                      )}
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
