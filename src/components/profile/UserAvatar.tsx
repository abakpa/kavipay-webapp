import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/types/profile';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface UserAvatarProps {
  name: string;
  size?: AvatarSize;
  imageUrl?: string;
  className?: string;
  onClick?: () => void;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; border: string }> = {
  sm: { container: 'h-8 w-8', text: 'text-xs', border: 'border' },
  md: { container: 'h-10 w-10', text: 'text-sm', border: 'border-2' },
  lg: { container: 'h-16 w-16', text: 'text-xl', border: 'border-2' },
  xl: { container: 'h-24 w-24', text: 'text-3xl', border: 'border-2' },
};

export function UserAvatar({
  name,
  size = 'md',
  imageUrl,
  className,
  onClick,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);
  const sizeClass = sizeClasses[size];

  if (imageUrl) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'overflow-hidden rounded-full',
          sizeClass.container,
          sizeClass.border,
          onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
          !onClick && 'cursor-default',
          className
        )}
        style={{ borderColor: avatarColor }}
      >
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex items-center justify-center rounded-full font-semibold',
        sizeClass.container,
        sizeClass.text,
        sizeClass.border,
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        !onClick && 'cursor-default',
        className
      )}
      style={{
        backgroundColor: `${avatarColor}20`,
        borderColor: avatarColor,
        color: avatarColor,
      }}
    >
      {initials}
    </button>
  );
}

export default UserAvatar;
