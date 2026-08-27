import { listItems } from "@/lib/db/items";
import InventoryTable from "@/components/admin/InventoryTable";

export default async function AdminInventoryPage() {
  const items = await listItems();
  return <InventoryTable initialItems={items} />;
}
