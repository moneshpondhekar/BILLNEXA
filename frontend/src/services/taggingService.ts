import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';
import { storageService } from './storageService';
import { PDFDocument } from 'pdf-lib';
import { DocumentTagItem } from '../types';

export const taggingService = {
  /**
   * Get all tags for a document
   */
  async getTags(documentId: string): Promise<DocumentTagItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('document_page_tags')
        .select('*')
        .eq('document_id', documentId)
        .order('start_page', { ascending: true });

      if (error) throw error;
      return (data || []).map((t: any) => ({
        id: t.id,
        document_id: t.document_id,
        claim_id: t.claim_id,
        tag_name: t.tag_name,
        start_page: t.start_page,
        end_page: t.end_page,
        page_count: t.end_page - t.start_page + 1,
        generated_storage_path: t.storage_path || '',
        created_at: t.created_at
      }));
    }

    // Fallback to local backend
    const res = await fetch(`/api/tags/${documentId}`);
    if (!res.ok) return [];
    return await res.json();
  },

  /**
   * Create a tag and optionally split the PDF for that page range
   */
  async saveTag(params: {
    documentId: string;
    tagName: 'AOB' | 'Bills' | 'DELIVERY RECEIPT' | 'INVOICE' | 'Medical Report' | 'MISCELLANEOUS' | 'NF-2';
    startPage: number;
    endPage: number;
    claimId?: string;
    userId?: string;
    pdfSourceUrl?: string;
  }): Promise<DocumentTagItem> {
    const { documentId, tagName, startPage, endPage, claimId, userId, pdfSourceUrl } = params;

    let generatedStoragePath = '';

    // If pdfSourceUrl is provided, attempt client-side page extraction using pdf-lib
    if (pdfSourceUrl && isSupabaseConfigured()) {
      try {
        const response = await fetch(pdfSourceUrl);
        const arrayBuffer = await response.arrayBuffer();
        const srcDoc = await PDFDocument.load(arrayBuffer);
        const subDoc = await PDFDocument.create();

        // 1-based to 0-based page index
        const pageIndices: number[] = [];
        for (let p = startPage; p <= endPage; p++) {
          if (p >= 1 && p <= srcDoc.getPageCount()) {
            pageIndices.push(p - 1);
          }
        }

        if (pageIndices.length > 0) {
          const copiedPages = await subDoc.copyPages(srcDoc, pageIndices);
          copiedPages.forEach(page => subDoc.addPage(page));
          const pdfBytes = await subDoc.save();

          const fileName = `${tagName.replace(/\s+/g, '_')}_p${startPage}-p${endPage}.pdf`;
          generatedStoragePath = await storageService.uploadTaggedDocument(pdfBytes, fileName);
        }
      } catch (e) {
        console.warn('[TaggingService] PDF splitting note:', e);
      }
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('document_page_tags')
        .insert({
          document_id: documentId,
          claim_id: claimId || null,
          tag_name: tagName,
          start_page: startPage,
          end_page: endPage,
          created_by: userId || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        document_id: data.document_id,
        claim_id: data.claim_id,
        tag_name: data.tag_name,
        start_page: data.start_page,
        end_page: data.end_page,
        page_count: data.end_page - data.start_page + 1,
        generated_storage_path: generatedStoragePath,
        created_at: data.created_at
      };
    }

    // Fallback to local backend
    const res = await fetch('/api/tags/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: documentId,
        tag_name: tagName,
        start_page: startPage,
        end_page: endPage,
        user_id: userId
      })
    });

    if (!res.ok) throw new Error('Failed to save document tag');
    return await res.json();
  },

  /**
   * Delete a tag
   */
  async deleteTag(tagId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('document_page_tags').delete().eq('id', tagId);
      return;
    }

    await fetch(`/api/tags/${tagId}`, { method: 'DELETE' }).catch(console.warn);
  }
};
