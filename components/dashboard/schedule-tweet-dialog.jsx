"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TweetPreview } from "./tweet-preview";

// interface ScheduleTweetDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   tweetId?: string
//   tweetText?: string
//   onSuccess?: () => void
// }

export function ScheduleTweetDialog({
  open,
  onOpenChange,
  tweetId,
  tweetText: initialText,
  onSuccess,
}) {
  const [date, setDate] = useState();
  const [time, setTime] = useState("12:00");
  const [tweetText, setTweetText] = useState(initialText || "");
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  const handleSchedule = async () => {
    if (!date) {
      toast({
        title: "Date required",
        description: "Please select a date for scheduling",
        variant: "destructive",
      });
      return;
    }

    if (!initialText.trim()) {
      toast({
        title: "Tweet text required",
        description: "Please enter tweet text",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // Check if date is in the future
    if (scheduledDate <= new Date()) {
      toast({
        title: "Invalid date",
        description: "Scheduled time must be in the future",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      let finalTweetId = tweetId;

      // If no tweetId provided, create a new draft tweet first
      if (!finalTweetId) {
        const createResponse = await fetch("/api/tweets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: tweetText,
            status: "draft",
          }),
        });

        const createData = await createResponse.json();

        if (!createResponse.ok) {
          toast({
            title: "Failed to create tweet",
            description: createData.error || "Something went wrong",
            variant: "destructive",
          });
          return;
        }

        finalTweetId = createData.tweet._id;
      }

      // Schedule the tweet
      const response = await fetch("/api/tweets/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetId: finalTweetId,
          scheduledFor: scheduledDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Scheduling failed",
          description: data.error || "Failed to schedule tweet",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Tweet scheduled!",
        description: `Your tweet will be posted on ${format(
          scheduledDate,
          "PPP"
        )} at ${time}`,
      });

      // Reset form
      setDate(undefined);
      setTime("12:00");
      setTweetText("");
      onOpenChange(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Tweet</DialogTitle>
          <DialogDescription>
            Choose when you want this tweet to be posted
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tweet text input (only if no initial text) */}
          {!initialText && (
            <div className="space-y-2">
              <Label htmlFor="tweet-text">Tweet Text</Label>
              <Textarea
                id="tweet-text"
                placeholder="What's happening?"
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                rows={4}
                maxLength={280}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {tweetText.length} / 280
              </p>
            </div>
          )}

          {/* Tweet preview */}
          {(initialText || tweetText) && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <TweetPreview text={initialText || tweetText} />
            </div>
          )}

          {/* Date picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today; // only disable past days
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isScheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isScheduling}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {isScheduling ? "Scheduling..." : "Schedule Tweet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
