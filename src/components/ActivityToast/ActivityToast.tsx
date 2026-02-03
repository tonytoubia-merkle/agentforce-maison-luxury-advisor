import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Sparkles, UserCheck } from 'lucide-react';
import type { CaptureNotification } from '@/types/agent';

interface ActivityToastProps {
  notification: CaptureNotification;
  onDismiss: () => void;
}

const TOAST_CONFIG: Record<CaptureNotification['type'], { icon: React.ElementType; bgColor: string; borderColor: string }> = {
  contact_created: {
    icon: UserPlus,
    bgColor: 'bg-emerald-950/90',
    borderColor: 'border-emerald-500/40',
  },
  meaningful_event: {
    icon: Sparkles,
    bgColor: 'bg-amber-950/90',
    borderColor: 'border-amber-500/40',
  },
  profile_enrichment: {
    icon: UserCheck,
    bgColor: 'bg-sky-950/90',
    borderColor: 'border-sky-500/40',
  },
};

export const ActivityToast: React.FC<ActivityToastProps> = ({ notification, onDismiss }) => {
  const config = TOAST_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        ${config.bgColor} ${config.borderColor}
        border backdrop-blur-sm rounded-lg px-4 py-3
        flex items-center gap-3 shadow-lg
        cursor-pointer hover:opacity-80 transition-opacity
      `}
      onClick={onDismiss}
    >
      <Icon className="w-4 h-4 text-white/80 shrink-0" />
      <span className="text-sm text-white/90 font-medium">{notification.label}</span>
    </motion.div>
  );
};

interface ActivityToastContainerProps {
  notifications: Array<CaptureNotification & { id: string }>;
  onDismiss: (id: string) => void;
}

export const ActivityToastContainer: React.FC<ActivityToastContainerProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <ActivityToast notification={n} onDismiss={() => onDismiss(n.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
