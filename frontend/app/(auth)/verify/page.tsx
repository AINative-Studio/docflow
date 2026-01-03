import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Mail, CheckCircle } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">DocFlow HR</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent you a magic link to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-600">
                  <p className="font-medium text-slate-900 mb-1">What's next?</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your inbox for an email from DocFlow HR</li>
                    <li>Click the magic link in the email</li>
                    <li>You'll be signed in automatically</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Didn't receive the email?
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  Resend Magic Link
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t">
              <Link href="/employee" className="block">
                <Button className="w-full">
                  Continue to Employee Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
