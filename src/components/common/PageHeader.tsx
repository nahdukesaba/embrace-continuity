import type { ReactNode } from "react";

export function PageHeader({
                               title,
                               description,
                               actions,
                               titlePrefix,
                           }: {
    title: string;
    description?: string;
    actions?: ReactNode;
    titlePrefix?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
                    {titlePrefix}
                    {title}
                </h1>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}