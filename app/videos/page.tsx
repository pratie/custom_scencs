"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Trash2, 
  Play, 
  Calendar,
  Filter,
  Grid3x3,
  List,
  Video,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import type { GeneratedVideo } from "@/lib/indexeddb"
import { useAllVideos, useDeleteVideo } from "@/lib/queries"

type ViewMode = "grid" | "list"
type FilterStatus = "all" | "completed" | "processing" | "failed"

export default function VideosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const { data: allVideos = [], isLoading, error } = useAllVideos(session?.user?.email || undefined)
  const deleteVideoMutation = useDeleteVideo()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  const filteredVideos = useMemo(() => {
    return allVideos.filter((video) => {
      // Filter by search query (prompt)
      const matchesSearch = searchQuery === "" || 
        video.prompt.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by status
      const matchesStatus = statusFilter === "all" || video.status === statusFilter

      return matchesSearch && matchesStatus
    }).sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
  }, [allVideos, searchQuery, statusFilter])

  const handleDownload = (video: GeneratedVideo) => {
    if (video.videoUrl) {
      const link = document.createElement("a")
      link.href = video.videoUrl
      link.download = `video-${video.id}-${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      deleteVideoMutation.mutate(videoId)
    }
  }

  const getStatusIcon = (status: GeneratedVideo["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: GeneratedVideo["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "processing":
        return "text-yellow-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-zinc-300">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-zinc-300">
          <Video className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
          <p>Loading your video library...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-red-400">
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Failed to load video library</p>
          <p className="text-sm text-zinc-500 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-neutral-200/20 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-50 h-8 md:h-10 px-2 md:px-3">
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Back to Editor</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-zinc-50">Video Library</h1>
                <p className="text-xs md:text-sm text-zinc-400">
                  {allVideos.length} video{allVideos.length !== 1 ? 's' : ''} generated
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 md:gap-2 self-end sm:self-auto">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="text-zinc-300 h-8 w-8 p-0 touch-manipulation"
                title="Grid view"
              >
                <Grid3x3 className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="text-zinc-300 h-8 w-8 p-0 touch-manipulation"
                title="List view"
              >
                <List className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-3 md:mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-zinc-500" />
              <Input
                placeholder="Search videos by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 md:pl-10 h-8 md:h-10 bg-input border-border text-foreground brutal-border placeholder-zinc-500 text-sm md:text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 md:w-4 md:h-4 text-zinc-500 flex-shrink-0" />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                <SelectTrigger className="w-32 md:w-40 h-8 md:h-10 bg-input border-border text-foreground brutal-border text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all">All Videos</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <Video className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-30 text-zinc-500" />
            <h3 className="text-lg md:text-xl font-medium text-zinc-300 mb-2">
              {allVideos.length === 0 ? "No videos generated yet" : "No videos match your filters"}
            </h3>
            <p className="text-sm md:text-base text-zinc-500 mb-4 px-4">
              {allVideos.length === 0 
                ? "Start creating videos from the image editor" 
                : "Try adjusting your search or filter criteria"}
            </p>
            {allVideos.length === 0 && (
              <Link href="/dashboard">
                <Button className="bg-zinc-50 hover:bg-zinc-200 text-zinc-900 h-10 md:h-12 px-6 md:px-8 text-sm md:text-base">
                  Start Creating Videos
                </Button>
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="bg-card border-border overflow-hidden brutal-border brutal-shadow">
                <CardContent className="p-0">
                  {video.status === "completed" && video.videoUrl ? (
                    <div className="relative aspect-[9/16] bg-zinc-800">
                      <video
                        className="w-full h-full object-cover"
                        poster={video.originUrl || undefined}
                        preload="metadata"
                        playsInline
                        controls={false}
                        muted
                      >
                        <source src={video.videoUrl} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-black/20 opacity-0 active:opacity-100 md:hover:opacity-100 transition-opacity flex items-center justify-center touch-manipulation">
                        <Play className="w-8 h-8 md:w-12 md:h-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[9/16] bg-zinc-800 flex flex-col items-center justify-center">
                      {getStatusIcon(video.status)}
                      <span className={`mt-2 text-xs md:text-sm ${getStatusColor(video.status)}`}>
                        {video.status}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardHeader className="p-2 md:p-4">
                  <div className="flex items-start justify-between gap-1 md:gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xs md:text-sm font-medium text-zinc-50 line-clamp-2 leading-tight">
                        {video.prompt}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 md:mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 text-zinc-500" />
                          <span className="text-xs text-zinc-500">
                            {new Date(video.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {video.type && (
                          <span className={`text-xs px-1.5 md:px-2 py-0.5 font-bold uppercase tracking-wider rounded ${
                            video.type === "avatar" 
                              ? "bg-accent text-accent-foreground" 
                              : "bg-primary text-primary-foreground"
                          }`}>
                            {video.type === "avatar" ? "Avatar" : "Motion"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 md:gap-1">
                      {video.status === "completed" && video.videoUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(video)}
                          className="h-6 w-6 md:h-8 md:w-8 p-0 text-zinc-400 hover:text-zinc-50 touch-manipulation"
                          title="Download video"
                        >
                          <Download className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(video.id)}
                        disabled={deleteVideoMutation.isPending}
                        className="h-6 w-6 md:h-8 md:w-8 p-0 text-zinc-400 hover:text-red-400 touch-manipulation"
                        title="Delete video"
                      >
                        <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="bg-card border-border brutal-border brutal-shadow">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-start md:items-center gap-3 md:gap-6">
                    {video.status === "completed" && video.videoUrl ? (
                      <div className="relative w-16 h-20 md:w-24 md:h-32 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                        <video
                          className="w-full h-full object-cover"
                          poster={video.originUrl || undefined}
                          preload="metadata"
                          playsInline
                          controls={false}
                          muted
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-black/20 opacity-0 active:opacity-100 md:hover:opacity-100 transition-opacity flex items-center justify-center touch-manipulation">
                          <Play className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-20 md:w-24 md:h-32 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(video.status)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-lg font-medium text-zinc-50 mb-1 md:mb-2 line-clamp-2">
                        {video.prompt}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 text-xs md:text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(video.status)}
                          <span className={getStatusColor(video.status)}>
                            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(video.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {video.type && (
                            <span className={`text-xs px-1.5 md:px-2 py-0.5 font-bold uppercase tracking-wider rounded ${
                              video.type === "avatar" 
                                ? "bg-accent text-accent-foreground" 
                                : "bg-primary text-primary-foreground"
                            }`}>
                              {video.type === "avatar" ? "Avatar" : "Motion"}
                            </span>
                          )}
                          {video.resolution && (
                            <span className="hidden sm:inline">{video.resolution}</span>
                          )}
                        </div>
                      </div>
                      {video.error && (
                        <p className="text-red-400 text-xs md:text-sm mt-1 md:mt-2 line-clamp-2">{video.error}</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 md:gap-2 self-start sm:self-center">
                      {video.status === "completed" && video.videoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(video)}
                          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 h-8 md:h-10 px-2 md:px-3 text-xs md:text-sm touch-manipulation"
                        >
                          <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Download</span>
                          <span className="sm:hidden">DL</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(video.id)}
                        disabled={deleteVideoMutation.isPending}
                        className="border-zinc-600 text-zinc-300 hover:bg-red-900 hover:text-red-300 h-8 md:h-10 px-2 md:px-3 text-xs md:text-sm touch-manipulation"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}