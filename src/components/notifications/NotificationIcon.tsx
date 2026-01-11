import {
  ArrowUpDown,
  Shield,
  Wallet,
  Info,
  Megaphone,
  UserCheck,
  CreditCard,
  Zap,
} from 'lucide-react';
import type { NotificationType } from '@/types/notification';

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
  style?: React.CSSProperties;
}

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  transaction: ArrowUpDown,
  security: Shield,
  wallet: Wallet,
  system: Info,
  marketing: Megaphone,
  kyc: UserCheck,
  card: CreditCard,
  utility: Zap,
};

export function NotificationIcon({ type, className, style }: NotificationIconProps) {
  const Icon = iconMap[type] || Info;
  return <Icon className={className} style={style} />;
}

export default NotificationIcon;
