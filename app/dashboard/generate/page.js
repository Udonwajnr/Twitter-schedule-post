import { TweetGenerator } from "@/components/dashboard/tweet-generator"

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Generate Tweets
            </h1>
          </div>
          <p className="text-muted-foreground text-lg ml-4">
            Create engaging tweets with AI in seconds. Choose your tone, post type, and let AI do the magic.
          </p>
        </div>

        {/* Main content */}
        <TweetGenerator />
      </div>
    </div>
  )
}
