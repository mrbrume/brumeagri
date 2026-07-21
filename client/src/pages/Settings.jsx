import { useState } from 'react';
import { User, FileText, Shield, Lock, LogOut, Cookie, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { deleteMyAccount } from '../services/authService';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'terms', label: 'Terms & Conditions', icon: FileText },
  { key: 'privacy', label: 'Privacy Policy', icon: Shield },
  { key: 'cookies', label: 'Cookie Policy', icon: Cookie },
  { key: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
  { key: 'security', label: 'Data Security', icon: Lock },
];

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-display font-bold text-base text-neutral-900 mb-2">{title}</h3>
      <div className="text-sm text-neutral-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function ProfileTab({ user, logout }) {
  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to permanently delete your account? This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await deleteMyAccount();
      alert('Your account has been deleted.');
      logout();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: '#15803d' }}
        >
          {user?.name?.charAt(0) || '?'}
        </div>
        <div>
          <p className="font-display font-bold text-lg text-neutral-900">{user?.name}</p>
          <p className="text-sm text-neutral-500">{user?.email}</p>
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 capitalize"
            style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}
          >
            {user?.role}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 text-red-600 font-semibold text-sm px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 transition"
        >
          <LogOut size={16} /> Log Out
        </button>

        <button
          onClick={handleDeleteAccount}
          className="flex items-center justify-center gap-2 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#dc2626' }}
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}

function TermsTab() {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-5">Last Updated: July 2026</p>

      <Section title="1. Acceptance of Terms">
        <p>By creating an account or using BrumeAgri, you agree to these Terms and Conditions. If you do not agree, you should not use the platform.</p>
      </Section>

      <Section title="2. About BrumeAgri">
        <p>BrumeAgri is a web-based farm management platform designed to help farm owners, farm managers, and investors manage farm operations, inventory, crops, sales, expenses, workers, and reports.</p>
      </Section>

      <Section title="3. User Responsibilities">
        <p>Users agree to:</p>
        <BulletList items={[
          'Provide accurate information.',
          'Keep login credentials secure.',
          'Use the platform lawfully.',
          'Maintain accurate farm records.',
          "Respect the rights of other users.",
        ]} />
      </Section>

      <Section title="4. Prohibited Activities">
        <p>Users must not:</p>
        <BulletList items={[
          'Attempt unauthorized access.',
          'Upload malicious software.',
          'Interfere with platform operations.',
          'Use the platform for fraudulent activities.',
          "Share another user's account.",
        ]} />
      </Section>

      <Section title="5. Intellectual Property">
        <p>All software, branding, logos, and content remain the property of BrumeAgri unless otherwise stated.</p>
      </Section>

      <Section title="6. Account Suspension">
        <p>BrumeAgri reserves the right to suspend or terminate accounts that violate these Terms.</p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>BrumeAgri is a farm management tool and does not guarantee crop yields, business profits, or agricultural outcomes. Users are responsible for decisions made using the platform.</p>
      </Section>

      <Section title="8. Changes to Terms">
        <p>These Terms may be updated periodically. Continued use of the platform means acceptance of any updates.</p>
      </Section>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-5">Last Updated: July 2026</p>

      <Section title="Introduction">
        <p>BrumeAgri respects your privacy and is committed to protecting your personal information.</p>
      </Section>

      <Section title="Information We Collect">
        <p className="font-semibold text-neutral-800">Personal Information</p>
        <BulletList items={['Full name', 'Email address', 'Password (encrypted)', 'User role']} />
        <p className="font-semibold text-neutral-800 mt-3">Farm Information</p>
        <BulletList items={['Farm name', 'Farm location', 'Crops', 'Livestock', 'Inventory', 'Sales', 'Expenses', 'Workers']} />
        <p className="font-semibold text-neutral-800 mt-3">Technical Information</p>
        <BulletList items={['IP address', 'Browser type', 'Device information', 'Login timestamps']} />
      </Section>

      <Section title="How We Use Your Information">
        <p>We use your information to:</p>
        <BulletList items={[
          'Create and manage your account.',
          'Display your farm dashboard.',
          'Generate reports.',
          'Improve platform performance.',
          'Maintain system security.',
        ]} />
      </Section>

      <Section title="Data Sharing">
        <p>BrumeAgri does not sell user information. Information may only be shared:</p>
        <BulletList items={['When required by law.', 'With trusted service providers supporting the platform (such as hosting providers).']} />
      </Section>

      <Section title="Cookies">
        <p>BrumeAgri may use cookies to:</p>
        <BulletList items={['Keep users signed in.', 'Improve performance.', 'Remember preferences.']} />
      </Section>

      <Section title="User Rights">
        <p>Users may:</p>
        <BulletList items={[
          'Update their profile.',
          'Delete their account.',
          'Request a copy of their personal data.',
          'Contact support regarding privacy concerns.',
        ]} />
      </Section>
    </div>
  );
}

