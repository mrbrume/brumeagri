function StatCard({ icon: Icon, label, value, sublabel, comingSoon }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col justify-between min-h-[112px]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#f0fdf4' }}
          >
            <Icon size={16} style={{ color: '#15803d' }} />
          </div>
        )}
      </div>
      {comingSoon ? (
        <p className="text-lg font-semibold text-neutral-400">Coming Soon</p>
      ) : (
        <div>
          <p className="font-display font-extrabold text-2xl text-neutral-900">{value}</p>
          {sublabel && <p className="text-xs text-neutral-500 mt-1">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}

export default StatCard;