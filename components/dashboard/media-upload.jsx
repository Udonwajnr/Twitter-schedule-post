"use client"

import  React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, ImageIcon, Video, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"


export function MediaUpload({ mediaFiles, onMediaChange, maxImages = 4, maxVideos = 1 }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const hasVideo = mediaFiles.some((f) => f.type === "video")
  const hasImages = mediaFiles.some((f) => f.type === "image")
  const imageCount = mediaFiles.filter((f) => f.type === "image").length
  const videoCount = mediaFiles.filter((f) => f.type === "video").length

  const canAddImage = !hasVideo && imageCount < maxImages
  const canAddVideo = !hasImages && videoCount < maxVideos

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"]

    for (const file of files) {
      const isImage = validImageTypes.includes(file.type)
      const isVideo = validVideoTypes.includes(file.type)

      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Only JPG, PNG, GIF, and MP4 files are allowed",
          variant: "destructive",
        })
        continue
      }

      // Check if we can add this type
      if (isImage && !canAddImage) {
        toast({
          title: "Cannot add image",
          description: hasVideo ? "Cannot mix images and videos" : `Maximum ${maxImages} images allowed`,
          variant: "destructive",
        })
        continue
      }

      if (isVideo && !canAddVideo) {
        toast({
          title: "Cannot add video",
          description: hasImages ? "Cannot mix images and videos" : `Maximum ${maxVideos} video allowed`,
          variant: "destructive",
        })
        continue
      }

      // Upload file
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Upload failed")
        }

        const newFile= {
          url: data.url,
          type: data.resourceType === "video" ? "video" : "image",
          publicId: data.publicId,
        }

        onMediaChange([...mediaFiles, newFile])

        toast({
          title: "Upload successful",
          description: `${isVideo ? "Video" : "Image"} uploaded successfully`,
        })
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = (index) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index)
    onMediaChange(newFiles)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Media</p>
          <p className="text-xs text-muted-foreground">
            {mediaFiles.length === 0
              ? "Add up to 4 images or 1 video"
              : hasVideo
                ? `${videoCount} video added`
                : `${imageCount} of ${maxImages} images`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={uploading || (!canAddImage && !canAddVideo)}
          className="border-primary/20 hover:bg-primary/5 bg-transparent"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
        multiple={!hasVideo}
        onChange={handleFileSelect}
        className="hidden"
      />

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaFiles.map((file, index) => (
            <Card key={index} className="relative group overflow-hidden border-primary/20">
              {file.type === "image" ? (
                <img
                  src={file.url || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-secondary flex items-center justify-center">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded flex items-center gap-1">
                {file.type === "image" ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                {file.type === "image" ? "Image" : "Video"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
