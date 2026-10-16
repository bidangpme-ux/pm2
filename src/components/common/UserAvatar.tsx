import React from 'react';

interface UserAvatarProps {
  name: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

/**
 * Extracts 1-2 uppercase letters representing the name's initials.
 * Example:
 *  "Administrator Sistem" -> "AS"
 *  "Ahmad Fauzi, S.Kom" -> "AF"
 *  "Operator Bidang PME" -> "BP" (or "OP")
 *  "Budi Santoso, M.Si" -> "BS"
 */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  
  // Clean titles like S.Kom, M.Si, Ir., Dr., etc.
  const clean = name
    .replace(/,\s*[A-Za-z.\s]+$/g, '') // remove degree suffix
    .replace(/^(Dr\.|Drs\.|Ir\.|H\.|Hj\.)\s+/gi, '') // remove honorific prefix
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Deterministic color palette for initial badges based on name and role
 */
function getBadgeColors(name: string, role?: string): { bg: string; text: string; ring: string } {
  if (role === 'admin') {
    return {
      bg: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700',
      text: 'text-white',
      ring: 'ring-indigo-100',
    };
  }
  if (role === 'bidang') {
    return {
      bg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600',
      text: 'text-white',
      ring: 'ring-amber-100',
    };
  }
  if (role === 'user') {
    return {
      bg: 'bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-600',
      text: 'text-white',
      ring: 'ring-blue-100',
    };
  }

  // Hash-based color for generic users
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    { bg: 'bg-gradient-to-br from-indigo-600 to-blue-600', text: 'text-white', ring: 'ring-indigo-100' },
    { bg: 'bg-gradient-to-br from-sky-600 to-teal-600', text: 'text-white', ring: 'ring-sky-100' },
    { bg: 'bg-gradient-to-br from-emerald-600 to-teal-700', text: 'text-white', ring: 'ring-emerald-100' },
    { bg: 'bg-gradient-to-br from-violet-600 to-purple-700', text: 'text-white', ring: 'ring-violet-100' },
    { bg: 'bg-gradient-to-br from-rose-600 to-pink-600', text: 'text-white', ring: 'ring-rose-100' },
    { bg: 'bg-gradient-to-br from-amber-600 to-orange-600', text: 'text-white', ring: 'ring-amber-100' },
  ];
  return palettes[Math.abs(hash) % palettes.length];
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px] tracking-tight',
  sm: 'w-8 h-8 text-xs font-bold tracking-tight',
  md: 'w-9 h-9 text-xs font-bold tracking-tight',
  lg: 'w-11 h-11 text-sm font-bold tracking-tight',
  xl: 'w-14 h-14 text-base font-extrabold tracking-tight',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  role,
  size = 'sm',
  className = '',
  showBorder = true,
}) => {
  const initials = getInitials(name);
  const colors = getBadgeColors(name, role);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full select-none shadow-2xs shrink-0 ${sizeClass} ${colors.bg} ${colors.text} ${
        showBorder ? `ring-2 ${colors.ring}` : ''
      } ${className}`}
      title={name}
      aria-label={`Inisial Akun ${name}`}
    >
      <span className="font-semibold uppercase select-none">{initials}</span>
    </div>
  );
};
