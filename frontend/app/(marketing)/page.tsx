import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Mail, Smartphone, Cloud, Shield, Clock, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DocFlow HR</span>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link href="/security" className="text-slate-600 hover:text-slate-900">Security</Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/employee">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Employee Document Intake
            <br />
            <span className="text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Effortless document collection and HR review. Submit via upload, email, SMS, or cloud drive.
            Secure, compliant, and built for modern teams.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/employee">
              <Button size="lg" className="text-lg px-8">
                Submit Documents
              </Button>
            </Link>
            <Link href="/hr">
              <Button size="lg" variant="outline" className="text-lg px-8">
                HR Portal
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Submit Your Way</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Upload</h3>
                <p className="text-slate-600">Drag and drop files or browse from your device</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-slate-600">Forward documents to your unique email address</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">SMS</h3>
                <p className="text-slate-600">Text photos of documents from your phone</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Cloud</h3>
                <p className="text-slate-600">Import from Dropbox, Box, Drive, or OneDrive</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why DocFlow HR?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Secure & Compliant</h3>
                  <p className="text-slate-600">
                    Bank-level encryption with state-specific retention policies built in
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Fast Review</h3>
                  <p className="text-slate-600">
                    HR can approve or reject documents in under 15 seconds
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Complete Audit Trail</h3>
                  <p className="text-slate-600">
                    Every action tracked with timestamps for legal compliance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to streamline your HR workflow?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Start collecting documents today. No credit card required.
            </p>
            <Link href="/employee">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-slate-900">DocFlow HR</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
              <Link href="/security" className="hover:text-slate-900">Security</Link>
              <span>© 2024 DocFlow HR. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
