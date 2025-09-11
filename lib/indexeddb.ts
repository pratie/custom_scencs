interface Conversation {
  id: string
  userId: string // User's email from NextAuth session
  title: string
  messages: ChatMessage[]
  generatedImages: GeneratedImage[]
  generatedVideos?: GeneratedVideo[]
  createdAt: number
  updatedAt: number
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  image?: string
  generatedImage?: GeneratedImage
  generatedVideo?: GeneratedVideo
  timestamp: number
}

interface TextElement {
  id: string
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  opacity: number
  rotation: number
  positionX: number
  positionY: number
  letterSpacing: number
  hasShadow: boolean
  isForeground: boolean
}

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: number
  model?: string // Added optional model field to track which AI model was used
  // Text composition fields
  hasTextComposition?: boolean
  textElements?: TextElement[]
  backgroundRemovedUrl?: string
  originalImageUrl?: string
}

interface GeneratedVideo {
  id: string
  taskId: string
  imageId: string
  prompt: string
  status: "processing" | "completed" | "failed"
  videoUrl?: string
  originUrl?: string
  resolution?: string
  timestamp: number
  error?: string
  type?: "veo3" | "avatar" // Video generation type
  voice?: string // For avatar videos
  text?: string // For avatar videos - what the avatar says
  fileSize?: number // For avatar videos
}

class ConversationDB {
  private dbName = "ImageEditorDB"
  private version = 2 // Increment version for schema change
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = (event.target as IDBOpenDBRequest).transaction!

        // Clear existing data when upgrading to version 2
        if (event.oldVersion < 2) {
          console.log("[v0] Upgrading database to version 2 - clearing old data")
          if (db.objectStoreNames.contains("conversations")) {
            db.deleteObjectStore("conversations")
          }
        }

        if (!db.objectStoreNames.contains("conversations")) {
          const store = db.createObjectStore("conversations", { keyPath: "id" })
          store.createIndex("createdAt", "createdAt", { unique: false })
          store.createIndex("userId", "userId", { unique: false }) // Index for user filtering
          store.createIndex("userIdCreatedAt", ["userId", "createdAt"], { unique: false }) // Compound index
        }
      }
    })
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conversations"], "readwrite")
      const store = transaction.objectStore("conversations")
      const request = store.put(conversation)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getConversation(id: string): Promise<Conversation | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conversations"], "readonly")
      const store = transaction.objectStore("conversations")
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getAllConversations(userId?: string): Promise<Conversation[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conversations"], "readonly")
      const store = transaction.objectStore("conversations")

      if (userId) {
        // Filter by user ID
        const index = store.index("userId")
        const request = index.getAll(userId)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const conversations = request.result.sort((a, b) => b.updatedAt - a.updatedAt)
          resolve(conversations)
        }
      } else {
        // Get all conversations (fallback)
        const index = store.index("createdAt")
        const request = index.getAll()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const conversations = request.result.sort((a, b) => b.updatedAt - a.updatedAt)
          resolve(conversations)
        }
      }
    })
  }

  async deleteConversation(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conversations"], "readwrite")
      const store = transaction.objectStore("conversations")
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getAllVideos(userId?: string): Promise<GeneratedVideo[]> {
    if (!this.db) await this.init()

    return new Promise(async (resolve, reject) => {
      try {
        // Get user-specific conversations
        const conversations = await this.getAllConversations(userId)
        const allVideos: GeneratedVideo[] = []

        // Extract all videos from user's conversations
        conversations.forEach((conversation) => {
          if (conversation.generatedVideos) {
            allVideos.push(...conversation.generatedVideos)
          }
        })

        // Sort by timestamp (newest first)
        allVideos.sort((a, b) => b.timestamp - a.timestamp)
        resolve(allVideos)
      } catch (error) {
        reject(error)
      }
    })
  }

  async deleteVideo(videoId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise(async (resolve, reject) => {
      try {
        // First, find which conversation contains this video
        const conversations = await this.getAllConversations()
        
        for (const conversation of conversations) {
          if (conversation.generatedVideos?.some(video => video.id === videoId)) {
            // Remove the video from this conversation
            const updatedConversation = {
              ...conversation,
              generatedVideos: conversation.generatedVideos.filter(video => video.id !== videoId),
              updatedAt: Date.now()
            }
            
            // Save the updated conversation
            await this.saveConversation(updatedConversation)
            break
          }
        }
        
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conversations"], "readwrite")
      const store = transaction.objectStore("conversations")
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        console.log("[v0] All conversation data cleared from database")
        resolve()
      }
    })
  }
}

export const conversationDB = new ConversationDB()
export type { Conversation, ChatMessage, GeneratedImage, GeneratedVideo, TextElement }
