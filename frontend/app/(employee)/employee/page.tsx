'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Mail, Smartphone, Cloud, Shield, Clock, CheckCircle, HelpCircle } from 'lucide-react';

export default function EmployeeStartPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DocFlow HR</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/employee/history">
              <Button variant="ghost">My Submissions</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Submit Your Documents</h1>
          <p className="text-xl text-slate-600">
            Choose how you'd like to submit your employment documents
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/employee/upload">
            <Card className="hover:border-blue-600 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Drag and drop or browse files from your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Best for documents already on your computer or phone
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/employee?method=email">
            <Card className="hover:border-blue-600 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Email Documents</CardTitle>
                <CardDescription>
                  Forward documents to your unique email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Perfect if you receive documents via email
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/employee?method=sms">
            <Card className="hover:border-blue-600 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Text/SMS Upload</CardTitle>
                <CardDescription>
                  Take a photo and text it to us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Quick mobile submission using your phone's camera
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/employee?method=drive">
            <Card className="hover:border-blue-600 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <Cloud className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Import from Cloud</CardTitle>
                <CardDescription>
                  Connect Dropbox, Box, Drive, or OneDrive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Import documents stored in your cloud accounts
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <CardTitle className="text-lg">What documents can I submit?</CardTitle>
                  <CardDescription className="mt-2">
                    Common employment documents include:
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  I-9 Employment Eligibility
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  W-4 Tax Withholding
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Direct Deposit Forms
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Background Check Consent
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Benefits Enrollment
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Other HR Documents
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <CardTitle className="text-lg">What happens after I submit?</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>1. You'll receive an instant confirmation receipt</p>
              <p>2. HR will review your document (typically within 24 hours)</p>
              <p>3. You'll be notified when it's approved or if changes are needed</p>
              <p>4. Track the status anytime in "My Submissions"</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <CardTitle className="text-lg">Your documents are secure</CardTitle>
                  <CardDescription className="mt-2">
                    All documents are encrypted end-to-end and only visible to authorized HR personnel.
                    We take your privacy seriously.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
