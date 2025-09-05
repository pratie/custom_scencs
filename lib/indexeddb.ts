interface Conversation {
  id: string
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

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: number
  model?: string // Added optional model field to track which AI model was used
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
}

class ConversationDB {
  private dbName = "ImageEditorDB"
  private version = 1
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

        if (!db.objectStoreNames.contains("conversations")) {
          const store = db.createObjectStore("conversations", { keyPath: "id" })
          store.createIndex("createdAt", "createdAt", { unique: false })
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

  async getAllConversations(): Promise<Conversation[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conversations"], "readonly")
      const store = transaction.objectStore("conversations")
      const index = store.index("createdAt")
      const request = index.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const conversations = request.result.sort((a, b) => b.updatedAt - a.updatedAt)
        resolve(conversations)
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

  async getAllVideos(): Promise<GeneratedVideo[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conversations"], "readonly")
      const store = transaction.objectStore("conversations")
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const conversations: Conversation[] = request.result
        const allVideos: GeneratedVideo[] = []

        // Extract all videos from all conversations
        conversations.forEach((conversation) => {
          if (conversation.generatedVideos) {
            allVideos.push(...conversation.generatedVideos)
          }
        })

        // Sort by timestamp (newest first)
        allVideos.sort((a, b) => b.timestamp - a.timestamp)
        resolve(allVideos)
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
}

export const conversationDB = new ConversationDB()
export type { Conversation, ChatMessage, GeneratedImage, GeneratedVideo }
