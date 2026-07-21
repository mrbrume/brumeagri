import { Link } from 'react-router-dom';

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

function Legal() {
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

      <div className="max-w-3xl mx-auto px-8 pb-20">
        <h1 className="font-display font-extrabold text-3xl text-neutral-900 mb-8">Legal & Policies</h1>
        <p className="text-xs text-neutral-400 mb-8">Last Updated: July 2026</p>

        <h2 className="font-display font-bold text-xl text-neutral-900 mb-4 mt-8">Terms & Conditions</h2>
        <Section title="1. Acceptance of Terms">
          <p>By creating an account or using BrumeAgri, you agree to these Terms and Conditions. If you do not agree, you should not use the platform.</p>
        </Section>
        <Section title="2. About BrumeAgri">
          <p>BrumeAgri is a web-based farm management platform designed to help farm owners, farm managers, and investors manage farm operations, inventory, crops, sales, expenses, workers, and reports.</p>
        </Section>
        <Section title="3. User Responsibilities">
          <BulletList items={['Provide accurate information.', 'Keep login credentials secure.', 'Use the platform lawfully.', 'Maintain accurate farm records.', "Respect the rights of other users."]} />
        </Section>
        <Section title="4. Prohibited Activities">
          <BulletList items={['Attempt unauthorized access.', 'Upload malicious software.', 'Interfere with platform operations.', 'Use the platform for fraudulent activities.', "Share another user's account."]} />
        </Section>
        <Section title="5. Limitation of Liability">
          <p>BrumeAgri is a farm management tool and does not guarantee crop yields, business profits, or agricultural outcomes.</p>
        </Section>

        <h2 className="font-display font-bold text-xl text-neutral-900 mb-4 mt-10">Privacy Policy</h2>
        <Section title="Information We Collect">
          <p className="font-semibold text-neutral-800">Personal Information</p>
          <BulletList items={['Full name', 'Email address', 'Password (encrypted)', 'User role']} />
          <p className="font-semibold text-neutral-800 mt-3">Farm Information</p>
          <BulletList items={['Farm name', 'Farm location', 'Crops', 'Inventory', 'Sales', 'Expenses', 'Workers']} />
        </Section>
        <Section title="Data Sharing">
          <p>BrumeAgri does not sell user information. Information may only be shared when required by law, or with trusted service providers supporting the platform (such as hosting providers).</p>
        </Section>
        <Section title="User Rights">
          <BulletList items={['Update their profile.', 'Delete their account.', 'Request a copy of their personal data.', 'Contact support regarding privacy concerns.']} />
        </Section>

        <h2 className="font-display font-bold text-xl text-neutral-900 mb-4 mt-10">Cookie Policy</h2>
        <Section title="How We Use Cookies">
          <BulletList items={['Keep you signed in between visits.', 'Remember your preferences.', 'Understand how the platform is used, to improve performance.']} />
        </Section>

        <h2 className="font-display font-bold text-xl text-neutral-900 mb-4 mt-10">Disclaimer</h2>
        <Section title="No Guarantee of Outcomes">
          <p>BrumeAgri does not guarantee crop yields, business profits, weather accuracy, or any other agricultural or financial outcome. Decisions about farm operations, investments, and finances remain the sole responsibility of the user.</p>
        </Section>
      </div>
    </div>
  );
}

export default Legal;