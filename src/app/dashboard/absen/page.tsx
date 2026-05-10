'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle, Clock, X, Loader2, AlertTriangle, CameraOff, CalendarOff } from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, isBefore } from 'date-fns';
import QuoteOfTheDay from '@/components/layout/quote-of-the-day';
import { PageWrapper } from '@/components/layout/page-wrapper';

// Dynamically import the QrScanner component with SSR turned off.
const QrScanner = dynamic(
  () => import('@/components/scanner/qr-scanner').then(mod => mod.QrScanner),
  {
    ssr: false, // This is the crucial part!
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-foreground" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Menyiapkan kamera...</p>
      </div>
    ),
  }
);

// --- Helper Functions (No changes) ---
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180, Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in metres
}

const getCurrentPosition = (options?: PositionOptions): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));

// --- Types (No changes) ---
type FeedbackStatus = 'idle' | 'processing' | 'locating' | 'success_in' | 'success_out' | 'error_radius' | 'error_time' | 'error_already_in' | 'error_already_out' | 'error_generic' | 'error_location' | 'info_holiday' | 'info_checked_out' | 'info_no_camera';

// --- Main Component ---
export default function AbsenPage() {
  const [status, setStatus] = useState<FeedbackStatus>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  // State related to the scanner, now simplified
  const [scanSuccess, setScanSuccess] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // --- Firestore Data Hooks (No changes) ---
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc(user, userDocRef);
  const schoolConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'schoolConfig', 'default') : null, [firestore]);
  const { data: schoolConfig, isLoading: isConfigLoading } = useDoc(user, schoolConfigRef);
  const monthlyConfigId = useMemo(() => format(new Date(), 'yyyy-MM'), []);
  const monthlyConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'monthlyConfigs', monthlyConfigId) : null, [firestore, monthlyConfigId]);
  const { data: monthlyConfig, isLoading: isMonthlyConfigLoading } = useDoc(user, monthlyConfigRef);
  
  const todaysAttendanceQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return query(collection(firestore, 'users', user.uid, 'attendanceRecords'), where('date', '==', todayStr));
  }, [user, firestore]);
  const { data: todaysAttendance, isLoading: isAttendanceLoading } = useCollection(user, todaysAttendanceQuery);
  const todaysRecord = useMemo(() => todaysAttendance?.[0], [todaysAttendance]);

  // --- Derived State (No changes) ---
  const isDataLoading = isUserLoading || isUserDataLoading || isConfigLoading || isAttendanceLoading || isMonthlyConfigLoading;
  const isHoliday = useMemo(() => {
    if (!schoolConfig) return false;
    if (schoolConfig.isAttendanceActive === false) return true;
    const today = new Date(), todayStr = format(today, 'yyyy-MM-dd');
    if (monthlyConfig?.holidays?.includes(todayStr)) return true;
    const offDays: number[] = schoolConfig.offDays ?? [0, 6];
    return offDays.includes(today.getDay());
  }, [schoolConfig, monthlyConfig]);
  const hasCompletedAttendance = useMemo(() => !!(todaysRecord?.checkInTime && todaysRecord?.checkOutTime), [todaysRecord]);

  // --- Check Camera Permission (NEW) ---
  // This effect runs once to check for camera availability.
  useEffect(() => {
    // We need to check navigator availability for SSR safety, although dynamic import helps.
    if (typeof navigator !== 'undefined' && typeof navigator.mediaDevices !== 'undefined') {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const hasCamera = devices.some(device => device.kind === 'videoinput');
          setHasCameraPermission(hasCamera);
        })
        .catch(() => setHasCameraPermission(false));
    } else {
      setHasCameraPermission(false);
    }
  }, []);

  // --- Effective Status Logic (Minor update for camera status) ---
  const effectiveStatus: FeedbackStatus = useMemo(() => {
      if (status !== 'idle') return status;
      if (isDataLoading) return 'idle';
      if (hasCompletedAttendance) return 'info_checked_out';
      if (isHoliday) return 'info_holiday';
      // Show info_no_camera only after the check is complete and permission is false
      if (hasCameraPermission === false) return 'info_no_camera';
      return 'idle';
  }, [status, isDataLoading, hasCompletedAttendance, isHoliday, hasCameraPermission]);

  // Determine if the scanner should be visible.
  const showScanner = !isDataLoading && hasCameraPermission === true && !isHoliday && !hasCompletedAttendance;

  // --- handleAttendance Logic (No changes) ---
  const handleAttendance = useCallback(async () => {
    // ALL YOUR EXISTING LOGIC IS PRESERVED HERE
    setLocationError(null);
    if (!user || !firestore || !schoolConfig || !userData) {
        setStatus('error_generic');
        return toast({ title: 'Gagal', description: 'Data pengguna atau konfigurasi tidak siap.', variant: 'destructive' });
    }
    setStatus('processing');
    
    let isCheckInTime = false, isCheckOutTime = false;
    if (schoolConfig.useTimeValidation) {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [inStartH, inStartM] = schoolConfig.checkInStartTime.split(':').map(Number);
        const checkInStartTime = inStartH * 60 + inStartM;
        const [inEndH, inEndM] = schoolConfig.checkInEndTime.split(':').map(Number);
        const checkInEndTime = inEndH * 60 + inEndM;
        isCheckInTime = currentTime >= checkInStartTime && currentTime <= checkInEndTime;

        const dailyCheckoutConfig = schoolConfig.checkOutTimes?.[dayOfWeek];
        if (dailyCheckoutConfig && dailyCheckoutConfig.start && dailyCheckoutConfig.end) {
            const [outStartH, outStartM] = dailyCheckoutConfig.start.split(':').map(Number);
            const checkOutStartTime = outStartH * 60 + outStartM;
            const [outEndH, outEndM] = dailyCheckoutConfig.end.split(':').map(Number);
            const checkOutEndTime = outEndH * 60 + outEndM;
            isCheckOutTime = currentTime >= checkOutStartTime && currentTime <= checkOutEndTime;
        } else {
            if (schoolConfig.checkOutStartTime && schoolConfig.checkOutEndTime) {
                const [outStartH, outStartM] = schoolConfig.checkOutStartTime.split(':').map(Number);
                const checkOutStartTime = outStartH * 60 + outStartM;
                const [outEndH, outEndM] = schoolConfig.checkOutEndTime.split(':').map(Number);
                const checkOutEndTime = outEndH * 60 + outEndM;
                isCheckOutTime = currentTime >= checkOutStartTime && currentTime <= checkOutEndTime;
            }
        }
        
        if (!isCheckInTime && !isCheckOutTime) return setStatus('error_time');
    } else {
        if (todaysRecord && !todaysRecord.checkOutTime) {
            isCheckOutTime = true;
        } else {
            isCheckInTime = true;
        }
    }

    try {
        let latitude: number | null = null, longitude: number | null = null;
        if (schoolConfig.useLocationValidation) {
            setStatus('locating');
            try {
                const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
                latitude = pos.coords.latitude; longitude = pos.coords.longitude;
                if (schoolConfig.radius && schoolConfig.latitude && schoolConfig.longitude) {
                    if (getDistance(latitude, longitude, schoolConfig.latitude, schoolConfig.longitude) > schoolConfig.radius) return setStatus('error_radius');
                }
            } catch (error: any) {
                let specificError = 'Gagal mendapatkan lokasi. Pastikan GPS dan izin lokasi aktif.';
                if (error.code === 1) specificError = 'Akses lokasi ditolak. Izinkan di pengaturan perangkat.';
                setLocationError(specificError); return setStatus('error_location');
            }
        }

        setStatus('processing');
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        
        const denormalizedUserData = { userName: userData.name || null, userNip: userData.nip || null };

        if (isCheckInTime) {
            if (todaysRecord?.checkInTime) return setStatus('error_already_in');

            const [endH, endM] = schoolConfig.checkInEndTime.split(':').map(Number);
            const checkInDeadline = new Date(now); checkInDeadline.setHours(endH, endM, 0, 0);
            const description = isBefore(now, checkInDeadline) ? 'Hadir' : 'Terlambat';

            if (todaysRecord) {
                const recordRef = doc(firestore, 'users', user.uid, 'attendanceRecords', todaysRecord.id);
                await updateDoc(recordRef, { checkInTime: now, checkInLatitude: latitude, checkInLongitude: longitude, status: 'Hadir', description: description, ...denormalizedUserData });
            } else {
                await addDoc(collection(firestore, 'users', user.uid, 'attendanceRecords'), { userId: user.uid, date: todayStr, checkInTime: now, checkInLatitude: latitude, checkInLongitude: longitude, checkOutTime: null, status: 'Hadir', description: 'Belum Absen Pulang', ...denormalizedUserData });
            }
            setStatus('success_in');

        } else if (isCheckOutTime) {
            if (todaysRecord?.checkOutTime) return setStatus('error_already_out');

            if (todaysRecord) {
                const recordRef = doc(firestore, 'users', user.uid, 'attendanceRecords', todaysRecord.id);
                let finalDescription = 'Kehadiran Penuh';
                if (todaysRecord.checkInTime) {
                    const checkInTime = todaysRecord.checkInTime.toDate();
                    const [endH, endM] = schoolConfig.checkInEndTime.split(':').map(Number);
                    const checkInDeadline = new Date(checkInTime); checkInDeadline.setHours(endH, endM, 0, 0);
                    if (isBefore(checkInDeadline, checkInTime)) finalDescription = 'Terlambat';
                }
                await updateDoc(recordRef, { checkOutTime: now, checkOutLatitude: latitude, checkOutLongitude: longitude, description: finalDescription });
                setStatus('success_out');
            } else {
                await addDoc(collection(firestore, 'users', user.uid, 'attendanceRecords'), { userId: user.uid, date: todayStr, checkInTime: null, checkOutTime: now, checkOutLatitude: latitude, checkOutLongitude: longitude, status: 'Hadir', description: 'Tidak Absen Masuk', ...denormalizedUserData });
                setStatus('success_out');
            }
        }
    } catch (error) {
        console.error("Error during attendance handling:", error);
        setStatus('error_generic');
    }
  }, [user, firestore, schoolConfig, todaysRecord, toast, userData]);
  
  const statusRef = useRef(status); statusRef.current = status;

  // --- onScanSuccess Callback (Simplified) ---
  // This function is now passed as a prop to the QrScanner component
  const onScanSuccess = useCallback((decodedText: string) => {
    // Prevent multiple triggers
    if (statusRef.current !== 'idle') return;

    if (schoolConfig?.qrCodeValue) {
        if (decodedText === schoolConfig.qrCodeValue) {
            setScanSuccess(true);
            toast({ title: 'QR Code Terdeteksi' });
            handleAttendance(); // Call your existing logic
        } else {
            toast({ variant: 'destructive', title: 'QR Code Tidak Valid' });
        }
    }
  }, [schoolConfig, toast, handleAttendance]);

  const handleCloseRedirect = useCallback(() => {
    router.push('/dashboard'); 
  }, [router]);

  const handleOnClose = useMemo(() => {
    const isSuccessOrFinished = ['success_in', 'success_out', 'info_checked_out', 'info_holiday'].includes(effectiveStatus);
    return isSuccessOrFinished ? handleCloseRedirect : () => setStatus('idle');
  }, [effectiveStatus, handleCloseRedirect]);

  // --- Render Logic ---
  return (
    <PageWrapper>
      <div className="relative w-full bg-background" style={{ height: 'calc(100vh - 68px)' }}>
        
        {/* The dynamic QrScanner is rendered here */}
        {showScanner && <QrScanner onScanSuccess={onScanSuccess} scanSuccess={scanSuccess} />}

        {/* The loader for initial data fetching is simplified */}
        {isDataLoading && !showScanner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">Memuat data...</p>
          </div>
        )}

        {/* The status feedback overlay remains unchanged */}
        {effectiveStatus !== 'idle' && <StatusFeedbackOverlay status={effectiveStatus} locationError={locationError} onClose={handleOnClose} userData={userData} />}
      </div>
    </PageWrapper>
  );
}

