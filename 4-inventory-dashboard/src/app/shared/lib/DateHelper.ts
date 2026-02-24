
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