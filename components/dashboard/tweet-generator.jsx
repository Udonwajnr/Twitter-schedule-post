"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, RefreshCw, Copy, Calendar, Send, AlertCircle, Zap, Twitter } from "lucide-react"
import { TweetPreview } from "./tweet-preview"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { ScheduleTweetDialog } from "./schedule-tweet-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MediaUpload } from "./media-upload"

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "funny", label: "Funny" },
  { value: "inspirational", label: "Inspirational" },
  { value: "educational", label: "Educational" },
]

const postTypes = [
  { value: "single", label: "Single Post" },
  { value: "thread", label: "Thread", premium: true },
  { value: "poll", label: "Poll", premium: true },
  { value: "quote", label: "Quote Tweet", premium: true },
]



export function TweetGenerator() {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("professional")
  const [postType, setPostType] = useState("single")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTweets, setGeneratedTweets] = useState([])
  const [credits, setCredits] = useState(45)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedTweetForSchedule, setSelectedTweetForSchedule] = useState(null)
  const [userData, setUserData] = useState(null)
  const [mediaFiles, setMediaFiles] = useState([])
  const { toast } = useToast()
  const { data: session } = useSession()

  const getCharacterLimit = () => {
    if (userData?.twitterSubscription === "Premium" || userData?.twitterSubscription === "PremiumPlus") {
      return 25000
    }
    return 280
  }

  const isPremium =
    userData?.plan === "premium" ||
    userData?.twitterSubscription === "Premium" ||
    userData?.twitterSubscription === "PremiumPlus"

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
        body: JSON.stringify({
          topic,
          tone,
          count: 3,
          postType,
          mediaUrls: mediaFiles.map((f) => f.url),
        }),
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
        title: "✨ Tweets generated!",
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
      title: "Copied!",
      description: "Tweet text has been copied to clipboard",
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
        title: "🚀 Tweet posted!",
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input section - Left sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main generator card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 via-accent/5 to-background overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Create Tweet
              </CardTitle>
              <CardDescription>AI-powered generation</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              {/* Topic input */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="font-semibold">
                  Topic or Idea
                </Label>
                <Textarea
                  id="topic"
                  placeholder="e.g., productivity tips, new product launch, industry insights..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  className="resize-none border-primary/20 focus:border-primary/50 bg-background/50"
                />
                <p className="text-xs text-muted-foreground">Be specific for better results</p>
              </div>

              {/* Tone selector */}
              <div className="space-y-2">
                <Label htmlFor="tone" className="font-semibold">
                  Tone
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone" className="border-primary/20 focus:border-primary/50">
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

              {/* Post type selector */}
              <div className="space-y-2">
                <Label htmlFor="postType" className="font-semibold">
                  Post Type
                </Label>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger id="postType" className="border-primary/20 focus:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {postTypes.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value} disabled={pt.premium && !isPremium}>
                        <div className="flex items-center gap-2">
                          {pt.label}
                          {pt.premium && !isPremium && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Premium</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Media upload component */}
              <MediaUpload mediaFiles={mediaFiles} onMediaChange={setMediaFiles} maxImages={4} maxVideos={1} />

              {/* Premium feature alert */}
              {!isPremium && postType !== "single" && (
                <Alert className="border-amber-200/50 bg-amber-50/50 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 text-sm">
                    {postType === "thread" && "Threads are available only for Premium Twitter accounts."}
                    {postType === "poll" && "Polls are available only for Premium Twitter accounts."}
                    {postType === "quote" && "Quote tweets are available only for Premium Twitter accounts."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (postType !== "single" && !isPremium)}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold h-11 shadow-lg"
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

          {/* Credits card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Credits Remaining</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {credits}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">of 50 total</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(credits / 50) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">1 credit per generation</p>
            </CardContent>
          </Card>

          {/* Character limit card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Character Limit</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {getCharacterLimit().toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userData?.twitterSubscription === "Premium" || userData?.twitterSubscription === "PremiumPlus"
                      ? "Premium account"
                      : "Standard account"}
                  </p>
                </div>
                <Twitter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated tweets section - Right side */}
        <div className="lg:col-span-2">
          {generatedTweets.length === 0 ? (
            <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 h-full flex items-center justify-center shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-primary/60" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">No tweets generated yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Enter a topic, select your tone and post type, then click generate to see AI-powered tweets
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-xl font-bold">Generated Tweets</h3>
                  <p className="text-sm text-muted-foreground">{generatedTweets.length} ready to post</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{generatedTweets.length}</span>
                </div>
              </div>

              {/* Tweet cards */}
              <div className="space-y-3">
                {generatedTweets.map((tweet, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-primary/50 bg-gradient-to-br from-background to-primary/5"
                  >
                    <CardContent className="pt-6">
                      {/* Tweet preview */}
                      <div className="mb-4">
                        <TweetPreview text={tweet.text} />
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-1">
                          <span className="font-medium">{tweet.text.length} characters</span>
                          {tweet.text.length > getCharacterLimit() && (
                            <span className="text-destructive font-semibold flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Exceeds limit
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(tweet.text)}
                          className="flex-1 border-primary/20 hover:bg-primary/5"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSchedule(tweet)}
                          className="flex-1 border-primary/20 hover:bg-primary/5"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePostNow(tweet)}
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium shadow-md"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Post Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule dialog */}
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
