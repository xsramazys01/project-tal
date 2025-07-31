"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminUsers } from "@/hooks/use-admin"
import { Search, Ban, Trash2, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AdminUserManagement() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendUntil, setSuspendUntil] = useState("")
  const { users, total, loading, error, updateUserRole, suspendUser, unsuspendUser, deleteUser } = useAdminUsers(
    page,
    10,
    search,
  )
  const { toast } = useToast()

  const handleRoleUpdate = async (userId: string, newRole: "user" | "admin" | "super_admin") => {
    const success = await updateUserRole(userId, newRole)
    if (success) {
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      })
    }
  }

  const handleSuspendUser = async (userId: string) => {
    if (!suspendReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for suspension.",
        variant: "destructive",
      })
      return
    }

    const until = suspendUntil ? new Date(suspendUntil) : undefined
    const success = await suspendUser(userId, suspendReason, until)

    if (success) {
      toast({
        title: "User Suspended",
        description: "User has been suspended successfully.",
      })
      setSuspendReason("")
      setSuspendUntil("")
      setSelectedUser(null)
    } else {
      toast({
        title: "Error",
        description: "Failed to suspend user.",
        variant: "destructive",
      })
    }
  }

  const handleUnsuspendUser = async (userId: string) => {
    const success = await unsuspendUser(userId)
    if (success) {
      toast({
        title: "User Unsuspended",
        description: "User has been unsuspended successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to unsuspend user.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    const success = await deleteUser(userId)
    if (success) {
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Users...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Users</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Export Users</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Tasks</th>
                  <th className="text-left p-4 font-medium">Last Active</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.full_name || "No Name"}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Select value={user.role} onValueChange={(value) => handleRoleUpdate(user.id, value as any)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      {user.suspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{user.taskCount} total</div>
                        <div className="text-gray-600">{user.completedTaskCount} completed</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {user.suspended ? (
                          <Button size="sm" variant="outline" onClick={() => handleUnsuspendUser(user.id)}>
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                                <Ban className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Suspend User</DialogTitle>
                                <DialogDescription>
                                  Suspend {user.full_name || user.email} from accessing the platform.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reason">Reason for suspension</Label>
                                  <Textarea
                                    id="reason"
                                    value={suspendReason}
                                    onChange={(e) => setSuspendReason(e.target.value)}
                                    placeholder="Enter reason for suspension..."
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="until">Suspend until (optional)</Label>
                                  <Input
                                    id="until"
                                    type="datetime-local"
                                    value={suspendUntil}
                                    onChange={(e) => setSuspendUntil(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={() => handleSuspendUser(user.id)} variant="destructive">
                                    Suspend User
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedUser(null)
                                      setSuspendReason("")
                                      setSuspendUntil("")
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} users
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page * 10 >= total}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
