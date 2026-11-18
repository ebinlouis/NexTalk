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
        <div className="relative w-full flex flex-col gap-[7px] text-left group">
            {label && (
                <label
                    htmlFor={id}
                    className="text-[13.5px] font-semibold text-ink-slate group-focus-within:text-primary transition-colors duration-200"
                >
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            <div className="relative flex items-center">
                {Icon && (
                    <div className="absolute left-3.5 text-muted group-focus-within:text-accent transition-colors duration-200 pointer-events-none">
                        <Icon size={18} strokeWidth={2} />
                    </div>
                )}

                <input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full h-[46px] bg-white border-[1.5px] border-line hover:border-line-hover rounded-lg py-2.5 ${
                        Icon ? 'pl-[42px]' : 'pl-3.5'
                    } ${
                        rightElement ? 'pr-11' : 'pr-3.5'
                    } text-sm text-ink placeholder:text-[13.5px] placeholder:text-subtle outline-none transition-all duration-150 focus:border-accent focus:shadow-focus`}
                    {...props}
                />

                {rightElement && (
                    <div className="absolute right-3 flex items-center">{rightElement}</div>
                )}
            </div>
        </div>
    );
}
