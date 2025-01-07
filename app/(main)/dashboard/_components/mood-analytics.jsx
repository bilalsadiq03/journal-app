"use client";
import { getAnalytics } from '@/actions/analytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useFetch from '@/hooks/useFetch';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react'
import AnalyticsLoading from './analytics-loading';
import MoodAnalyticsSkeleton from './analytics-loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMoodById, getMoodTrend } from '@/app/lib/moods';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';


const timeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '15d', label: 'Last 15 days' },
  { value: '30d', label: 'Last 30 days' },
]

const MoodAnalytics = () => {

  const [period, setPeriod] = useState("7d");

  const {
    loading,
    data: analytics,
    fn: fetchAnalytics
  } = useFetch(getAnalytics);

  

  const { isLoaded } = useUser();

  useEffect((period) => {
    fetchAnalytics(period);
  }, [period]);

  if ( loading || !analytics?.data || !isLoaded ){
    return <MoodAnalyticsSkeleton />
  }

  const { timeline, stats} = analytics?.data;

  const CustomToolTip = ({ active, payload, label }) => {
    if (active && payload?.length){
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="font-medium">{format(parseISO(label), "MMM d, yyyy")}</p>
          <p className="text-orange-600">Average Mood: {payload[0].value}</p>
          <p className="text-blue-600">Entries: {payload[1].value}</p>
        </div>
      )
    }
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-5xl font-bold gradient-title">Dashboard</h2>

         <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-sm">
                Total Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalEntries}</p>
              <p className="text-xs text-muted-foreground">
                ~ {stats.dailyAverage} entries per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-sm">
                Average Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.averageScore}/10</p>
              <p className="text-xs text-muted-foreground">
                Overall mood score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-sm">
                Mood Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold flex items-center gap-2'>
                {getMoodById(stats.mostFrequentMood)?.emoji}{" "}
                {getMoodTrend(stats.averageScore)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeline}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => format(parseISO(date), "MMM d")} 
                  />
                  <YAxis yAxisId="left" domain={[0, 10]} />
                  <YAxis yAxisId="right" orientation='right' domain={[0, 'auto']} />
                  <Tooltip content={<CustomToolTip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#f97316"
                    name='Average Mood'
                    strokeWidth={2}
                    // activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId='right'
                    name='Number of Entries'
                    dataKey="entryCount"
                    type="monotone" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default MoodAnalytics