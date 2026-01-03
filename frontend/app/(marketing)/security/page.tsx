import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Lock, Eye, Server, FileCheck } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DocFlow HR</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Security First
          </h1>
          <p className="text-xl text-slate-600">
            Your employee documents contain sensitive personal information.
            We take security and compliance seriously.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          <div className="bg-white p-8 rounded-lg border">
            <Lock className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">End-to-End Encryption</h3>
            <p className="text-slate-600">
              All documents are encrypted in transit and at rest using AES-256 encryption,
              the same standard used by banks and government agencies.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border">
            <Eye className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Access Controls</h3>
            <p className="text-slate-600">
              Role-based permissions ensure employees can only see their own documents,
              while HR has controlled access to review and approve submissions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border">
            <Server className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Secure Infrastructure</h3>
            <p className="text-slate-600">
              Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA
              and regular security audits.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border">
            <FileCheck className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Compliance Ready</h3>
            <p className="text-slate-600">
              Built-in support for state-specific retention requirements including
              Florida, Texas, Arizona, North Carolina, and Tennessee.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border">
            <Shield className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Legal Holds</h3>
            <p className="text-slate-600">
              Protect documents from deletion during legal proceedings with
              comprehensive legal hold functionality.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border">
            <FileText className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Audit Trail</h3>
            <p className="text-slate-600">
              Complete activity logging of all document access, reviews, and status changes
              for full transparency and accountability.
            </p>
          </div>
        </div>

        <div className="bg-white p-12 rounded-lg border max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Questions about security?</h2>
          <p className="text-xl text-slate-600 mb-6">
            Our security team is here to help answer your questions and provide detailed documentation.
          </p>
          <Button size="lg">Contact Security Team</Button>
        </div>
      </main>
    </div>
  );
}
