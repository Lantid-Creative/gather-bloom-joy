import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAction } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => adminAction("list_users", { page, perPage: 20 }),
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => adminAction("ban_user", { user_id: userId }),
    onSuccess: () => {
      toast.success("User banned");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => adminAction("unban_user", { user_id: userId }),
    onSuccess: () => {
      toast.success("User unbanned");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminAction("delete_user", { user_id: userId }),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Badge variant="secondary">{total} total users</Badge>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: { id: string; email: string; created_at: string; banned_until?: string; user_metadata?: { full_name?: string } }) => {
                  const isBanned = !!u.banned_until && new Date(u.banned_until) > new Date();
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>{u.user_metadata?.full_name || "—"}</TableCell>
                      <TableCell>{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500 text-green-600">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {isBanned ? (
                          <Button size="sm" variant="outline" onClick={() => unbanMutation.mutate(u.id)}>
                            Unban
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => banMutation.mutate(u.id)}>
                            Ban
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {u.email} and all their data. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(u.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="flex items-center text-sm text-muted-foreground">Page {page}</span>
            <Button variant="outline" size="sm" disabled={users.length < 20} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
