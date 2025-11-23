import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  statusColor?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  showStatus = false,
  statusColor = 'bg-green-500'
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];
  const borderClass = size === 'lg' ? 'border-4' : size === 'xl' ? 'border-4' : 'border-2';

  return (
    <div className={`relative inline-block ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClass} ${borderClass} border-gray-200 rounded-full object-cover`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`${sizeClass} ${borderClass} border-gray-200 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white`}
        >
          <User className={iconSizeClass} />
        </div>
      )}
      {showStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${size === 'lg' || size === 'xl' ? 'w-6 h-6' : 'w-3 h-3'} ${statusColor} rounded-full border-2 border-white`}></div>
      )}
    </div>
  );
};

