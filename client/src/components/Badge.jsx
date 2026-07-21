const COLORS = {
  planted: { bg: '#f0fdf4', text: '#15803d' },
  growing: { bg: '#eff6ff', text: '#2563eb' },
  ready_for_harvest: { bg: '#fffbeb', text: '#d97706' },
  harvested: { bg: '#f5f5f5', text: '#525252' },
};

const LABELS = {
  planted: 'Planted',
  growing: 'Growing',
  ready_for_harvest: 'Ready for Harvest',
  harvested: 'Harvested',
};

function Badge({ status }) {
  const color = COLORS[status] || COLORS.harvested;
  const label = LABELS[status] || status;

  return (
    <span
      className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {label}
    </span>
  );
}

export default Badge;