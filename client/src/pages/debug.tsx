import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Debug() {
  const { toast } = useToast();
  
  const currentDomain = window.location.origin;
  const replicationDomain = currentDomain.replace('http://', 'https://');
  
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard",
    });
  };

  const hasAllSecrets = Object.values(firebaseConfig).every(value => value && value !== 'undefined');

  return (
    <div className="min-h-screen bg-phantom-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔧</span>
              <span>Firebase Authentication Debug</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Configuration Status */}
            <div>
              <h3 className="font-semibold mb-3">Configuration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${firebaseConfig.apiKey ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="font-medium">API Key</div>
                  <div className={firebaseConfig.apiKey ? 'text-green-600' : 'text-red-600'}>
                    {firebaseConfig.apiKey ? '✓ Configured' : '✗ Missing'}
                  </div>
                  {firebaseConfig.apiKey && (
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {firebaseConfig.apiKey.substring(0, 20)}...
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${firebaseConfig.projectId ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="font-medium">Project ID</div>
                  <div className={firebaseConfig.projectId ? 'text-green-600' : 'text-red-600'}>
                    {firebaseConfig.projectId ? '✓ Configured' : '✗ Missing'}
                  </div>
                  {firebaseConfig.projectId && (
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {firebaseConfig.projectId}
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${firebaseConfig.appId ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="font-medium">App ID</div>
                  <div className={firebaseConfig.appId ? 'text-green-600' : 'text-red-600'}>
                    {firebaseConfig.appId ? '✓ Configured' : '✗ Missing'}
                  </div>
                  {firebaseConfig.appId && (
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {firebaseConfig.appId.substring(0, 30)}...
                    </div>
                  )}
                </div>

                <div className={`p-3 rounded-lg ${firebaseConfig.authDomain ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="font-medium">Auth Domain</div>
                  <div className={firebaseConfig.authDomain ? 'text-green-600' : 'text-red-600'}>
                    {firebaseConfig.authDomain || 'Not configured'}
                  </div>
                  {firebaseConfig.authDomain && (
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {firebaseConfig.authDomain}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Domain Authorization */}
            <div>
              <h3 className="font-semibold mb-3">Domain Authorization</h3>
              <Alert>
                <AlertDescription>
                  Your current domain is: <code className="bg-phantom-gray-100 px-2 py-1 rounded">{currentDomain}</code>
                  <br />
                  This domain must be added to Firebase authorized domains for authentication to work.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-2">
                <Button
                  onClick={() => copyToClipboard(currentDomain)}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span>Copy Current Domain</span>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => copyToClipboard(replicationDomain)}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span>Copy HTTPS Domain</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Setup Instructions */}
            <div>
              <h3 className="font-semibold mb-3">Firebase Console Setup Steps</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-phantom-green pl-4">
                  <div className="font-medium">Step 1: Go to Firebase Console</div>
                  <div className="text-sm text-phantom-gray-600 mt-1">
                    Visit the Firebase Console and select your project
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                  >
                    Open Firebase Console <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                
                <div className="border-l-4 border-phantom-blue pl-4">
                  <div className="font-medium">Step 2: Enable Authentication</div>
                  <div className="text-sm text-phantom-gray-600 mt-1">
                    Go to Authentication → Sign-in method → Enable Google and Email/Password
                  </div>
                </div>
                
                <div className="border-l-4 border-phantom-orange pl-4">
                  <div className="font-medium">Step 3: Add Authorized Domains</div>
                  <div className="text-sm text-phantom-gray-600 mt-1">
                    Go to Authentication → Settings → Authorized domains → Add domain
                  </div>
                  <div className="text-xs text-phantom-gray-500 mt-1">
                    Add both HTTP and HTTPS versions of your domain
                  </div>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="font-medium">Step 4: Test Authentication</div>
                  <div className="text-sm text-phantom-gray-600 mt-1">
                    Return to the login page and try signing in
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-3">
              <Button onClick={() => window.location.href = '/login'} className="bg-phantom-green hover:bg-phantom-green/90">
                Back to Login
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Debug Info
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}