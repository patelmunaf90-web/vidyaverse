'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IndianRupee, Wallet, MessageSquareText } from 'lucide-react'
import { useData } from '@/context/data-context'
import type { Student } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { useSchoolProfile } from '@/context/school-profile-context'
import { format } from 'date-fns'
import { generateFeeReceiptForPayment } from '@/lib/document-templates'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const handlePrint = (htmlContent: string) => {
  const printWindow = window.open('', '', 'height=800,width=600')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    // Use a timeout to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

export default function FeesPage() {
  const { students, updateStudent, isLoading, addFeePayment } = useData()
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false)
  const [amountToCollect, setAmountToCollect] = useState<number | ''>('')
  const { schoolProfile } = useSchoolProfile()
  const [searchQuery, setSearchQuery] = useState('')

  const classes = useMemo(() => {
    const allClasses = students.map((s) => `${s.class} '${s.section}'`)
    return [...new Set(allClasses)].sort()
  }, [students])

  const handleClassChange = (value: string) => {
    setSelectedClass(value)
    setSearchQuery('')
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setSelectedClass('')
  }

  const filteredStudents = useMemo(() => {
    if (!selectedClass && !searchQuery) {
      return []
    }

    let studentsToList: Student[] = []

    if (searchQuery) {
      studentsToList = students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.rollNo && s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
          s.grNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedClass) {
      const [className, sectionWithQuote] = selectedClass.split(" '")
      const section = sectionWithQuote.replace("'", '')
      studentsToList = students.filter(
        (s) => s.class === className && s.section === section
      )
    }

    return studentsToList.sort((a, b) => {
      if (a.class.localeCompare(b.class) !== 0)
        return a.class.localeCompare(b.class)
      if (a.section.localeCompare(b.section) !== 0)
        return a.section.localeCompare(b.section)
      const rollA = parseInt(a.rollNo)
      const rollB = parseInt(b.rollNo)
      if (isNaN(rollA) || isNaN(rollB)) return a.name.localeCompare(b.name)
      return rollA - rollB
    })
  }, [selectedClass, searchQuery, students])

  const { totalCollected, totalPending } = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        acc.totalCollected += student.feesPaid
        acc.totalPending += student.totalFees - student.feesPaid
        return acc
      },
      { totalCollected: 0, totalPending: 0 }
    )
  }, [students])

  const getFeeStatus = (
    student: Student
  ): {
    status: 'Paid' | 'Partially Paid' | 'Unpaid'
    variant: 'default' | 'secondary' | 'destructive'
  } => {
    const pending = student.totalFees - student.feesPaid
    if (pending <= 0) {
      return { status: 'Paid', variant: 'default' }
    }
    if (student.feesPaid > 0) {
      return { status: 'Partially Paid', variant: 'secondary' }
    }
    return { status: 'Unpaid', variant: 'destructive' }
  }

  const handleOpenCollectFee = (student: Student) => {
    setSelectedStudent(student)
    const pendingAmount = student.totalFees - student.feesPaid
    setAmountToCollect(pendingAmount > 0 ? pendingAmount : '')
    setIsCollectFeeOpen(true)
  }

  const handleCollectFee = () => {
    if (!selectedStudent || amountToCollect === '' || +amountToCollect <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to collect.',
      })
      return
    }

    const currentPaid = selectedStudent.feesPaid
    const totalFees = selectedStudent.totalFees
    const newPaidAmount = currentPaid + +amountToCollect
    const amount = +amountToCollect

    if (newPaidAmount > totalFees) {
      toast({
        variant: 'destructive',
        title: 'Amount Exceeds Total',
        description: `Cannot collect more than the total fees of ₹${totalFees.toLocaleString(
          'en-IN'
        )}.`,
      })
      return
    }

    addFeePayment({
      studentId: selectedStudent.id,
      amount: amount,
      date: format(new Date(), 'yyyy-MM-dd'),
      receiptNo: Date.now().toString(),
    })

    updateStudent({ ...selectedStudent, feesPaid: newPaidAmount })

    toast({
      title: 'Fee Collected',
      description: `Successfully collected ₹${amount.toLocaleString('en-IN')} from ${
        selectedStudent.name
      }.`,
    })

    const receiptHtml = generateFeeReceiptForPayment(
      selectedStudent,
      amount,
      schoolProfile
    )
    handlePrint(receiptHtml)

    setIsCollectFeeOpen(false)
    setSelectedStudent(null)
    setAmountToCollect('')
  }
  
  const handleSendWhatsAppReminder = (student: Student) => {
    if (!schoolProfile) {
        toast({
            variant: 'destructive',
            title: 'School Profile Not Loaded',
            description: 'Please wait for the school profile to load and try again.',
        });
        return;
    }

    const pendingAmount = student.totalFees - student.feesPaid;
    if (pendingAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'No Dues',
        description: `${student.name} has no pending fees.`,
      });
      return;
    }

    // Basic validation and formatting for Indian mobile numbers
    let mobileNumber = student.mobile.replace(/[^0-9]/g, '');
    if (mobileNumber.length > 10) {
        mobileNumber = mobileNumber.slice(-10);
    }
    
    if (mobileNumber.length !== 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Mobile Number',
        description: `Cannot send reminder to ${student.name}. The number is invalid.`,
      });
      return;
    }
    
    const fullNumber = `91${mobileNumber}`;
    
    const message = `Dear Parent of ${student.name},\nThis is a friendly reminder from ${schoolProfile.name} that your pending fee amount is ₹${pendingAmount.toLocaleString('en-IN')}.\nPlease clear the dues at your earliest convenience.\nThank you.`;

    const whatsappUrl = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    toast({
      title: 'WhatsApp Opened',
      description: `A reminder message for ${student.name} is ready to be sent.`,
    });
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Fees Collected
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              all students, all time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Fees Pending
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">across all students</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-headline">Student Fee Status</CardTitle>
          <CardDescription>
            Select a class or search for a student to view and manage fee
            payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select onValueChange={handleClassChange} value={selectedClass}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    Class {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search by GR No, Roll No, or Name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full sm:w-[240px]"
            />
          </div>

          {filteredStudents.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead className="text-right">Total Fees</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const { status, variant } = getFeeStatus(student)
                      const pendingAmount =
                        student.totalFees - student.feesPaid
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.rollNo}</TableCell>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={variant}>{status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{student.totalFees.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{student.feesPaid.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            ₹
                            {pendingAmount > 0
                              ? pendingAmount.toLocaleString('en-IN')
                              : '0'}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenCollectFee(student)}
                                disabled={pendingAmount <= 0}
                              >
                                Collect Fee
                              </Button>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9"
                                      onClick={() => handleSendWhatsAppReminder(student)}
                                      disabled={pendingAmount <= 0}
                                    >
                                      <MessageSquareText className="h-4 w-4" />
                                      <span className="sr-only">Send WhatsApp Reminder</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Send WhatsApp Reminder</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-[400px]">
              <IndianRupee className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-headline text-foreground mb-2">
                View Student Fees
              </h3>
              <p className="text-muted-foreground max-w-xs">
                Select a class, or search for a student by GR No, Roll No, or
                Name to see their fee status.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCollectFeeOpen} onOpenChange={setIsCollectFeeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline">
                  Collect Fee from {selectedStudent.name}
                </DialogTitle>
                <DialogDescription>
                  Total pending amount: ₹
                  {(
                    selectedStudent.totalFees - selectedStudent.feesPaid
                  ).toLocaleString('en-IN')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amountToCollect}
                    onChange={(e) =>
                      setAmountToCollect(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    placeholder="Enter amount"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCollectFeeOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" onClick={handleCollectFee}>
                  Save Payment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
