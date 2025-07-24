import React from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import DocumentUpload from '@/components/DocumentUpload';
import MultiFileUpload from '@/components/MultiFileUpload';
import DocumentList from '@/components/DocumentList';
import DocumentAuditLog from '@/components/DocumentAuditLog';
import SecurityDashboard from '@/components/SecurityDashboard';

const Documents = () => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Document Management</h1>
              <p className="text-muted-foreground">
                Securely upload, manage, and track your documents
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Security Dashboard */}
        <SecurityDashboard />
        
        {/* Document Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload and List */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Upload</TabsTrigger>
                <TabsTrigger value="multi">Multi Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <DocumentUpload />
              </TabsContent>
              <TabsContent value="multi">
                <MultiFileUpload />
              </TabsContent>
            </Tabs>
            <DocumentList />
          </div>

          {/* Right Column - Audit Log */}
          <div className="space-y-6">
            <DocumentAuditLog />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;