'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, X, FileIcon, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

type Step = 1 | 2 | 3 | 4;

interface FileWithPreview extends File {
  preview?: string;
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>(1);
  const [documentType, setDocumentType] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [notes, setNotes] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;

      if (!isValidType) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a PDF or image file`,
          variant: 'destructive',
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit`,
          variant: 'destructive',
        });
        return false;
      }

      return true;
    });

    const filesWithPreview = validFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('email', 'john.doe@company.com')
        .maybeSingle();

      const employeeId = employeeData?.id || '11111111-1111-1111-1111-111111111111';

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          employee_id: employeeId,
          type: documentType || 'Other',
          status: 'received',
          source: 'upload',
          file_name: files[0]?.name || 'document.pdf',
          file_size: files[0]?.size || 0,
          notes: notes || null,
        })
        .select()
        .single();

      if (docError) throw docError;

      await supabase.from('activity_logs').insert({
        entity_type: 'document',
        entity_id: docData.id,
        event_type: 'submitted',
        actor_name: 'John Doe',
        actor_role: 'employee',
        description: 'Document submitted via upload',
      });

      setSubmissionId(docData.id);
      setStep(4);

      toast({
        title: 'Success!',
        description: 'Your document has been submitted',
      });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s === step
                ? 'bg-blue-600 text-white'
                : s < step
                ? 'bg-green-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {s < step ? <CheckCircle className="h-4 w-4" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`w-16 h-1 ${
                s < step ? 'bg-green-600' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DocFlow HR</span>
          </Link>
          <Link href="/employee">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {step !== 4 && (
          <>
            <h1 className="text-3xl font-bold text-center mb-2">Upload Document</h1>
            <p className="text-center text-slate-600 mb-8">
              {step === 1 && 'Select document type (optional)'}
              {step === 2 && 'Add your files'}
              {step === 3 && 'Review and submit'}
            </p>
            {renderStepIndicator()}
          </>
        )}

        {step === 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Type (Optional)</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I-9">I-9 Employment Eligibility</SelectItem>
                      <SelectItem value="W-4">W-4 Tax Withholding</SelectItem>
                      <SelectItem value="Direct Deposit">Direct Deposit Form</SelectItem>
                      <SelectItem value="Background Check">Background Check Consent</SelectItem>
                      <SelectItem value="Benefits">Benefits Enrollment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500">
                    Helps HR prioritize your submission
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href="/employee" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </Link>
                  <Button className="flex-1" onClick={() => setStep(2)}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-300 hover:border-blue-600'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">
                    Drag and drop files here
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    or click to browse from your device
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </Label>
                  <p className="text-xs text-slate-500 mt-4">
                    Supports PDF and image files up to 10MB each
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({files.length})</Label>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center">
                              <FileIcon className="h-6 w-6 text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep(3)}
                    disabled={files.length === 0}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Review Your Submission</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Document Type:</span>
                      <span className="font-medium">
                        {documentType || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Files:</span>
                      <span className="font-medium">{files.length} file(s)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes to HR (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional context or information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="text-blue-900">
                    By submitting, you confirm that the information provided is accurate
                    and you have the right to share these documents.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit}>
                    Submit Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Document Submitted!
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Your document has been received and is being reviewed
            </p>

            <Card className="max-w-md mx-auto mb-8">
              <CardContent className="pt-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Submission ID:</span>
                    <span className="font-mono font-medium">
                      {submissionId.substring(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Status:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Received
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Submitted:</span>
                    <span className="font-medium">
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Link href={`/employee/submission/${submissionId}`}>
                <Button size="lg" className="w-full max-w-md">
                  View Submission
                </Button>
              </Link>
              <Link href="/employee">
                <Button variant="outline" size="lg" className="w-full max-w-md">
                  Submit Another Document
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
