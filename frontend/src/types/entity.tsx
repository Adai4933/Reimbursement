export interface User {
    id: string;
    username: string;
    email: string;
    role: 'EMPLOYEE' | 'EMPLOYER';
    suspended: boolean;
    createdAt?: string;
}

export interface Ticket {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
    createdAt: string;
    amount: number;
    paymentTime: string;
    userEmail: string;
    username: string;
    attachmentUrl?: string;
}

export interface TableColumn<T> {
    key: keyof T;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
}

export interface CreateTicketForm {
    amount: number;
    paymentTime: string;
    attachment_link: string;
}