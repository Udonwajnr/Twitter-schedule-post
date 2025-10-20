"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Repeat2, MessageCircle, Share } from "lucide-react"

export function TweetPreview({ text, author }) {
  const defaultAuthor = {
    name: "John Doe",
    handle: "@johndoe",
    avatar: "/placeholder.svg?height=40&width=40",
  }

  const tweetAuthor = author || defaultAuthor

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      {/* Tweet header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={tweetAuthor.avatar || "/placeholder.svg"}
            alt={tweetAuthor.name}
          />
          <AvatarFallback>{tweetAuthor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm">{tweetAuthor.name}</span>
            <span className="text-muted-foreground text-sm">
              {tweetAuthor.handle}
            </span>
            <span className="text-muted-foreground text-sm">· now</span>
          </div>
        </div>
      </div>

      {/* Tweet content */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">{text}</p>

      {/* Tweet actions */}
      <div className="flex items-center gap-6 text-muted-foreground">
        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">0</span>
        </button>
        <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
          <Repeat2 className="h-4 w-4" />
          <span className="text-xs">0</span>
        </button>
        <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
          <Heart className="h-4 w-4" />
          <span className="text-xs">0</span>
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <Share className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
