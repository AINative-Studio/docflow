import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Check } from 'lucide-react';

export default function PricingPage() {
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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600">
            Choose the plan that fits your organization
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Perfect for small teams</CardDescription>
              <div className="text-4xl font-bold mt-4">
                $49<span className="text-lg text-slate-500">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Up to 50 employees</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>All submission methods</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Basic reporting</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full mt-6">Start Free Trial</Button>
            </CardContent>
          </Card>

          <Card className="border-blue-600 border-2">
            <CardHeader>
              <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-2">
                POPULAR
              </div>
              <CardTitle>Professional</CardTitle>
              <CardDescription>For growing organizations</CardDescription>
              <div className="text-4xl font-bold mt-4">
                $149<span className="text-lg text-slate-500">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Up to 200 employees</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>All submission methods</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Advanced reporting</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Legal holds & compliance</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full mt-6">Start Free Trial</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large organizations</CardDescription>
              <div className="text-4xl font-bold mt-4">
                Custom
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Unlimited employees</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Custom retention policies</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>SLA guarantee</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-6">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
