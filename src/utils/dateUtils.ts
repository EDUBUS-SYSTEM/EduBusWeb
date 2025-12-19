
export const formatDate = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};

export const formatDateTime = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};


export const formatDateTimeShort = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};


export const formatDateForInput = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
    }

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';

    // Get local date components (not UTC components)
    // Note: This uses browser's local time. If precise VN time is needed for inputs,
    // we would need to adjust. For now, keeping as local.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


export const formatTime = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};


export const formatMonthYear = (dateInput: Date | string): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};
