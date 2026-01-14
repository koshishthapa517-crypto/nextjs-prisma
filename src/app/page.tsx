"use client";
import {signIn, signOut, useSession} from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image";

export default function Page() {
     const { data: session, status } = useSession();
     
     if (status === "loading") {
        return (
            <div className='flex flex-col h-screen justify-center items-center gap-4'>
              <Spinner/>
                <p>Loading...</p>
                
            </div>
        );
     }
     
     return (
        <div className='w-full min-h-screen'>
            {status === "unauthenticated" && (
                <div className='flex flex-col h-screen justify-center items-center gap-4'>
                    <button
                        className='cursor-pointer bg-lime-400 px-4 py-2 rounded-md text-black hover:bg-blue-600 transition-colors'
                        onClick={() => signIn("google")}
                    >
                        Login with Google
                    </button>
                </div>
            )}

            {status === "authenticated" && (
                <div className='flex flex-col items-start gap-6 p-4'>
                    <div className='w-full flex justify-between items-center'>
                        <div>
                            <h1 className='text-2xl font-bold'>Welcome!</h1>
                            <p className='text-gray-600'>Logged In as: {session?.user?.name}</p>
                            <p className='text-sm text-gray-500'>{session?.user?.email}</p>
                        </div>
                        <button
                            className='cursor-pointer bg-red-500 px-6 py-2 rounded-md text-white hover:bg-red-600 transition-colors'
                            onClick={() => signOut()}
                        >
                            Logout
                        </button>
                    </div>
                    <UsersPage />
                </div>
            )}
        </div>
    )
  }

interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  age?: number;
  profilepic: string;
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await axios.get("/api/users");
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const submit = async () => {
    setSubmitting(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";

      // Filter out id and other non-updatable fields
      const { id, createdAt, updatedAt, ...submitData } = form;

      let response:any;
      if (method === "POST") {
        response = await axios.post(url, submitData);
        setUsers([response.data, ...users]);
      } else {
        response = await axios.put(url, submitData);
        setUsers(users.map((u) => (u.id === editingId ? response.data : u)));
      }

      setForm({});
      setEditingId(null);
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error submitting form:", error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (user: User) => {
    setEditingId(user.id);
    setForm(user);
    setDialogOpen(true);
  };

  const remove = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (error: any) {
      console.error("Error deleting user:", error.response?.data || error.message);
    }
  };

  const removeAll = async () => {
    if (!window.confirm("Are you sure you want to delete all users? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete("/api/users");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting all users:", error.response?.data || error.message);
    }
  };

  if (loading) return <p className=""><Spinner/>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {/* BUTTONS */}
      <div className="flex gap-220 mb-6">
        <Dialog open={editingId === null && dialogOpen} onOpenChange={(open) => {
          if (!open) {
            setForm({});
            setEditingId(null);
          }
          setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. Fill in all the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Username"
                  value={form.username || ""}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  placeholder="Full Name"
                  value={form.fullname || ""}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  placeholder="Age"
                  type="number"
                  value={form.age || ""}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profilepic">Profile Picture URL</Label>
                <Input
                  id="profilepic"
                  placeholder="Profile Pic URL"
                  value={form.profilepic || ""}
                  onChange={(e) => setForm({ ...form, profilepic: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={submit}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="destructive" onClick={removeAll}>
          Delete All Users
        </Button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-225 w-full border">
          <thead className="bg-black text-white sticky top-0 z-10">
            <tr>
              <th className="border">Profile</th>
              <th className="border">Username</th>
              <th className="border">Full Name</th>
              <th className="border">Email</th>
              <th className="border">Age</th>
              <th className="border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border p-2">
                  <img
                    height={40}
                    width={40}
                    src={u.profilepic}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="border p-2">{u.username}</td>
                <td className="border p-2">{u.fullname}</td>
                <td className="border p-2 break-all">{u.email}</td>
                <td className="border p-2">{u.age ?? "-"}</td>
                <td className="border p-3 flex justify-center gap-2">
                  <Dialog open={editingId === u.id && dialogOpen} onOpenChange={(open) => {
                    if (!open) {
                      setForm({});
                      setEditingId(null);
                    }
                    setDialogOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => edit(u)}>Edit</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-106.25">
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                          Make changes to the user details below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-username">Username</Label>
                          <Input
                            id="edit-username"
                            placeholder="Username"
                            value={form.username || ""}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-fullname">Full Name</Label>
                          <Input
                            id="edit-fullname"
                            placeholder="Full Name"
                            value={form.fullname || ""}
                            onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            placeholder="Email"
                            type="email"
                            value={form.email || ""}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-age">Age</Label>
                          <Input
                            id="edit-age"
                            placeholder="Age"
                            type="number"
                            value={form.age || ""}
                            onChange={(e) => setForm({ ...form, age: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-profilepic">Profile Picture URL</Label>
                          <Input
                            id="edit-profilepic"
                            placeholder="Profile Pic URL"
                            value={form.profilepic || ""}
                            onChange={(e) => setForm({ ...form, profilepic: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={submit} disabled={submitting}>{submitting && <Spinner/>}Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" onClick={() => remove(u.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}