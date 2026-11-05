import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';
import { storageService } from './storageService';

export interface DocumentRecord {
  id: string;
  file_name: string;
  storage_path: string;
  folder_name: string;
  file_size: number;
  page_count: number;
  priority: 'Normal' | 'High';
  upload_status: string;
  created_at: string;
  assignment?: {
    id: string;
    employee_id: string;
    employee_name?: string;
    status: string;
    assigned_at: string;
  };
}

export const documentService = {
  async getDocuments(): Promise<DocumentRecord[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data: docs, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_assignments (
            id,
            employee_id,
            status,
            assigned_at,
            employees:employee_id (full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && docs) {
        return docs.map((d: any) => {
          const rawAssign = Array.isArray(d.document_assignments) ? d.document_assignments[0] : d.document_assignments;
          return {
            id: d.id,
            file_name: d.file_name,
            storage_path: d.storage_path,
            folder_name: d.folder_name,
            file_size: d.file_size,
            page_count: d.page_count,
            priority: d.priority,
            upload_status: d.upload_status,
            created_at: d.created_at,
            assignment: rawAssign ? {
              id: rawAssign.id,
              employee_id: rawAssign.employee_id,
              employee_name: rawAssign.employees?.full_name || 'Assigned',
              status: rawAssign.status,
              assigned_at: rawAssign.assigned_at
            } : undefined
          };
        });
      }
    }

    // Fallback to local backend
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      file_name: d.original_filename || d.file_name,
      storage_path: d.storage_path,
      folder_name: d.folder_name || 'General',
      file_size: d.file_size_bytes || d.file_size || 0,
      page_count: d.total_pages || d.page_count || 1,
      priority: d.priority || 'Normal',
      upload_status: d.upload_status || 'uploaded',
      created_at: d.created_at,
      assignment: d.assignment ? {
        id: d.assignment.id,
        employee_id: d.assignment.employee_id,
        employee_name: d.assignment.employee_name,
        status: d.assignment.status,
        assigned_at: d.assignment.assigned_at
      } : undefined
    }));
  },

  async getDocumentById(id: string): Promise<DocumentRecord> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_assignments (
            id,
            employee_id,
            status,
            assigned_at,
            employees:employee_id (full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        const rawAssign = Array.isArray(data.document_assignments) ? data.document_assignments[0] : data.document_assignments;
        return {
          id: data.id,
          file_name: data.file_name,
          storage_path: data.storage_path,
          folder_name: data.folder_name,
          file_size: data.file_size,
          page_count: data.page_count,
          priority: data.priority,
          upload_status: data.upload_status,
          created_at: data.created_at,
          assignment: rawAssign ? {
            id: rawAssign.id,
            employee_id: rawAssign.employee_id,
            employee_name: rawAssign.employees?.full_name,
            status: rawAssign.status,
            assigned_at: rawAssign.assigned_at
          } : undefined
        };
      }
    }

    // Fallback to local backend
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch document');
    const d = await res.json();
    return {
      id: d.id,
      file_name: d.original_filename || d.file_name,
      storage_path: d.storage_path,
      folder_name: d.folder_name || 'General',
      file_size: d.file_size_bytes || d.file_size || 0,
      page_count: d.total_pages || d.page_count || 1,
      priority: d.priority || 'Normal',
      upload_status: 'uploaded',
      created_at: d.created_at,
      assignment: d.assignment
    };
  },

  async uploadDocument(file: File, folderName: string, priority: 'Normal' | 'High' = 'Normal'): Promise<DocumentRecord> {
    if (isSupabaseConfigured() && supabase) {
      // 1. Upload to Supabase Storage
      const { storagePath } = await storageService.uploadOriginalDocument(file, folderName);

      // Estimate page count or read minimal header
      const pageCount = 6; // Standard medical intake bundle estimate

      // 2. Insert record in documents table
      const { data, error } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          storage_path: storagePath,
          folder_name: folderName || 'Default Folder',
          file_size: file.size,
          page_count: pageCount,
          priority: priority,
          upload_status: 'uploaded'
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        file_name: data.file_name,
        storage_path: data.storage_path,
        folder_name: data.folder_name,
        file_size: data.file_size,
        page_count: data.page_count,
        priority: data.priority,
        upload_status: data.upload_status,
        created_at: data.created_at
      };
    }

    // Fallback to local backend
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folder_name', folderName);
    formData.append('priority', priority);

    const res = await fetch('/api/folders/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Failed to upload document');
    const result = await res.json();
    const created = result.documents?.[0];
    return {
      id: created?.id || 'doc-new',
      file_name: file.name,
      storage_path: created?.storage_path || '',
      folder_name: folderName,
      file_size: file.size,
      page_count: 6,
      priority: priority,
      upload_status: 'uploaded',
      created_at: new Date().toISOString()
    };
  }
};
