"use client";

import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function BuildingIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M9 8h1" />
            <path d="M14 8h1" />
            <path d="M9 12h1" />
            <path d="M14 12h1" />
            <path d="M10 21v-4h4v4" />
        </svg>
    );
}

export function MailIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    );
}

export function LockIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
    );
}

export function UserIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            <path d="M19 21a7 7 0 0 0-14 0" />
            <circle cx="12" cy="8" r="4" />
        </svg>
    );
}

export function ArrowRightIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            <path d="M5 12h14" />
            <path d="m13 5 7 7-7 7" />
        </svg>
    );
}

export function GoogleIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.4Z" fill="currentColor" />
            <path d="M12 22c2.7 0 4.9-.9 6.5-2.4l-3.3-2.6c-.9.6-2 .9-3.2.9-2.5 0-4.6-1.7-5.4-4H3.2v2.7A10 10 0 0 0 12 22Z" fill="currentColor" />
            <path d="M6.6 13.9A6 6 0 0 1 6.3 12c0-.7.1-1.3.3-1.9V7.4H3.2A10 10 0 0 0 2 12c0 1.6.4 3.1 1.2 4.6l3.4-2.7Z" fill="currentColor" />
            <path d="M12 6.1c1.5 0 2.8.5 3.8 1.4l2.8-2.8A10 10 0 0 0 3.2 7.4l3.4 2.7c.8-2.3 2.9-4 5.4-4Z" fill="currentColor" />
        </svg>
    );
}

export function AlertCircleIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}
