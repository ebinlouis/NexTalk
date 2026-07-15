import React from 'react';

export default function InputField({
    id,
    name,
    type = 'text',
    label,
    placeholder = '',
    required = false,
    icon: Icon,
    rightElement,
    ...props
}) {
    return (
        <div className="relative w-full flex flex-col gap-1.5 text-left group">
            {label && (
                <label
                    htmlFor={id}
                    className="text-xs font-semibold text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200"
                >
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            <div className="relative flex items-center">
                {Icon && (
                    <div className="absolute left-4 text-slate-500 group-hover:text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none">
                        <Icon size={20} strokeWidth={2} />
                    </div>
                )}

                <input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full bg-slate-900/10 border border-slate-800/80 hover:border-slate-700/80 rounded-xl py-3 ${
                        Icon ? 'pl-12' : 'pl-4'
                    } ${
                        rightElement ? 'pr-12' : 'pr-4'
                    } text-sm text-slate-100 placeholder-slate-400/80 outline-none transition-all duration-300 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/20 focus:bg-slate-950/60 shadow-inner`}
                    {...props}
                />

                {rightElement && (
                    <div className="absolute right-3.5 flex items-center">{rightElement}</div>
                )}
            </div>
        </div>
    );
}
