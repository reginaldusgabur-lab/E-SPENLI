'use server';

import { notFound } from 'next/navigation';
import { adminDb as firestore } from '@/lib/firebase-admin';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReportClientShell from './ReportClientShell';
import { eachDayOfInterval, isWithinInterval, startOfMonth, endOfMonth, startOfDay, format, isBefore } from 'date-fns';
import { Timestamp } from 'firebase-admin/firestore';

// Define a type for our records to satisfy TypeScript
interface AttendanceRecord {
  id: string;
  checkInTime: Timestamp;
  checkOutTime?: Timestamp;
  manualEntry?: boolean;
}

// Define an interface for the component's props to fix the type error
interface UserReportDetailPageProps {
  params: { userId: string };
  searchParams: { month?: string };
}

// Helper to parse the month from searchParams - Standardized to UTC start of month
const getMonthDate = (monthParam: string | undefined): Date => {
    if (monthParam) {
        const [year, month] = monthParam.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, 1));
    }
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
};

// This is a React Server Component (RSC)
export default async function UserReportDetailPage({ params, searchParams }: UserReportDetailPageProps) {
    const { userId } = params;
    const currentMonth = getMonthDate(searchParams.month);

    try {
        // Step 1: Fetch user and school config data using Admin SDK
        const userRef = firestore.collection('users').doc(userId);
        const schoolConfigRef = firestore.collection('schoolConfig').doc('default');
        
        const [userSnap, schoolConfigSnap] = await Promise.all([
            userRef.get(),
            schoolConfigRef.get(),
        ]);

        if (!userSnap.exists) {
            notFound();
        }

        const userData = userSnap.data()!;
        const schoolConfig = schoolConfigSnap.exists ? schoolConfigSnap.data()! : {};

        // The client shell will fetch the actual report data. We just need to provide the initial context.
        return (
            <ReportClientShell 
                userId={userId}
                initialUserData={userData}
                initialMonth={currentMonth.toISOString()}
                initialSchoolConfig={schoolConfig}
            />
        );

    } catch (error) {
        console.error("Error rendering server component for user report:", error);
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    <AlertTitle>Gagal Memuat Laporan</AlertTitle>
                    <AlertDescription>
                        Terjadi kesalahan saat mengambil data di server. Silakan coba lagi nanti atau hubungi administrator.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
}
