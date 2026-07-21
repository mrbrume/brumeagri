import { Sparkles } from 'lucide-react';
import Layout from './Layout';

function ComingSoon({ title, description }) {
  return (
    <Layout title={title}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: '#f0fdf4' }}
          >
            <Sparkles size={28} style={{ color: '#15803d' }} />
          </div>
          <h2 className="font-display font-extrabold text-xl text-neutral-900 mb-2">
            {title} — Coming Soon
          </h2>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
    </Layout>
  );
}

export default ComingSoon;