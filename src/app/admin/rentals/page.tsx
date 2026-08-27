import { listOpenRentalsForAdmin } from "@/lib/db/rentals";
import RentalsTable from "@/components/admin/RentalsTable";

export default async function AdminRentalsPage() {
  const rentals = await listOpenRentalsForAdmin();
  return <RentalsTable initialRentals={rentals} />;
}
