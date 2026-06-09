const variants = {
    normal:   { bg: '#EEF2FF', color: '#4338CA' },
    urgent:   { bg: '#FEE2E2', color: '#C1440E' },
    holiday:  { bg: '#FEF9C3', color: '#854D0E' },
    paid:     { bg: '#DCFCE7', color: '#15803D' },
    pending:  { bg: '#FEF9C3', color: '#92400E' },
    overdue:  { bg: '#FEE2E2', color: '#B91C1C' },
    draft:    { bg: '#F3F4F6', color: '#374151' },
    published:{ bg: '#DBEAFE', color: '#1D4ED8' },
    active:   { bg: '#D1FAE5', color: '#065F46' },
    completed:{ bg: '#EDE9FE', color: '#5B21B6' },
    results_released: { bg: '#DCFCE7', color: '#15803D' },
    answered: { bg: '#DCFCE7', color: '#15803D' },
    easy:     { bg: '#DCFCE7', color: '#15803D' },
    medium:   { bg: '#FEF9C3', color: '#92400E' },
    hard:     { bg: '#FEE2E2', color: '#B91C1C' },
};

export default function Badge({ label, variant = 'normal' }) {
    const style = variants[variant] || variants.normal;
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: style.bg, color: style.color }}
        >
            {label}
        </span>
    );
}
