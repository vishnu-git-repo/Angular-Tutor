
export function getDateFromUtc(utc: string): string {
    if (!utc) return '';
    
    const date = new Date(utc);
    return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}


export function getTimeFromUtc(utc: string): string {
    if (!utc) return '';
    
    const date = new Date(utc);
    return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}


export function getDateTimeFromUtc(utc: string): string {
    if (!utc) return '';
    
    const date = new Date(utc);
    return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

export function getDurationInDays(startUtc: string, endUtc: string): number {
    if (!startUtc || !endUtc) return 0;

    const start = new Date(startUtc);
    const end = new Date(endUtc);
    const diffMs = end.getTime() - start.getTime();
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
}