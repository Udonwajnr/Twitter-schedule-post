"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, RefreshCw, Copy, Calendar, Send } from "lucide-react"
import { TweetPreview } from "./tweet-preview"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { ScheduleTweetDialog } from "./schedule-tweet-dialog"

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "funny", label: "Funny" },
  { value: "inspirational", label: "Inspirational" },
  { value: "educational", label: "Educational" },
]

export function TweetGenerator() {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("professional")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTweets, setGeneratedTweets] = useState([])
  const [selectedTweet, setSelectedTweet] = useState(null)
  const [credits, setCredits] = useState(45)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedTweetForSchedule, setSelectedTweetForSchedule] = useState(null)
  const { toast } = useToast()
  const { data: session } = useSession()

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic or idea for your tweet",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, count: 3 }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Generation failed",
          description: data.error || "Failed to generate tweets",
          variant: "destructive",
        })
        return
      }

      setGeneratedTweets(data.tweets)
      setCredits(data.creditsRemaining)
      toast({
        title: "Tweets generated!",
        description: `Used ${data.creditsUsed} credits. ${data.creditsRemaining} remaining.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (tweet) => {
    navigator.clipboard.writeText(tweet)
    toast({
      title: "Copied to clipboard",
      description: "Tweet text has been copied",
    })
  }

  const handleSchedule = (tweet) => {
    setSelectedTweetForSchedule(tweet)
    setScheduleDialogOpen(true)
  }

  const handleScheduleSuccess = () => {
    if (selectedTweetForSchedule) {
      setGeneratedTweets((prev) => prev.filter((t) => t.id !== selectedTweetForSchedule.id))
      setSelectedTweetForSchedule(null)
    }
    toast({
      title: "Success",
      description: "Tweet scheduled successfully! View it in the Calendar page.",
    })
  }

  const handlePostNow = async (tweet) => {
    try {
      const response = await fetch("/api/tweets/post-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetId: tweet.id,
          text: tweet.text,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Post failed",
          description: data.error || "Failed to post tweet",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Tweet posted!",
        description: "Your tweet has been published to Twitter",
      })

      setGeneratedTweets((prev) => prev.filter((t) => t.id !== tweet.id))
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }
  

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Tweet Details
              </CardTitle>
              <CardDescription>Tell us what you want to tweet about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic or Idea</Label>
                <Textarea
                  id="topic"
                  placeholder="e.g., productivity tips, new product launch, industry insights..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">Be specific for better results</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tweets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Credits info */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Credits Remaining</p>
                  <p className="text-2xl font-bold">{credits} / 50</p>
                </div>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Each generation uses 1 credit</p>
            </CardContent>
          </Card>
        </div>

        {/* Generated tweets section */}
        <div className="space-y-4">
          {generatedTweets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">No tweets generated yet</p>
                <p className="text-sm text-muted-foreground">
                  Enter a topic and click generate to see AI-powered tweets
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <h3 className="text-lg font-semibold">Generated Tweets</h3>
              {generatedTweets.map((tweet, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <TweetPreview text={tweet.text} />
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleCopy(tweet.text)} className="flex-1">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleSchedule(tweet)} className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePostNow(tweet)}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Post Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      <ScheduleTweetDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        tweetId={selectedTweetForSchedule?.id}
        tweetText={selectedTweetForSchedule?.text}
        onSuccess={handleScheduleSuccess}
      />
    </>
  )
}