// --- UI Sub-Components (No changes) ---
const StatusFeedbackOverlay = ({ status, locationError, onClose, userData }: { status: FeedbackStatus, locationError: string | null, onClose: () => void, userData: any }) => {
    const feedback = useMemo(() => {
        switch (status) {
            case 'processing': return { icon: <Loader2 className="h-16 w-16 animate-spin text-primary" />, title: 'Memproses...', desc: 'Sedang memvalidasi absensi Anda.', cardClass: 'bg-background/90' };
            case 'locating': return { icon: <Loader2 className="h-16 w-16 animate-spin text-primary" />, title: 'Mencari Lokasi...', desc: 'Mohon tunggu, sedang mendapatkan data lokasi.', cardClass: 'bg-background/90' };
            case 'success_in': return { icon: <CheckCircle className="h-16 w-16 text-green-500" />, title: 'Absen Masuk Berhasil', desc: 'Kehadiran Anda telah terekam. Selamat beraktivitas!', cardClass: 'bg-green-50 dark:bg-green-950/50 border-green-800' };
            case 'success_out': return { icon: <CheckCircle className="h-16 w-16 text-blue-500" />, title: 'Absen Pulang Berhasil', desc: 'Absen pulang terekam. Hati-hati di jalan!', cardClass: 'bg-blue-50 dark:bg-blue-950/50 border-blue-800' };
            case 'error_radius': return { icon: <MapPin className="h-16 w-16 text-destructive" />, title: 'Gagal: Di Luar Radius', desc: 'Anda harus berada di dalam area sekolah untuk absensi.', cardClass: 'bg-destructive/10 border-destructive' };
            case 'error_time': return { icon: <Clock className="h-16 w-16 text-destructive" />, title: 'Gagal: Di Luar Jam Absen', desc: 'Waktu absensi belum dibuka atau sudah ditutup.', cardClass: 'bg-destructive/10 border-destructive' };
            case 'error_already_in': return { icon: <X className="h-16 w-16 text-destructive" />, title: 'Gagal: Sudah Absen Masuk', desc: 'Anda sudah melakukan absensi masuk hari ini.', cardClass: 'bg-destructive/10 border-destructive' };
            case 'error_already_out': return { icon: <X className="h-16 w-16 text-destructive" />, title: 'Gagal: Sudah Absen Pulang', desc: 'Anda sudah melakukan absensi pulang hari ini.', cardClass: 'bg-destructive/10 border-destructive' };
            case 'error_location': return { icon: <MapPin className="h-16 w-16 text-destructive" />, title: 'Gagal: Lokasi Error', desc: locationError || 'Pastikan GPS aktif dan berikan izin akses.', cardClass: 'bg-destructive/10 border-destructive' };
            case 'info_holiday': return { icon: <CalendarOff className="h-16 w-16 text-blue-500" />, title: 'Hari Libur', desc: 'Sistem absensi tidak aktif hari ini.', cardClass: 'bg-blue-50 dark:bg-blue-950/50 border-blue-800' };
            case 'info_checked_out': return { icon: <CheckCircle className="h-16 w-16 text-green-500" />, title: 'Absensi Selesai', desc: 'Anda telah menyelesaikan absensi untuk hari ini.', cardClass: 'bg-green-50 dark:bg-green-950/50 border-green-800' };
            case 'info_no_camera': return { icon: <CameraOff className="h-16 w-16 text-destructive" />, title: 'Kamera Tidak Tersedia', desc: 'Izinkan akses kamera di pengaturan browser, lalu segarkan halaman ini.', cardClass: 'bg-destructive/10 border-destructive' };
            default: return { icon: <AlertTriangle className="h-16 w-16 text-destructive" />, title: 'Gagal: Terjadi Kesalahan', desc: 'Silakan coba lagi beberapa saat.', cardClass: 'bg-destructive/10 border-destructive' };
        }
    }, [status, locationError]);

    const showQuote = useMemo(() => (status === 'success_in' || status === 'success_out') && userData?.role !== 'admin', [status, userData]);
    const attendanceType = useMemo(() => {
        if (status === 'success_in') return 'in';
        if (status === 'success_out') return 'out';
        return null;
    }, [status]);

    if (status === 'idle') return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
            <Card className={cn("w-full max-w-xs text-center shadow-2xl m-4", feedback.cardClass)} onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-current/60 hover:text-current/90" onClick={onClose}><X className="h-5 w-5" /><span className="sr-only">Tutup</span></Button>
                <CardHeader className="items-center pt-8"><div className="mb-4">{feedback.icon}</div><CardTitle className="text-2xl font-bold">{feedback.title}</CardTitle></CardHeader>
                <CardContent className="pb-8">
                    <p className="text-muted-foreground ">{feedback.desc}</p>
                    {showQuote && attendanceType && <QuoteOfTheDay category={userData?.role} attendanceType={attendanceType} />}
                </CardContent>
            </Card>
        </div>
    );
};
