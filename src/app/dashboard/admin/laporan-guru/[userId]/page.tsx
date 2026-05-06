'use server';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore'; // Changed: Using getDoc for server-side fetching
// Removed: useDocument is a client-side hook and cannot be used in Server Components.
import { Loader2 } from 'lucide-react';

import { db } from '@/lib/firebase/firebase';
import { UserProfile } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import UserReportTabs from '@/components/features/report/UserReportTabs';

// Define PageProps right here
interface PageProps {
  params: { userId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}


// Main component
export default function UserReportDetailPage({ params }: PageProps) {
  const { userId } = params;

  if (!userId) {
    notFound();
  }

  return (
    <div className="flex flex-col space-y-6">
      <Suspense fallback={<UserProfileSkeleton />}>
        {/* This is a Server Component, so we pass userId to it. */}
        <UserProfileCard userId={userId} />
      </Suspense>
      <Suspense fallback={<p>Memuat Laporan...</p>}>
         {/* @ts-expect-error Server Component - This component likely also uses client hooks and needs refactoring */}
        <UserReportTabs userId={userId} />
      </Suspense>
    </div>
  );
}


// Sub-component for User Profile - Refactored for Server Component
async function UserProfileCard({ userId }: { userId: string }) {
  // Data fetching is now done directly on the server.
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef); // Using await with getDoc

    if (!userDoc.exists()) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Pengguna Tidak Ditemukan</CardTitle>
              </CardHeader>
              <CardContent>
                  <p>Data untuk pengguna dengan ID ini tidak dapat ditemukan.</p>
              </CardContent>
          </Card>
      )
    }

    const user = userDoc.data() as UserProfile;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Laporan Individual</CardTitle>
          <CardDescription>
            Detail laporan kehadiran untuk pengguna berikut.
          </Description>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL || undefined} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground capitalize">{user.role} - {user.employmentStatus}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );

  } catch (error) {
    console.error("Error fetching user document:", error);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Gagal memuat data pengguna karena terjadi kesalahan pada server.</p>
            </CardContent>
        </Card>
    )
  }
}

// Skeleton component for loading state
function UserProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Individual</CardTitle>
        <CardDescription>
          Detail laporan kehadiran untuk pengguna berikut.
        </Description>
      </Header>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
