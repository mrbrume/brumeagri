import { Link } from 'react-router-dom';
import { Mail, Clock } from 'lucide-react';

function Contact() {
  return (
    <div style={{ backgroundColor: '#FAFAF7' }} className="min-h-screen">
      <div className="flex items-center justify-between px-8 py-6 max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="BrumeAgri" className="w-9 h-9 rounded-lg" />
          <span className="font-display font-extrabold text-lg text-neutral-900">
            Brume<span style={{ color: '#15803d' }}>Agri</span>
          </span>
        </Link>
        <Link to="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">← Back home</Link>
      </div>

      <div className="max-w-2xl mx-auto px-8 pb-20 pt-4">
        <h1 className="font-display font-extrabold text-3xl text-neutral-900 mb-3">Contact Us</h1>
        <p className="text-neutral-500 mb-10">Questions, feedback, or support requests — we'd love to hear from you.</p>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0fdf4' }}>
              <Mail size={18} style={{ color: '#15803d' }} />
            </div>
            <div>
              <p className="font-display font-bold text-neutral-900 mb-1">Support</p>
              <p className="text-sm text-neutral-500 mb-1">For account help, bugs, or technical issues:</p>
              <a href="mailto:support@brumeagri.com" className="text-sm font-semibold" style={{ color: '#15803d' }}>
                support@brumeagri.com
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0fdf4' }}>
              <Mail size={18} style={{ color: '#15803d' }} />
            </div>
            <div>
              <p className="font-display font-bold text-neutral-900 mb-1">Business Inquiries</p>
              <p className="text-sm text-neutral-500 mb-1">For partnerships or business-related questions:</p>
              <a href="mailto:hello@brumeagri.com" className="text-sm font-semibold" style={{ color: '#15803d' }}>
                hello@brumeagri.com
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0fdf4' }}>
              <Clock size={18} style={{ color: '#15803d' }} />
            </div>
            <div>
              <p className="font-display font-bold text-neutral-900 mb-1">Response Time</p>
              <p className="text-sm text-neutral-500">We aim to respond to all inquiries within 1–2 business days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;