import { PaginaCreditosSkeleton } from "@/components/ui/Skeleton";

// Aparece na hora ao entrar em /creditos, enquanto o Server Component espera o backend.
export default function Loading() {
  return <PaginaCreditosSkeleton />;
}
