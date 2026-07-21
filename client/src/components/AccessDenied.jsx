import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

function AccessDenied() {
  return (
    <Layout title="Access Restricted">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-red-50">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <h2 className="font-display font-extrabold text-xl text-neutral-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Your account role doesn't have permission to view this page.
          </p>
          <Link
            to="/dashboard"
            className="inline-block text-white font-semibold px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: '#15803d' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default AccessDenied;