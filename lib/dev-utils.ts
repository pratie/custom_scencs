import { conversationDB } from "./indexeddb"

// Development utility functions
// These can be called from the browser console for testing

declare global {
  interface Window {
    clearImageEditorDB: () => Promise<void>
    logDBStats: () => Promise<void>
  }
}

// Clear all data from IndexedDB
export const clearImageEditorDB = async () => {
  try {
    await conversationDB.clearAllData()
    console.log("✅ Database cleared successfully!")
    
    // Also clear any cached React Query data
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  } catch (error) {
    console.error("❌ Failed to clear database:", error)
  }
}

// Log database statistics
export const logDBStats = async () => {
  try {
    const conversations = await conversationDB.getAllConversations()
    const allVideos = await conversationDB.getAllVideos()
    
    console.log("📊 Database Statistics:")
    console.log(`- Conversations: ${conversations.length}`)
    console.log(`- Total Videos: ${allVideos.length}`)
    
    // Group by user
    const userStats = conversations.reduce((acc, conv) => {
      const userId = conv.userId || "unknown"
      if (!acc[userId]) {
        acc[userId] = { conversations: 0, messages: 0, images: 0, videos: 0 }
      }
      acc[userId].conversations++
      acc[userId].messages += conv.messages.length
      acc[userId].images += conv.generatedImages.length
      acc[userId].videos += conv.generatedVideos?.length || 0
      return acc
    }, {} as Record<string, any>)
    
    console.log("👥 User Statistics:", userStats)
  } catch (error) {
    console.error("❌ Failed to get database stats:", error)
  }
}

// Make functions available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.clearImageEditorDB = clearImageEditorDB
  window.logDBStats = logDBStats
  
  console.log("🛠️ Dev utils loaded:")
  console.log("- window.clearImageEditorDB() - Clear all database data")
  console.log("- window.logDBStats() - Show database statistics")
}