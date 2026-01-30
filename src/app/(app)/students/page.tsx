'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useData } from '@/context/data-context'
import type { Student } from '@/lib/types'
import { PlusCircle, Trash, Edit, Eye, ArrowRight } from 'lucide-react'
import { AddStudentForm, type StudentFormData } from './add-student-form'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function StudentDetails({ student }: { student: Student }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <Image
          alt="Student image"
          className="aspect-square rounded-md object-cover"
          height="128"
          src={student.photoUrl}
          width="128"
          data-ai-hint="student portrait"
        />
        <div className="grid gap-1">
          <h2 className="text-xl font-bold font-headline">{student.name}</h2>
          <p className="text-muted-foreground">
            {student.class} '{student.section}'
          </p>
          <Badge
            variant={student.status === 'Active' ? 'default' : 'secondary'}
          >
            {student.status}
          </Badge>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="grid gap-0.5">
          <p className="text-sm text-muted-foreground">Roll No.</p>
          <p>{student.rollNo}</p>
        </div>
        <div className="grid gap-0.5">
          <p className="text-sm text-muted-foreground">GR No.</p>
          <p>{student.grNo}</p>
        </div>
        <div className="grid gap-0.5">
          <p className="text-sm text-muted-foreground">Father's Name</p>
          <p>{student.fatherName}</p>
        </div>
        <div className="grid gap-0.5">
          <p className="text-sm text-muted-foreground">Mother's Name</p>
          <p>{student.motherName}</p>
        </div>
        <div className="grid gap-0.5">
          <p className="text-sm text-muted-foreground">Date of Birth</p>
          <p>{student.dob}</p>
        </div>
        <div className="grid gap-0.5">
          <p className="text-sm text-muted-foreground">Gender</p>
          <p>{student.gender}</p>
        </div>
        <div className="grid gap-0.5">
          <p className="text-sm text-muted-foreground">Mobile</p>
          <p>{student.mobile}</p>
        </div>
        <div className="grid gap-0.5">
          <p className="text-sm text-muted-foreground">Aadhaar</p>
          <p>{student.aadhaar || 'N/A'}</p>
        </div>
        <div className="grid gap-0.5 md:col-span-2">
          <p className="text-sm text-muted-foreground">Address</p>
          <p>{student.address}</p>
        </div>
      </div>
      {(student.lastSchool || student.lastSchoolYear || student.lastSchoolPercentage) && (
        <div className="pt-4 mt-4 border-t">
            <h3 className="text-md font-medium text-foreground mb-2">Previous School Details</h3>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="grid gap-0.5">
                    <p className="text-sm text-muted-foreground">Last School Attended</p>
                    <p>{student.lastSchool || 'N/A'}</p>
                </div>
                <div className="grid gap-0.5">
                    <p className="text-sm text-muted-foreground">Year of Leaving</p>
                    <p>{student.lastSchoolYear || 'N/A'}</p>
                </div>
                <div className="grid gap-0.5">
                    <p className="text-sm text-muted-foreground">Percentage (%)</p>
                    <p>{student.lastSchoolPercentage || 'N/A'}</p>
                </div>
            </div>
        </div>
    )}
    </div>
  )
}

