"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Twitter, Upload, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export function SettingsDashboard() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [autoPost, setAutoPost] = useState(true)
  const [twitterConnected, setTwitterConnected] = useState(false)
  const [twitterUsername, setTwitterUsername] = useState("")
  const { toast } = useToast()
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "twitter_connected") {
      toast({
        title: "Twitter connected!",
        description: "Your Twitter account has been successfully connected",
      })
      checkTwitterConnection()
    } else if (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect Twitter account. Please try again.",
        variant: "destructive",
      })
    }
  }, [searchParams])

  useEffect(() => {
    fetchUserData()
    checkTwitterConnection()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/user/me")
      const data = await response.json()

      if (data.user) {
        setName(data.user.name || "")
        setEmail(data.user.email || "")
        setBio(data.user.bio || "")
        setEmailNotifications(data.user.preferences?.emailNotifications ?? true)
        setAutoPost(data.user.preferences?.autoPost ?? true)
      }
    } catch (error) {
      console.error("[v0] Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkTwitterConnection = async () => {
    try {
      const response = await fetch("/api/twitter/me")
      const data = await response.json()

      if (data.user) {
        setTwitterConnected(true)
        setTwitterUsername(data.user.username)
      }
    } catch (error) {
      console.log("[v0] Twitter not connected")
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          emailNotifications,
          autoPost,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been saved successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleConnectTwitter = () => {
    window.location.href = "/api/twitter/login"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
              <AvatarFallback>{name ? name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Change Avatar
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Twitter connection */}
      <Card>
        <CardHeader>
          <CardTitle>Twitter Connection</CardTitle>
          <CardDescription>Connect your Twitter account to enable auto-posting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                <Twitter className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Twitter Account</p>
                <p className="text-sm text-muted-foreground">
                  {twitterConnected ? `@${twitterUsername}` : "Not connected"}
                </p>
              </div>
            </div>
            {twitterConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <Button onClick={handleConnectTwitter} variant="outline">
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email updates about your tweets</p>
            </div>
            <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-post">Auto-Post Scheduled Tweets</Label>
              <p className="text-sm text-muted-foreground">Automatically post tweets at scheduled times</p>
            </div>
            <Switch id="auto-post" checked={autoPost} onCheckedChange={setAutoPost} />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">Danger Zone</h4>
            <Button variant="outline" className="text-destructive bg-transparent">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
