import { TweetGenerator } from "@/components/dashboard/tweet-generator"

export default function GeneratePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Generate Tweets</h1>
        <p className="text-muted-foreground">Create engaging tweets with AI in seconds</p>
      </div>

      <TweetGenerator />
    </div>
  )
}
