import { supabase } from './supabase'

export const storage = {
  uploadFile: async (bucket, file, fileName) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)
    return { data, error }
  },
  
  getPublicUrl: (bucket, fileName) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    return data.publicUrl
  },
  
  deleteFile: async (bucket, fileName) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])
    return { error }
  }
}