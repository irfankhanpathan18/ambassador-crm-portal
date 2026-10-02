export type UserRole = 'ADMIN' | 'AMBASSADOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface AmbassadorDetails {
  id: number;
  college: string;
  referral_code: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  ambassador?: AmbassadorDetails | null;
}

export interface Ambassador {
  id: number;
  user_id: number;
  name: string;
  email: string;
  college: string;
  referral_code: string;
  status: UserStatus;
  total_registrations: number;
  created_at: string;
}

export interface Registration {
  id: number;
  registration_id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  city: string;
  course: string;
  year: string;
  ambassador_id: number;
  ambassador_name?: string;
  referral_code?: string;
  created_at: string;
}

export interface LeaderboardItem {
  rank: number;
  id: number;
  ambassador_name: string;
  college: string;
  referral_code: string;
  total_registrations: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  colleges: string[];
  cities: string[];
  courses: string[];
  years: string[];
  ambassadors: { id: number; name: string; referral_code: string }[];
}

export interface AdminDashboardData {
  totalRegistrations: number;
  totalAmbassadors: number;
  topAmbassadors: {
    id: number;
    name: string;
    college: string;
    referral_code: string;
    total_registrations: number;
  }[];
  trend: { period: string; count: number }[];
}

export interface AmbassadorDashboardData {
  myRegistrationsCount: number;
  referralCode: string;
  referralLink: string;
  recentRegistrations: {
    registration_id: string;
    name: string;
    college: string;
    created_at: string;
  }[];
}

export interface ReportData {
  metrics: {
    totalRegistrations: number;
    totalAmbassadors: number;
    avgRegistrationsPerAmbassador: number;
    growthRate: number;
    thisMonthCount: number;
  };
  charts: {
    overTime: { date: string; count: number }[];
    byAmbassador: { ambassador_name: string; count: number }[];
    byCollege: { college: string; count: number }[];
  };
}
