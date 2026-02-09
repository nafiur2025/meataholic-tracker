import { Beef, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FirebaseSetupMessage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-red-700 p-4 rounded-full">
              <Beef className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Meataholic Cost Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">
              Firebase Configuration Required
            </h3>
            <p className="text-sm text-amber-700 mb-4">
              This app requires Firebase for authentication and database. Please follow the setup instructions to configure your Firebase project.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Setup Steps:</h4>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>Create a Firebase project at <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">console.firebase.google.com</a></li>
              <li>Enable Email/Password and Google authentication</li>
              <li>Create a Firestore database</li>
              <li>Copy your Firebase configuration</li>
              <li>Add configuration to environment variables</li>
            </ol>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Required Environment Variables:</p>
            <code className="text-xs text-gray-700 block whitespace-pre">
              VITE_FIREBASE_API_KEY=your_api_key{'\n'}
              VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com{'\n'}
              VITE_FIREBASE_PROJECT_ID=your_project_id{'\n'}
              VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com{'\n'}
              VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id{'\n'}
              VITE_FIREBASE_APP_ID=your_app_id
            </code>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Firebase Console
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            See FIREBASE_SETUP.md for detailed instructions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
