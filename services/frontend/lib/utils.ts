import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const countValidItems = (str: any) => {
    if (!str || typeof str !== 'string') return 0;
    const invalid = ['sin dato', 'n/a', '#n/a', 'nan', '', '0'];
    return str.split(',').map(s => s.trim()).filter(s => s && !invalid.includes(s.toLowerCase())).length;
};
