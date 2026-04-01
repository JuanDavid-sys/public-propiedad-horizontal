import * as React from "react"
import { cn } from "@/lib/utils"

import { ChevronDown } from "lucide-react"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, onChange, ...props }, ref) => {
        const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (onChange) onChange(e);
            // Al perder el foco (blur), la flecha vuelve a su posición original
            e.target.blur();
        };

        return (
            <div className="relative group">
                <select
                    className={cn(
                        "flex h-11 w-full rounded-2xl border border-zinc-200/60 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all pr-10 cursor-pointer hover:bg-zinc-50/50",
                        className
                    )}
                    ref={ref}
                    onChange={handleSelectChange}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
                    <ChevronDown
                        size={16}
                        className="text-zinc-400 transition-transform duration-300 group-focus-within:rotate-180"
                    />
                </div>
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }
