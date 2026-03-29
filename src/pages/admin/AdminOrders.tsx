import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAction } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const AdminOrders = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () => adminAction("list_all_orders", { page, perPage: 20 }),
  });

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Oversight</h2>
        <Badge variant="secondary">{total} total orders</Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: { id: string; customer_name: string; customer_email: string; total: number; status: string; created_at: string; order_items?: unknown[] }) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}…</TableCell>
                    <TableCell>{o.customer_name}</TableCell>
                    <TableCell>{o.customer_email}</TableCell>
                    <TableCell className="font-medium">${Number(o.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={o.status === "confirmed" ? "default" : "secondary"}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(o.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>{o.order_items?.length ?? 0} items</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="flex items-center text-sm text-muted-foreground">Page {page}</span>
            <Button variant="outline" size="sm" disabled={orders.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrders;
