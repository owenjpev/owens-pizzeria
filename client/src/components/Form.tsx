"use client";

import React, { ChangeEvent, ReactNode } from "react";

export default function Input({ label, name, type = "text", value, className, placeholder, onChange }: {
    label?: string,
    name?: string,
    type?: string,
    value?: any,
	className?: string,
	placeholder?: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <div className="w-full flex flex-col">
            {label && <label htmlFor={name} className="text-xs text-zinc-600 mb-[2px]">{label}</label>}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
				placeholder={placeholder}
                className={`
					border border-zinc-400 rounded-md px-3 py-2 outline-none
					focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-0
					transition-all duration-200
					${className ?? ""}
				`}
            />
        </div>
    );
}

export function Textarea({ label, name, value, className, placeholder, onChange }: {
    label?: string,
    name?: string,
    value?: any,
	className?: string,
	placeholder?: string,
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
}) {
    return (
        <div className="w-full flex flex-col">
            {label && <label htmlFor={name} className="text-xs text-zinc-600 mb-[2px]">{label}</label>}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
				placeholder={placeholder}
                className={`
					border border-zinc-400 rounded-md px-3 py-2 outline-none
					focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-0
					transition-all duration-200 min-h-32 resize-none
					${className ?? ""}
				`}
            />
        </div>
    );
}

export function RadioGroup({ label, name, options, value, onChange }: {
	label?: string,
	name: string,
	options: { label: string; value: string }[],
	value: string,
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
	return (
		<div className="flex flex-col gap-3">
			{label && <span className="font-medium">{label}</span>}
			<div className="flex flex-col gap-2">
				{options.map((opt) => (
					<label
						key={opt.value}
						className="flex items-center gap-3 cursor-pointer text-sm select-none"
					>
						<input
							type="radio"
							name={name}
							value={opt.value}
							checked={value === opt.value}
							onChange={onChange}
							className="hidden peer"
						/>
						<span
							className="relative w-4 h-4 rounded-full border border-zinc-400 
								transition-all duration-200 
								peer-checked:border-orange-500 
								peer-checked:ring-3 peer-checked:ring-orange-500/20
								before:content-[''] before:absolute before:inset-0 
								before:m-auto before:w-2 before:h-2 before:rounded-full 
								before:bg-orange-500 before:scale-0 
								before:transition-transform before:duration-200 
								peer-checked:before:scale-100"
						/>
						<span className="text-zinc-800">{opt.label}</span>
					</label>
				))}
			</div>
		</div>
	);
}

export function CheckboxGroup({ label, name, options, values, onChange, condensed }: {
	label?: string,
	name: string,
	options: { label: string; value: string }[],
	values: string[],
	onChange: (selected: string[]) => void,
	condensed?: boolean
}) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value, checked } = e.target;
		if (checked) {
			onChange([...values, value]);
		} else {
			onChange(values.filter((v) => v !== value));
		}
	}

	return (
		<div className="flex flex-col gap-3">
			{label && <span className="font-medium">{label}</span>}
			<div className={`${condensed ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "flex flex-col gap-2"}`}>
				{options.map((opt) => (
					<label
						key={opt.value}
						className="flex items-center gap-3 cursor-pointer text-sm select-none"
					>
						<input
							type="checkbox"
							name={name}
							value={opt.value}
							checked={values.includes(opt.value)}
							onChange={handleChange}
							className="hidden peer"
						/>
						<span
						className="relative w-4 h-4 rounded-md border border-zinc-400 
							flex items-center justify-center 
							transition-all duration-200
							peer-checked:border-orange-500 
							peer-checked:ring-3 peer-checked:ring-orange-500/20
							before:content-[''] before:absolute before:w-2 before:h-1 before:border-b-[2px] before:border-l-[2px]
							before:border-orange-500 before:rotate-[-45deg] before:opacity-0 
							before:scale-0 before:transition-all before:duration-200
							peer-checked:before:opacity-100 peer-checked:before:scale-100"
						/>
						<span className="text-zinc-800">{opt.label}</span>
					</label>
				))}
			</div>
		</div>
	);
}

export function DoubleInput({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-wrap md:flex-nowrap gap-4">
            {children}
        </div>
    );
}

export function Form({ children, className }: { children: ReactNode, className?: string }) {
    return (
        <div className={`w-full ${className ?? ""} flex flex-col gap-4`}>
            {children}
        </div>
    );
}