function PromoteStudentsDialog({
  isOpen,
  onOpenChange,
  onPromote,
  classes,
  students,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPromote: (fromClass: string, toClass: string) => void,
  classes: string[],
  students: Student[],
}) {
  const [fromClass, setFromClass] = useState('')
  const [toClass, setToClass] = useState('')

  const handlePromote = () => {
    if (fromClass && toClass && fromClass !== toClass) {
      onPromote(fromClass, toClass)
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Selection',
        description:
          'Please select valid and different source and destination classes.',
      })
    }
  }

  const studentsInFromClass = useMemo(() => {
    return students.filter(s => s.class === fromClass).length;
  }, [fromClass, students]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Students</DialogTitle>
          <DialogDescription>
            Select the source and destination class to promote all students.
            Sections will be unassigned.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="from-class">From Class ({studentsInFromClass} students)</Label>
            <Select onValueChange={setFromClass} value={fromClass}>
              <SelectTrigger id="from-class">
                <SelectValue placeholder="Select source class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={`from-${c}`} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="to-class">To Class</Label>
            <Select onValueChange={setToClass} value={toClass}>
              <SelectTrigger id="to-class">
                <SelectValue placeholder="Select destination class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={`to-${c}`} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePromote} disabled={!fromClass || !toClass || studentsInFromClass === 0}>Promote Students</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function StudentsPage() {
  const { students, classes, addStudent, updateStudent, deleteStudent, isLoading } = useData()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Active')
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isPromoteOpen, setIsPromoteOpen] = useState(false)

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      let statusMatch
      if (statusFilter === 'Active') {
        // Treat students with no status as 'Active' for backward compatibility
        statusMatch = student.status === 'Active' || !student.status
      } else {
        statusMatch =
          statusFilter === 'All' || student.status === statusFilter
      }

      const searchMatch =
        searchQuery === '' ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toString().includes(searchQuery) ||
        student.grNo.toLowerCase().includes(searchQuery.toLowerCase())

      return statusMatch && searchMatch
    })
  }, [students, searchQuery, statusFilter])
  
  const classNames = useMemo(() => {
    return [...new Set(classes.map((c) => c.name))].sort()
  }, [classes])


  const handleOpenForm = (student: Student | null = null) => {
    setEditingStudent(student)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setEditingStudent(null)
    setIsFormOpen(false)
  }

  const handleAddStudent = (
    newStudentData: StudentFormData
  ) => {
    const studentPhotoPlaceholder =
      PlaceHolderImages.find((img) => img.id === 'student-photo-1')
        ?.imageUrl || 'https://picsum.photos/seed/picsum/64/64'

    const newStudent = {
      ...newStudentData,
      photoUrl: newStudentData.photoUrl || studentPhotoPlaceholder,
      rollNo: '',
      status: 'Active' as const,
      feesPaid: 0,
    }
    addStudent(newStudent);
    toast({
      title: 'Student Added',
      description: `${newStudent.name} has been added.`,
    })
    handleCloseForm()
  }

  const handleUpdateStudent = (updatedStudent: Student) => {
    updateStudent(updatedStudent);
    toast({
      title: 'Student Updated',
      description: `${updatedStudent.name}'s details have been updated.`,
    })
    handleCloseForm()
  }

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
    toast({
      title: 'Student Deleted',
      description: 'The student has been removed from the list.',
      variant: 'destructive',
    })
  }

  const handlePromoteStudents = (fromClass: string, toClass: string) => {
    const studentsToPromote = students.filter(s => s.class === fromClass);
    studentsToPromote.forEach(student => {
        updateStudent({ ...student, class: toClass, section: '' })
    });
    toast({
      title: 'Students Promoted',
      description: `Students from Class ${fromClass} have been promoted to Class ${toClass}. Please assign sections.`,
    })
    setIsPromoteOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline">Students</CardTitle>
            <CardDescription>
              Manage student profiles and information.
            </CardDescription>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
             <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Students</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="LC Issued">LC Issued</SelectItem>
                </SelectContent>
            </Select>
            <Input
              placeholder="Search by Name/Roll/GR No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setIsPromoteOpen(true)}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Promote
              </span>
            </Button>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => handleOpenForm()}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Student
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Roll No.</TableHead>
                <TableHead className="hidden md:table-cell">
                  GR No.
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length > 0 ? (
                 filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                    <TableCell className="hidden sm:table-cell">
                        <Image
                        alt="Student image"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={student.photoUrl}
                        width="64"
                        data-ai-hint="student portrait"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                        {student.class} '{student.section}'
                    </TableCell>
                     <TableCell>
                        <Badge variant={student.status === 'Active' || !student.status ? 'default' : 'destructive'}>
                            {student.status || 'Active'}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {student.rollNo}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {student.grNo}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewingStudent(student)}
                        >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenForm(student)}
                        >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the student's record.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                onClick={() => handleDeleteStudent(student.id)}
                                >
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No students found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Update the student's details below."
                : 'Fill in the details below to add a new student.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
            <AddStudentForm
              student={editingStudent}
              onStudentAdded={handleAddStudent}
              onStudentUpdated={handleUpdateStudent}
              onCancel={handleCloseForm}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewingStudent}
        onOpenChange={(open) => !open && setViewingStudent(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {viewingStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline">
                  Student Details
                </DialogTitle>
              </DialogHeader>
              <StudentDetails student={viewingStudent} />
            </>
          )}
        </DialogContent>
      </Dialog>

      <PromoteStudentsDialog
        isOpen={isPromoteOpen}
        onOpenChange={setIsPromoteOpen}
        onPromote={handlePromoteStudents}
        classes={classNames}
        students={students}
      />
    </>
  )
}
