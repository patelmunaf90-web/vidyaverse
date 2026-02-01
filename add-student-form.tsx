'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { Student } from '@/lib/types'
import { useRef, useState, useEffect } from 'react'
import { Upload, User } from 'lucide-react'
import Image from 'next/image'
import { useData } from '@/context/data-context'

export const formSchema = z.object({
  grNo: z.string().min(1, 'GR No. is required.'),
  name: z.string().min(2, 'Name is required.'),
  fatherName: z.string().min(2, "Father's name is required."),
  motherName: z.string().min(2, "Mother's name is required."),
  dob: z.string().min(1, 'Date of birth is required.'),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string().min(5, 'Address is required.'),
  class: z.string().min(1, 'Class is required.'),
  section: z.string().min(1, 'Section is required.'),
  rollNo: z.string().optional(),
  mobile: z.string().min(10, 'Mobile number is required.'),
  aadhaar: z.string().optional(),
  caste: z.string().optional(),
  lastSchool: z.string().optional(),
  lastSchoolYear: z.string().optional(),
  lastSchoolPercentage: z.string().optional(),
  photoUrl: z.string().optional(),
  totalFees: z.coerce.number().min(0, 'Total fees must be a positive number.'),
})

export type StudentFormData = z.infer<typeof formSchema>;


export function AddStudentForm({
  student,
  onStudentAdded,
  onStudentUpdated,
  onCancel,
}: {
  student?: Student | null
  onStudentAdded: (student: StudentFormData) => void
  onStudentUpdated: (student: Student) => void
  onCancel: () => void
}) {
  const { classes, students } = useData()
  const form = useForm<StudentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grNo: '',
      name: '',
      fatherName: '',
      motherName: '',
      dob: '',
      gender: 'Male',
      address: '',
      class: '',
      section: '',
      rollNo: '',
      mobile: '',
      aadhaar: '',
      caste: '',
      lastSchool: '',
      lastSchoolYear: '',
      lastSchoolPercentage: '',
      photoUrl: '',
      totalFees: 0,
    },
  })
  
  const [sections, setSections] = useState<string[]>([])
  const photoUrlValue = form.watch('photoUrl')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const isEditing = !!student;

  useEffect(() => {
    if (isEditing && student) {
        form.reset({
          ...student,
          grNo: student.grNo,
          rollNo: student.rollNo || '',
          totalFees: student.totalFees || 0,
          caste: student.caste || '',
          lastSchool: student.lastSchool || '',
          lastSchoolYear: student.lastSchoolYear || '',
          lastSchoolPercentage: student.lastSchoolPercentage || '',
        });
        const selectedClass = classes.find(c => c.name === student.class);
        setSections(selectedClass ? selectedClass.sections : []);
    } else {
        const nextGrNo = (students.reduce((max, s) => Math.max(max, parseInt(s.grNo) || 0), 0) + 1).toString().padStart(5, '0');
        form.reset({
          grNo: nextGrNo,
          name: '', fatherName: '', motherName: '', dob: '', gender: 'Male', address: '',
          class: '', section: '', rollNo: '', mobile: '', aadhaar: '', photoUrl: '', totalFees: 0,
          caste: '', lastSchool: '', lastSchoolYear: '', lastSchoolPercentage: ''
        });
        setSections([]);
    }
  }, [student, isEditing, form, classes, students]);


  function onSubmit(values: StudentFormData) {
    if (isEditing && student) {
        onStudentUpdated({
            ...student,
            ...values,
            rollNo: values.rollNo || '',
        })
    } else {
        onStudentAdded(values)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Image too large",
          description: "Please select an image smaller than 2MB.",
        });
        if(fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('photoUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassChange = (className: string) => {
    form.setValue('class', className);
    const selectedClass = classes.find(c => c.name === className);
    setSections(selectedClass ? selectedClass.sections : []);
    form.setValue('section', '');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>Student Photo</FormLabel>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
              {photoUrlValue ? (
                <Image
                  src={photoUrlValue}
                  alt="Student photo"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Attach Photo
            </Button>
          </div>
          <FormMessage />
        </FormItem>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Priya Patel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Suresh Patel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="motherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Mina Patel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input placeholder="DD/MM/YYYY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 123, Ganga Nagar, New Delhi"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select
                  onValueChange={handleClassChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={sections.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sections.map(s => (
                       <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           {isEditing && (
            <FormField
              control={form.control}
              name="rollNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll No.</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="grNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GR No.</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aadhaar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhaar Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="xxxx xxxx xxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="caste"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caste (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., General, OBC, SC, ST" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Previous School Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
            <FormField
              control={form.control}
              name="lastSchool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last School Attended</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABC Public School" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastSchoolYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Leaving</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastSchoolPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 85%" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
            control={form.control}
            name="totalFees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Annual Fees</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Save Changes" : "Add Student"}</Button>
        </div>
      </form>
    </Form>
  )
}
