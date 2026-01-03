'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileText, Upload, Mail, Smartphone, Cloud, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function IntakeSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    upload: true,
    email: true,
    sms: true,
    dropbox: false,
    box: false,
    googleDrive: true,
    onedrive: false,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Intake channel settings have been updated',
    });
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
            <Link href="/settings/integrations">
              <Button variant="ghost">Integrations</Button>
            </Link>
            <Link href="/settings/retention">
              <Button variant="ghost">Retention</Button>
            </Link>
            <Link href="/settings/legal-holds">
              <Button variant="ghost">Legal Holds</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Intake Settings</h1>
          <p className="text-slate-600">
            Configure which document submission methods are available to employees
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle>Direct Upload</CardTitle>
                  <CardDescription>
                    Allow employees to upload files from their device
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    Standard file upload with drag-and-drop support
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, images • Max 10MB per file
                  </p>
                </div>
                <Switch
                  checked={settings.upload}
                  onCheckedChange={() => handleToggle('upload')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle>Email Intake</CardTitle>
                  <CardDescription>
                    Allow employees to submit documents via email
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    Each employee gets a unique email address for submissions
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Format: employee.12345@docs.yourcompany.com
                  </p>
                </div>
                <Switch
                  checked={settings.email}
                  onCheckedChange={() => handleToggle('email')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>SMS/MMS Upload</CardTitle>
                  <CardDescription>
                    Allow employees to text documents from their phone
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    Employees can text photos of documents to a dedicated number
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Requires phone verification for security
                  </p>
                </div>
                <Switch
                  checked={settings.sms}
                  onCheckedChange={() => handleToggle('sms')}
                />
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Cloud Storage Providers</h2>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Dropbox</p>
                      <p className="text-sm text-slate-600">
                        Import documents stored in Dropbox
                      </p>
                    </div>
                    <Switch
                      checked={settings.dropbox}
                      onCheckedChange={() => handleToggle('dropbox')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Box</p>
                      <p className="text-sm text-slate-600">
                        Import documents from Box storage
                      </p>
                    </div>
                    <Switch
                      checked={settings.box}
                      onCheckedChange={() => handleToggle('box')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Google Drive</p>
                      <p className="text-sm text-slate-600">
                        Import files from Google Drive
                      </p>
                    </div>
                    <Switch
                      checked={settings.googleDrive}
                      onCheckedChange={() => handleToggle('googleDrive')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Microsoft OneDrive</p>
                      <p className="text-sm text-slate-600">
                        Connect with OneDrive for Business
                      </p>
                    </div>
                    <Switch
                      checked={settings.onedrive}
                      onCheckedChange={() => handleToggle('onedrive')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>
              <Settings className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
