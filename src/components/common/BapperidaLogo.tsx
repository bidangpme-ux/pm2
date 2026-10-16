import React, { useState, useEffect, useRef } from 'react';
import bapperidaLogoImg from '../../assets/images/bapperida_logo_1792038885163.jpg';

interface BapperidaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  allowCustomUpload?: boolean;
}

const STORAGE_KEY_CUSTOM_LOGO = 'bapperida_custom_logo_dataurl';

export const BapperidaLogo: React.FC<BapperidaLogoProps> = ({
  className = '',
  size = 'md',
  allowCustomUpload = false,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_LOGO);
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setCustomLogoUrl(localStorage.getItem(STORAGE_KEY_CUSTOM_LOGO));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-28 h-28',
    xl: 'w-44 h-44',
  };

  const dim = sizeMap[size] || sizeMap.md;
  const activeImageSrc = customLogoUrl || bapperidaLogoImg;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomLogoUrl(result);
      localStorage.setItem(STORAGE_KEY_CUSTOM_LOGO, result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${dim} ${className} group`}>
      <img
        src={activeImageSrc}
        alt="Logo Resmi Bapperida Kabupaten Tanggamus"
        className="w-full h-full object-contain rounded-lg drop-shadow-xs transition-transform duration-300 group-hover:scale-102"
        referrerPolicy="no-referrer"
      />

      {allowCustomUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute -bottom-2 -right-2 hidden group-hover:flex items-center gap-1 bg-slate-900/90 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm border border-slate-700 whitespace-nowrap cursor-pointer z-30"
            title="Klik untuk memilih file logo PNG dari komputer Anda"
          >
            Ganti File
          </button>
        </>
      )}
    </div>
  );
};
