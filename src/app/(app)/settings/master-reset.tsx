import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { useFirestore } from '@/firebase'
import { collection, getDocs, writeBatch } from 'firebase/firestore'

export function MasterReset() {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const firestore = useFirestore()

  const handleReset = async () => {
    if (username !== 'admin' || password !== 'reset123') {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Incorrect username or password.',
      })
      return
    }

    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Could not connect to the database.',
      })
      return
    }

    setIsResetting(true)
    toast({
      title: 'Resetting Application',
      description: 'Please wait, this may take a moment...',
    })

    try {
      const collectionsToDelete = [
        'students', 'teachers', 'classes', 'attendance', 
        'teacher_attendance', 'expenses', 'dead_stock', 
        'fee_payments', 'school_profile'
      ];
      
      const batch = writeBatch(firestore);

      for (const colPath of collectionsToDelete) {
        const colRef = collection(firestore, colPath);
        const snapshot = await getDocs(colRef);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();

      toast({
        title: 'Application Reset Successful',
        description: 'All data has been cleared. The page will now reload.',
      })

      // Give toast time to show
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error("Master reset failed:", error);
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: 'An error occurred while clearing the database.',
      })
      setIsResetting(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="font-headline text-destructive">
          Master Reset
        </CardTitle>
        <CardDescription>
          This will permanently delete all data from the database, including students, teachers,
          classes, fees, and settings, resetting the application to its
          original state. This action is irreversible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Perform Master Reset</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action is irreversible. Please type 'admin' and the master password to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={isResetting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isResetting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isResetting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReset} disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Reset Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
