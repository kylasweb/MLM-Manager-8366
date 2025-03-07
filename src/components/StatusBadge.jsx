import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';

const statusConfig = {
  success: {
    icon: FaCheck,
    className: 'bg-green-100 text-green-800'
  },
  error: {
    icon: FaTimes,
    className: 'bg-red-100 text-red-800'
  },
  pending: {
    icon: FaClock,
    className: 'bg-yellow-100 text-yellow-800'
  }
};

function StatusBadge({ status, text }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      <span>{text}</span>
    </span>
  );
}

export default StatusBadge;