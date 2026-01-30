'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useData } from '@/context/data-context'
import { Activity, IndianRupee, Users } from 'lucide-react'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, where } from 'firebase/firestore'
import { format } from 'date-fns'
import type { Attendance } from '@/lib/types'

function FeesSummaryChart({ data }: { data: any[] }) {
  const chartConfig = {
    collected: {
      label: 'Collected',
      color: 'hsl(var(--chart-2))',
    },
    pending: {
      label: 'Pending',
      color: 'hsl(var(--chart-5))',
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Class-wise Fee Summary</CardTitle>
        <CardDescription>Collected vs. Pending Fees</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} accessibilityLayer>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => `₹${value / 1000}k`}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="collected"
                fill="var(--color-collected)"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                fill="var(--color-pending)"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function DailyAttendanceChart({ data }: { data: any[] }) {
    const chartConfig = {
        students: {
        label: 'Students',
        },
        ...data.reduce((acc, cur) => {
            acc[cur.name] = { label: cur.name, color: cur.fill };
            return acc;
        }, {})
    } satisfies ChartConfig;

    return (
        <Card>
        <CardHeader>
            <CardTitle className="font-headline">Daily Attendance Summary</CardTitle>
            <CardDescription>Present vs. Absent for active students today</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer
            config={chartConfig}
            className="min-h-[250px] w-full"
            >
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
            </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
        </Card>
    )
}


export default function DashboardPage() {
  const { students, teachers } = useData()
  const firestore = useFirestore()

  const todayString = format(new Date(), 'yyyy-MM-dd');
  const attendanceQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'attendance'), where('date', '==', todayString)) : null,
    [firestore, todayString]
  );
  const { data: attendanceToday } = useCollection<Attendance>(attendanceQuery);


  const {
    totalStudents,
    totalTeachers,
    presentToday,
    absentToday,
    feesCollected,
    feesPending,
    feeSummaryByClass,
    dailyAttendanceData,
  } = useMemo(() => {
    const activeStudents = students.filter(s => s.status === 'Active' || !s.status);
    const totalStudents = activeStudents.length
    const totalTeachers = teachers.filter(t => t.status === 'Active').length
    
    // Create a Set of active student IDs for quick lookup
    const activeStudentIds = new Set(activeStudents.map(s => s.id));

    // Filter today's attendance records for active students only
    const activeStudentAttendanceToday = attendanceToday?.filter(a => activeStudentIds.has(a.studentId)) || [];
    
    const presentToday = activeStudentAttendanceToday.filter(a => a.status === 'present').length;
    const absentToday = activeStudentAttendanceToday.filter(a => a.status === 'absent').length;

    const { feesCollected, feesPending } = students.reduce((acc, s) => {
        acc.feesCollected += s.feesPaid;
        acc.feesPending += s.totalFees - s.feesPaid;
        return acc;
    }, { feesCollected: 0, feesPending: 0 });

    const summary = activeStudents.reduce((acc, student) => {
        if(!acc[student.class]) {
            acc[student.class] = { name: `Class ${student.class}`, collected: 0, pending: 0 };
        }
        acc[student.class].collected += student.feesPaid;
        acc[student.class].pending += student.totalFees - student.feesPaid;
        return acc;
    }, {} as Record<string, {name: string, collected: number, pending: number}>);
    
    const dailyAttendanceData = [
        { name: 'Present', value: presentToday, fill: 'hsl(var(--chart-2))' },
        { name: 'Absent', value: absentToday, fill: 'hsl(var(--chart-5))' }
    ].filter(item => item.value > 0);


    return {
      totalStudents,
      totalTeachers,
      presentToday,
      absentToday,
      feesCollected,
      feesPending,
      feeSummaryByClass: Object.values(summary),
      dailyAttendanceData
    }
  }, [students, teachers, attendanceToday])


  return (
    <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold font-headline">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                    in the current academic year
                </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold font-headline">{totalTeachers}</div>
                <p className="text-xs text-muted-foreground">across all departments</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold font-headline">{presentToday}</div>
                <p className="text-xs text-muted-foreground">
                    {absentToday} absent
                </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fees Collection</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold font-headline">
                    ₹{feesCollected.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground">
                    ₹{feesPending.toLocaleString('en-IN')} pending
                </p>
                </CardContent>
            </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FeesSummaryChart data={feeSummaryByClass} />
            <DailyAttendanceChart data={dailyAttendanceData} />
        </div>
    </div>
  )
}
