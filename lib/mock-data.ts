export type VacationStatus = "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";

export interface VacationRequest {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  days: number;
  status: VacationStatus;
  gradient: string;
}

export const balanceSummary = {
  totalDays: 22,
  usedDays: 8,
  pendingDays: 3,
  availableDays: 11,
};

export const vacationRequests: VacationRequest[] = [
  {
    id: "1",
    title: "Escapada a la costa",
    location: "Valencia, España",
    startDate: "2026-08-10",
    endDate: "2026-08-15",
    days: 5,
    status: "PENDING",
    gradient: "from-rose-400 via-orange-300 to-amber-200",
  },
  {
    id: "2",
    title: "Semana en la montaña",
    location: "Pirineos, España",
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    days: 6,
    status: "APPROVED",
    gradient: "from-emerald-400 via-teal-300 to-cyan-200",
  },
  {
    id: "3",
    title: "Puente de diciembre",
    location: "Lisboa, Portugal",
    startDate: "2026-12-06",
    endDate: "2026-12-09",
    days: 3,
    status: "DRAFT",
    gradient: "from-violet-400 via-purple-300 to-fuchsia-200",
  },
  {
    id: "4",
    title: "Verano en familia",
    location: "Málaga, España",
    startDate: "2026-07-20",
    endDate: "2026-07-27",
    days: 7,
    status: "APPROVED",
    gradient: "from-sky-400 via-blue-300 to-indigo-200",
  },
  {
    id: "5",
    title: "Retiro de bienestar",
    location: "Ibiza, España",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    days: 4,
    status: "REJECTED",
    gradient: "from-pink-400 via-rose-300 to-red-200",
  },
  {
    id: "6",
    title: "City break",
    location: "París, Francia",
    startDate: "2026-11-14",
    endDate: "2026-11-17",
    days: 3,
    status: "PENDING",
    gradient: "from-amber-400 via-yellow-300 to-lime-200",
  },
];

export const statusLabels: Record<VacationStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  DRAFT: "Borrador",
};

export const filterOptions = [
  { id: "all", label: "Todas" },
  { id: "PENDING", label: "Pendientes" },
  { id: "APPROVED", label: "Aprobadas" },
  { id: "DRAFT", label: "Borradores" },
  { id: "REJECTED", label: "Rechazadas" },
] as const;