function CookiePolicyTab() {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-5">Last Updated: July 2026</p>

      <Section title="What Are Cookies">
        <p>Cookies are small text files stored on your device that help websites remember information about your visit.</p>
      </Section>

      <Section title="How BrumeAgri Uses Cookies">
        <p>BrumeAgri uses cookies to:</p>
        <BulletList items={[
          'Keep you signed in between visits.',
          'Remember your preferences (such as your active farm selection).',
          'Understand how the platform is used, to improve performance.',
        ]} />
      </Section>

      <Section title="Managing Cookies">
        <p>Most browsers let you control or delete cookies through their settings. Disabling cookies may affect your ability to stay signed in or use certain features of BrumeAgri.</p>
      </Section>

      <Section title="Third-Party Cookies">
        <p>BrumeAgri does not currently use third-party advertising or tracking cookies.</p>
      </Section>
    </div>
  );
}

function DisclaimerTab() {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-5">Last Updated: July 2026</p>

      <Section title="General Disclaimer">
        <p>BrumeAgri is a farm management and record-keeping tool. It is provided to help track operations, finances, and performance, but it does not provide agricultural, financial, or investment advice.</p>
      </Section>

      <Section title="No Guarantee of Outcomes">
        <p>BrumeAgri does not guarantee crop yields, business profits, weather accuracy, or any other agricultural or financial outcome. Weather data is sourced from a third-party provider and may not always be accurate.</p>
      </Section>

      <Section title="User Responsibility">
        <p>Decisions about farm operations, investments, and finances remain the sole responsibility of the user. BrumeAgri is a tool to support decision-making, not a substitute for professional judgment.</p>
      </Section>

      <Section title="Third-Party Services">
        <p>BrumeAgri integrates with third-party services (such as weather data providers). BrumeAgri is not responsible for the accuracy or availability of these external services.</p>
      </Section>
    </div>
  );
}

function SecurityTab() {
  return (
    <div>
      <Section title="Password Protection">
        <p>Passwords are encrypted using industry-standard hashing algorithms (such as bcrypt) and are never stored in plain text.</p>
      </Section>

      <Section title="Secure Authentication">
        <p>Authentication is protected using JSON Web Tokens (JWT), ensuring only authorized users can access their accounts.</p>
      </Section>

      <Section title="Encrypted Connections">
        <p>All communication between users and BrumeAgri should occur over HTTPS to protect data during transmission.</p>
      </Section>

      <Section title="Database Security">
        <p>Farm data is securely stored in MongoDB Atlas, which provides encryption, access controls, and regular backups.</p>
      </Section>

      <Section title="Access Control">
        <p>Users can only access information permitted by their assigned role:</p>
        <BulletList items={['Farm Owner / Investor', 'Farm Manager', 'Administrator']} />
      </Section>

      <Section title="Data Backups">
        <p>Regular backups help protect against accidental data loss.</p>
      </Section>

      <Section title="Monitoring">
        <p>BrumeAgri monitors system activity to detect unauthorized access and improve security.</p>
      </Section>

      <Section title="Data Retention">
        <p>User data is retained while an account remains active. Users may request account deletion, subject to applicable legal or operational requirements.</p>
      </Section>

      <Section title="Future Security Enhancements">
        <p>Future versions of BrumeAgri may include:</p>
        <BulletList items={[
          'Two-factor authentication (2FA)',
          'Email verification',
          'Audit logs',
          'Advanced role permissions',
          'Login notifications',
          'Automatic session expiration',
        ]} />
      </Section>
    </div>
  );
}

function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Layout title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Tab nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-neutral-200 p-2">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition text-left"
                style={
                  activeTab === key
                    ? { backgroundColor: '#f0fdf4', color: '#15803d' }
                    : { color: '#525252' }
                }
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200 p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'profile' && <ProfileTab user={user} logout={logout} />}
          {activeTab === 'terms' && <TermsTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
          {activeTab === 'cookies' && <CookiePolicyTab />}
          {activeTab === 'disclaimer' && <DisclaimerTab />}
          {activeTab === 'security' && <SecurityTab />}
          
        </div>
      </div>
    </Layout>
  );
}

export default Settings;