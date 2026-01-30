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
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useRef, useEffect } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useSchoolProfile } from '@/context/school-profile-context'
import { Skeleton } from '@/components/ui/skeleton'

const formSchema = z.object({
  name: z.string().min(1, 'School name is required.'),
  affiliationNo: z.string().min(1, 'Affiliation number is required.'),
  schoolCode: z.string().min(1, 'School code is required.'),
  udiseCode: z.string().min(1, 'U-DISE code is required.'),
  address: z.string().min(1, 'Address is required.'),
  logoUrl: z.string().optional(),
  principalName: z.string().min(1, "Principal's name is required."),
  academicYear: z.string().min(1, "Academic year is required."),
})

export function SchoolProfileForm() {
  const { schoolProfile, updateSchoolProfile, isLoading } = useSchoolProfile()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: schoolProfile,
  })

  // When schoolProfile from context changes, reset the form
  useEffect(() => {
    if(!isLoading) {
      form.reset(schoolProfile)
    }
  }, [schoolProfile, form, isLoading])

  const logoUrlValue = form.watch('logoUrl')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateSchoolProfile(values)
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
        form.setValue('logoUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
       <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-md" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="flex justify-end pt-4">
           <Skeleton className="h-10 w-28" />
        </div>
      </div>
    )
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormItem>
          <FormLabel>School Logo</FormLabel>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
              {logoUrlValue ? (
                <Image
                  src={logoUrlValue}
                  alt="School logo"
                  width={96}
                  height={96}
                  className="object-contain w-full h-full"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
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
              Upload Logo
            </Button>
          </div>
          <FormMessage />
        </FormItem>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="principalName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Principal's Name</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="academicYear"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Academic Year</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., 2024-2025" {...field} />
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
              <FormLabel>Full Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="affiliationNo"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Affiliation No.</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="schoolCode"
            render={({ field }) => (
                <FormItem>
                <FormLabel>School Code</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="udiseCode"
            render={({ field }) => (
                <FormItem>
                <FormLabel>U-DISE Code</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  )
}
