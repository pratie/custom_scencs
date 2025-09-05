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
      <div className="border-b border-neutral-200/20 bg-zinc-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Editor
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-zinc-50">Video Library</h1>
                <p className="text-sm text-zinc-400">
                  {allVideos.length} video{allVideos.length !== 1 ? 's' : ''} generated
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="text-zinc-300"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="text-zinc-300"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search videos by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-700 text-zinc-50 placeholder-zinc-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500" />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                <SelectTrigger className="w-40 bg-zinc-900 border-zinc-700 text-zinc-50">
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
      <div className="container mx-auto px-4 py-8">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-30 text-zinc-500" />
            <h3 className="text-xl font-medium text-zinc-300 mb-2">
              {allVideos.length === 0 ? "No videos generated yet" : "No videos match your filters"}
            </h3>
            <p className="text-zinc-500 mb-4">
              {allVideos.length === 0 
                ? "Start creating videos from the image editor" 
                : "Try adjusting your search or filter criteria"}
            </p>
            {allVideos.length === 0 && (
              <Link href="/dashboard">
                <Button className="bg-zinc-50 hover:bg-zinc-200 text-zinc-900">
                  Start Creating Videos
                </Button>
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="bg-zinc-900/50 border-zinc-700 overflow-hidden">
                <CardContent className="p-0">
                  {video.status === "completed" && video.videoUrl ? (
                    <div className="relative aspect-[9/16] bg-zinc-800">
                      <video
                        className="w-full h-full object-cover"
                        poster={video.originUrl || undefined}
                        preload="metadata"
                      >
                        <source src={video.videoUrl} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[9/16] bg-zinc-800 flex items-center justify-center">
                      {getStatusIcon(video.status)}
                      <span className={`ml-2 text-sm ${getStatusColor(video.status)}`}>
                        {video.status}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium text-zinc-50 line-clamp-2">
                        {video.prompt}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-500">
                          {new Date(video.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {video.status === "completed" && video.videoUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(video)}
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-50"
                          title="Download video"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(video.id)}
                        disabled={deleteVideoMutation.isPending}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
                        title="Delete video"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="bg-zinc-900/50 border-zinc-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {video.status === "completed" && video.videoUrl ? (
                      <div className="relative w-24 h-32 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                        <video
                          className="w-full h-full object-cover"
                          poster={video.originUrl || undefined}
                          preload="metadata"
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-32 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(video.status)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-zinc-50 mb-2">
                        {video.prompt}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
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
                        {video.resolution && (
                          <span>{video.resolution}</span>
                        )}
                      </div>
                      {video.error && (
                        <p className="text-red-400 text-sm mt-2">{video.error}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {video.status === "completed" && video.videoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(video)}
                          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(video.id)}
                        disabled={deleteVideoMutation.isPending}
                        className="border-zinc-600 text-zinc-300 hover:bg-red-900 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
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