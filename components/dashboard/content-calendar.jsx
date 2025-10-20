"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Clock, Edit, Trash2 } from "lucide-react"
import { TweetPreview } from "./tweet-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ScheduleTweetDialog } from "./schedule-tweet-dialog"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
//   const [view, setView] = useState<"calendar" | "list">("calendar")
  const [view, setView] = useState("calendar")
  const [scheduledTweets, setScheduledTweets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const { toast } = useToast()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const fetchScheduledTweets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tweets?status=scheduled")
      const data = await response.json()

      if (response.ok) {
        setScheduledTweets(
          data.tweets.map((tweet) => ({
            ...tweet,
            scheduledFor: new Date(tweet.scheduledFor),
          })),
        )
      }
    } catch (error) {
      console.error("[v0] Failed to fetch tweets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTweetsForDate = (date) => {
    return scheduledTweets.filter((tweet) => {
      const tweetDate = new Date(tweet.scheduledFor)
      return (
        tweetDate.getDate() === date.getDate() &&
        tweetDate.getMonth() === date.getMonth() &&
        tweetDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleDeleteTweet = async (tweetId) => {
    try {
      const response = await fetch(`/api/tweets?id=${tweetId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Tweet deleted",
          description: "The scheduled tweet has been removed",
        })
        fetchScheduledTweets()
      } else {
        toast({
          title: "Delete failed",
          description: "Failed to delete tweet",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchScheduledTweets()
  }, [])

  return (
    <>
      <div className="space-y-6">
        {/* Header with view toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("calendar")}
              className={view === "calendar" ? "bg-muted" : ""}
            >
              Calendar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("list")}
              className={view === "list" ? "bg-muted" : ""}
            >
              List
            </Button>
          </div>
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => setScheduleDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Tweet
          </Button>
        </div>

        {view === "calendar" ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {monthNames[month]} {year}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Calendar days */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1
                  const date = new Date(year, month, day)
                  const tweets = getTweetsForDate(date)
                  const isToday =
                    date.getDate() === new Date().getDate() &&
                    date.getMonth() === new Date().getMonth() &&
                    date.getFullYear() === new Date().getFullYear()

                  return (
                    <Dialog key={day}>
                      <DialogTrigger asChild>
                        <button
                          className={`aspect-square p-2 rounded-lg border transition-colors hover:border-primary/50 ${
                            isToday ? "border-primary bg-primary/5" : "border-border"
                          } ${tweets.length > 0 ? "bg-accent/10" : ""}`}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="flex flex-col h-full">
                            <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</span>
                            {tweets.length > 0 && (
                              <div className="mt-1 flex-1 flex flex-col gap-1">
                                {tweets.slice(0, 2).map((tweet) => (
                                  <div
                                    key={tweet._id}
                                    className="text-xs bg-primary/20 text-primary rounded px-1 py-0.5 truncate"
                                  >
                                    {formatTime(tweet.scheduledFor)}
                                  </div>
                                ))}
                                {tweets.length > 2 && (
                                  <div className="text-xs text-muted-foreground">+{tweets.length - 2} more</div>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Scheduled Tweets - {formatDate(date)}</DialogTitle>
                          <DialogDescription>
                            {tweets.length === 0
                              ? "No tweets scheduled for this day"
                              : `${tweets.length} tweet(s) scheduled`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                          {tweets.map((tweet) => (
                            <Card key={tweet._id}>
                              <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{formatTime(tweet.scheduledFor)}</span>
                                  <Badge variant="secondary" className="ml-auto">
                                    {tweet.status}
                                  </Badge>
                                </div>
                                <TweetPreview text={tweet.text} />
                                <div className="flex gap-2 mt-4">
                                  <Button variant="outline" size="sm">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive bg-transparent"
                                    onClick={() => handleDeleteTweet(tweet._id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {scheduledTweets
              .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
              .map((tweet) => (
                <Card key={tweet._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatDate(tweet.scheduledFor)} at {formatTime(tweet.scheduledFor)}
                      </span>
                      <Badge variant="secondary" className="ml-auto">
                        {tweet.status}
                      </Badge>
                    </div>
                    <TweetPreview text={tweet.text} />
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive bg-transparent"
                        onClick={() => handleDeleteTweet(tweet._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      <ScheduleTweetDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSuccess={fetchScheduledTweets}
      />
    </>
  )
}
