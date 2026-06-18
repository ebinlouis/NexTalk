import React from 'react';

/**
 * Reusable premium input field styled with Tailwind CSS.
 * Supports prepended Lucide icon, floating labels, validation states, and accessability hooks.
 */
export default function InputField({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  icon: Icon,
  rightElement,
  error,
}) {
  return (
    <div className="relative w-full flex flex-col gap-1.5 text-left group">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-400 group-focus-within:text-indigo-400 transition-colors duration-200"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200 pointer-events-none">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-slate-900/40 border border-slate-700/80 rounded-xl py-3.5 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${
            rightElement ? 'pr-11' : 'pr-4'
          } text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/15 focus:bg-slate-950/60 shadow-inner`}
        />
        
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-rose-400 mt-1 font-medium transition-all duration-200" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
