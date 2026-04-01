import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface UnitTabsProps {
    tabs: Tab[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export function UnitTabs({ tabs, activeTab, setActiveTab }: UnitTabsProps) {
    return (
        <div className="border-b border-zinc-200 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-8 min-w-max px-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 py-4 border-b-2 transition-all duration-300 relative",
                                isActive
                                    ? "border-blue-600 text-blue-600 font-bold"
                                    : "border-transparent text-zinc-400 font-semibold hover:text-zinc-600"
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full",
                                    isActive ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-400"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-blue-600 rounded-full shadow-[0_2px_10px_rgba(37,99,235,0.4)]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
} 
