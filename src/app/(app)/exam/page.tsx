'use client'

import { useState, useMemo, useCallback } from 'react'
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
import { useData } from '@/context/data-context'
import type { Student } from '@/lib/types'
import { DocumentPreview } from '@/components/document-preview'
import { FileCheck, Plus, Trash2, Wand2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSchoolProfile } from '@/context/school-profile-context'
import { toast } from '@/hooks/use-toast'
import { generateMarksheetHtml } from '@/lib/document-templates'

type Mark = {
  id: number
  subject: string
  theoryMax: string
  theoryGot: string
  practicalMax: string
  practicalGot: string
}

export default function ExamPage() {
  const { students } = useData()
  const { schoolProfile } = useSchoolProfile()

  const [examName, setExamName] = useState('Annual Examination 2024-25')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [marks, setMarks] = useState<Mark[]>([
    {
      id: 1,
      subject: 'English',
      theoryMax: '100',
      theoryGot: '',
      practicalMax: '0',
      practicalGot: '',
    },
    {
      id: 2,
      subject: 'Hindi',
      theoryMax: '100',
      theoryGot: '',
      practicalMax: '0',
      practicalGot: '',
    },
    {
      id: 3,
      subject: 'Mathematics',
      theoryMax: '100',
      theoryGot: '',
      practicalMax: '0',
      practicalGot: '',
    },
    {
      id: 4,
      subject: 'Science',
      theoryMax: '70',
      theoryGot: '',
      practicalMax: '30',
      practicalGot: '',
    },
    {
      id: 5,
      subject: 'Social Science',
      theoryMax: '100',
      theoryGot: '',
      practicalMax: '0',
      practicalGot: '',
    },
  ])
  const [generatedHtml, setGeneratedHtml] = useState('')

  const classes = useMemo(() => {
    const activeStudents = students.filter(
      (s) => s.status === 'Active' || !s.status
    )
    const allClasses = activeStudents.map((s) => `${s.class} '${s.section}'`)
    return [...new Set(allClasses)].sort()
  }, [students])

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return []
    const [className, sectionWithQuote] = selectedClass.split(" '")
    const section = sectionWithQuote.replace("'", '')
    return students
      .filter(
        (s) =>
          s.class === className &&
          s.section === section &&
          (s.status === 'Active' || !s.status)
      )
      .sort((a, b) => parseInt(a.rollNo) - parseInt(b.rollNo))
  }, [selectedClass, students])

  const handleAddSubject = useCallback(() => {
    setMarks((prev) => [
      ...prev,
      {
        id: Date.now(),
        subject: '',
        theoryMax: '100',
        theoryGot: '',
        practicalMax: '0',
        practicalGot: '',
      },
    ])
  }, [])

  const handleRemoveSubject = useCallback((id: number) => {
    setMarks((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const handleMarkChange = (
    id: number,
    field: keyof Omit<Mark, 'id'>,
    value: string
  ) => {
    setMarks((prevMarks) =>
      prevMarks.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const handleGenerateMarksheet = () => {
    const student = students.find((s) => s.id === selectedStudentId)
    if (!student) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a student first.',
      })
      return
    }
    const html = generateMarksheetHtml(student, schoolProfile, examName, marks)
    setGeneratedHtml(html)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        {generatedHtml ? (
          <DocumentPreview htmlContent={generatedHtml} />
        ) : (
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Wand2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-headline text-foreground mb-2">
                Marksheet Preview
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Fill in the details and generate a marksheet. The preview will
                appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generate Marksheet</CardTitle>
          <CardDescription>
            Enter student marks to generate a professional report card.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Name</label>
            <Input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g., Annual Examination 2024-25"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select onValueChange={setSelectedClass} value={selectedClass}>
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Student</label>
              <Select
                onValueChange={setSelectedStudentId}
                value={selectedStudentId}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {studentsInClass.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.rollNo}. {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Enter Marks</h3>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Subject</TableHead>
                    <TableHead className="w-[120px]">Theory Got</TableHead>
                    <TableHead className="w-[120px]">Theory Max</TableHead>
                    <TableHead className="w-[120px]">Practical Got</TableHead>
                    <TableHead className="w-[120px]">Practical Max</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((mark) => (
                    <TableRow key={mark.id}>
                      <TableCell>
                        <Input
                          placeholder="Subject Name"
                          value={mark.subject}
                          onChange={(e) =>
                            handleMarkChange(mark.id, 'subject', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Got"
                          value={mark.theoryGot}
                          onChange={(e) =>
                            handleMarkChange(
                              mark.id,
                              'theoryGot',
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={mark.theoryMax}
                          onChange={(e) =>
                            handleMarkChange(
                              mark.id,
                              'theoryMax',
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Got"
                          value={mark.practicalGot}
                          onChange={(e) =>
                            handleMarkChange(
                              mark.id,
                              'practicalGot',
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={mark.practicalMax}
                          onChange={(e) =>
                            handleMarkChange(
                              mark.id,
                              'practicalMax',
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSubject(mark.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSubject}
              className="mt-2 gap-1"
            >
              <Plus className="h-4 w-4" /> Add Subject
            </Button>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleGenerateMarksheet}>
              <FileCheck className="mr-2 h-4 w-4" /> Generate Marksheet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
