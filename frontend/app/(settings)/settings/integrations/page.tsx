'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, XCircle, Cloud, Building } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: 'hris' | 'cloud';
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
}

export default function IntegrationsPage() {
  const [integrations] = useState<Integration[]>([
    {
      id: 'adp',
      name: 'ADP',
      category: 'hris',
      description: 'Sync employee data from ADP Workforce Now',
      icon: '🏢',
      connected: false,
    },
    {
      id: 'gusto',
      name: 'Gusto',
      category: 'hris',
      description: 'Import employee information from Gusto',
      icon: '💼',
      connected: false,
    },
    {
      id: 'workday',
      name: 'Workday',
      category: 'hris',
      description: 'Connect with Workday HCM',
      icon: '🏛️',
      connected: false,
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      category: 'cloud',
      description: 'Allow employees to import documents from Dropbox',
      icon: '📦',
      connected: false,
    },
    {
      id: 'box',
      name: 'Box',
      category: 'cloud',
      description: 'Enable document import from Box',
      icon: '📁',
      connected: false,
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      category: 'cloud',
      description: 'Import files from Google Drive',
      icon: '☁️',
      connected: false,
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      category: 'cloud',
      description: 'Connect with Microsoft OneDrive',
      icon: '☁️',
      connected: false,
    },
  ]);

  const handleConnect = (id: string) => {
    alert(`Connect to ${id} - In a real app, this would trigger OAuth flow`);
  };

  const hrisIntegrations = integrations.filter(i => i.category === 'hris');
  const cloudIntegrations = integrations.filter(i => i.category === 'cloud');

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

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Integrations</h1>
          <p className="text-slate-600">
            Connect DocFlow HR with your existing tools and services
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">HRIS Platforms</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hrisIntegrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-3xl">{integration.icon}</div>
                      {integration.connected ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Not connected</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {integration.connected ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500">
                          Last sync: {integration.lastSync || 'Never'}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Sync Now
                          </Button>
                          <Button size="sm" variant="ghost" className="flex-1">
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleConnect(integration.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">Cloud Storage</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cloudIntegrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-3xl">{integration.icon}</div>
                      {integration.connected ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Not connected</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {integration.connected ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Settings
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1">
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleConnect(integration.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
