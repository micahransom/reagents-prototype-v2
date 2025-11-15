"use client";

import { useEffect, useRef } from "react";

interface CreationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'BASE_REAGENT' | 'COMPOSITE_REAGENT' | 'THERMOCYCLER') => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export default function CreationMenu({
  isOpen,
  onClose,
  onSelectType,
  buttonRef,
}: CreationMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  // Calculate position relative to button
  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menu = menuRef.current;
      
      menu.style.position = 'fixed';
      menu.style.top = `${buttonRect.bottom + 4}px`;
      menu.style.right = `${window.innerWidth - buttonRect.right}px`;
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="bg-white border border-slate-300 rounded-md shadow-lg p-1 w-[181px] z-50"
    >
      <button
        onClick={() => {
          onSelectType('BASE_REAGENT');
          onClose();
        }}
        className="w-full text-left px-2 py-1.5 text-sm text-slate-950 hover:bg-slate-100 rounded-sm flex items-center"
      >
        Base Reagent
      </button>
      <button
        onClick={() => {
          onSelectType('COMPOSITE_REAGENT');
          onClose();
        }}
        className="w-full text-left px-2 py-1.5 text-sm text-slate-950 hover:bg-slate-100 rounded-sm flex items-center"
      >
        Compound Reagent
      </button>
      <button
        onClick={() => {
          onSelectType('THERMOCYCLER');
          onClose();
        }}
        className="w-full text-left px-2 py-1.5 text-sm text-slate-950 hover:bg-slate-100 rounded-sm flex items-center"
      >
        Thermocycler
      </button>
    </div>
  );
}

