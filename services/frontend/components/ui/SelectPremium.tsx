"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

interface Option {
    label: string
    value: string
}

interface SelectPremiumProps {
    options: Option[]
    value: string
    onChange: (value: string) => void
    placeholder: string
    className?: string
    variant?: "default" | "blue"
}

export function SelectPremium({
    options,
    value,
    onChange,
    placeholder,
    className,
    variant = "default",
}: SelectPremiumProps) {
    const [open, setOpen] = React.useState(false)
    const touchStartRef = React.useRef<{ x: number; y: number; pointerId: number } | null>(null)
    const touchMovedRef = React.useRef(false)
    const TOUCH_MOVE_THRESHOLD = 10

    const selectedOption = options.find((opt) => opt.value === value)

    // Find the label for the current value, or use placeholder
    const currentLabel = selectedOption ? selectedOption.label : placeholder

    const baseStyles = "flex h-11 w-full items-center justify-between rounded-2xl px-5 text-sm font-semibold transition-all duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none border shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-[0.98]"

    const variants = {
        default: "bg-white border-zinc-200/60 text-zinc-600 hover:bg-zinc-50/80 hover:border-zinc-300/80 hover:shadow-md focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5",
        blue: "bg-blue-50/80 border-blue-100/60 text-blue-700 hover:bg-blue-100/80 hover:border-blue-200/80 hover:shadow-blue-500/10 hover:shadow-lg focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5",
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(baseStyles, variants[variant], className)}
                    onPointerDown={(event) => {
                        if (event.pointerType !== "touch") return
                        event.preventDefault()
                        touchStartRef.current = {
                            x: event.clientX,
                            y: event.clientY,
                            pointerId: event.pointerId,
                        }
                        touchMovedRef.current = false
                    }}
                    onPointerMove={(event) => {
                        const start = touchStartRef.current
                        if (event.pointerType !== "touch" || !start || event.pointerId !== start.pointerId) return

                        const deltaX = Math.abs(event.clientX - start.x)
                        const deltaY = Math.abs(event.clientY - start.y)
                        if (deltaX > TOUCH_MOVE_THRESHOLD || deltaY > TOUCH_MOVE_THRESHOLD) {
                            touchMovedRef.current = true
                        }
                    }}
                    onPointerUp={(event) => {
                        const start = touchStartRef.current
                        if (event.pointerType !== "touch" || !start || event.pointerId !== start.pointerId) return

                        if (!touchMovedRef.current) {
                            setOpen((prev) => !prev)
                        }
                        touchStartRef.current = null
                        touchMovedRef.current = false
                    }}
                    onPointerCancel={() => {
                        touchStartRef.current = null
                        touchMovedRef.current = false
                    }}
                >
                    <span className="truncate mr-3">{currentLabel}</span>
                    <ChevronDown className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-500 group-data-[state=open]:rotate-180",
                        variant === "blue" ? "text-blue-500/70" : "text-zinc-400"
                    )} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={8}
                collisionPadding={10}
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1.5 rounded-[22px] border border-zinc-200/50 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-4 duration-300 z-[100] flex flex-col"
                style={{ maxHeight: 'var(--radix-dropdown-menu-content-available-height)' }}
            >
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent pr-1 min-h-[50px]">
                    {options.map((opt) => (
                        <DropdownMenuItem
                            key={opt.value}
                            className={cn(
                                "flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] cursor-pointer transition-all duration-200 focus:bg-blue-500 focus:text-white outline-none mb-0.5 last:mb-0 group",
                                value === opt.value ? "bg-blue-50 text-blue-700 font-bold" : "text-zinc-600 hover:bg-zinc-50"
                            )}
                            onClick={() => onChange(opt.value)}
                        >
                            <span className="truncate">{opt.label}</span>
                            {value === opt.value && (
                                <div className="h-2 w-2 rounded-full bg-blue-600 group-focus:bg-white" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
