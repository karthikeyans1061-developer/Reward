"use client";

import { useId } from "react";

interface SearchableDropdownProps {
	options: readonly string[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	id?: string;
}

export default function SearchableDropdown({
	options,
	value,
	onChange,
	placeholder,
	id,
}: SearchableDropdownProps) {
	const generatedId = useId();
	const listId = `${id ?? generatedId}-options`;

	return (
		<>
			<input
				className="form-control"
				id={id}
				type="text"
				list={listId}
				value={value}
				placeholder={placeholder}
				autoComplete="off"
				onChange={(event) => onChange(event.target.value)}
			/>
			<datalist id={listId}>
				{options.map((option) => <option value={option} key={option} />)}
			</datalist>
		</>
	);
}
