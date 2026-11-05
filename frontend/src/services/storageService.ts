import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';

export const storageService = {
  /**
   * Upload an original PDF to Supabase Storage or local backend
   */
  async uploadOriginalDocument(file: File, folderName: string): Promise<{ storagePath: string; publicUrl?: string }> {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folderName || 'General'}/${Date.now()}_${cleanFileName}`;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.storage
        .from('original-documents')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('[Supabase Storage] Upload error:', error.message);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('original-documents')
        .getPublicUrl(data.path);

      return {
        storagePath: data.path,
        publicUrl: urlData.publicUrl
      };
    }

    // Fallback handled via backend multipart upload
    return { storagePath: path };
  },

  /**
   * Upload a split tagged PDF page range
   */
  async uploadTaggedDocument(pdfBytes: Uint8Array, fileName: string): Promise<string> {
    const path = `tagged/${Date.now()}_${fileName}`;

    if (isSupabaseConfigured() && supabase) {
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const { data, error } = await supabase.storage
        .from('tagged-documents')
        .upload(path, blob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (error) {
        console.warn('[Supabase Storage] Tagged upload error:', error.message);
        return path;
      }

      const { data: urlData } = supabase.storage
        .from('tagged-documents')
        .getPublicUrl(data.path);

      return urlData.publicUrl || data.path;
    }

    return path;
  },

  /**
   * Get direct viewable URL for a document
   */
  getDocumentUrl(storagePath: string, docId?: string): string {
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
      return storagePath;
    }
    if (isSupabaseConfigured() && supabase) {
      const { data } = supabase.storage
        .from('original-documents')
        .getPublicUrl(storagePath);
      if (data?.publicUrl) return data.publicUrl;
    }
    // Fallback to local server streaming route
    return docId ? `/api/documents/raw/${docId}` : `/api/documents/file?path=${encodeURIComponent(storagePath)}`;
  }
};
