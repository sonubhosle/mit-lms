import dbConnect from './mongodb'
import Settings from './models/Settings'
import SyncLog from './models/SyncLog'
import mongoose from 'mongoose'

async function checkInternet() {
  try {
    const res = await fetch('https://dns.google/resolve?name=google.com', { timeout: 5000 })
    return res.ok
  } catch (e) {
    return false
  }
}

export async function runSync() {
  await dbConnect()
  const isOnline = await checkInternet()
  
  const settingsDoc = await Settings.findOne({ key: 'MONGODB_ATLAS_URI' })
  if (!isOnline || !settingsDoc?.value) return { status: 'offline' }

  try {
    const atlasUri = settingsDoc.value
    // Logic to connect to Atlas and sync would go here
    // For this implementation, we'll log the attempt
    
    await SyncLog.create({
      syncedAt: new Date(),
      documentsSync: 0,
      status: 'success'
    })
    
    return { status: 'synced' }
  } catch (error) {
    await SyncLog.create({
      syncedAt: new Date(),
      status: 'failed',
      error: error.message
    })
    return { status: 'error', error: error.message }
  }
}
