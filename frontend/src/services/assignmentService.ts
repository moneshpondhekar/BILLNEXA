import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';

export interface AssignmentRecord {
  id: string;
  document_id: string;
  employee_id: string;
  assigned_by?: string;
  assigned_at: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Pending Review';
  completed_at?: string;
  document?: {
    id: string;
    file_name: string;
    folder_name: string;
    page_count: number;
    priority: string;
    storage_path: string;
  };
  employee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export const assignmentService = {
  /**
   * Assign a document to an employee
   */
  async assignDocument(documentId: string, employeeId: string, assignedBy?: string, priority: string = 'Normal'): Promise<any> {
    if (isSupabaseConfigured() && supabase) {
      // Check if assignment exists
      const { data: existing } = await supabase
        .from('document_assignments')
        .select('id')
        .eq('document_id', documentId)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('document_assignments')
          .update({
            employee_id: employeeId,
            assigned_by: assignedBy || null,
            assigned_at: new Date().toISOString(),
            status: 'Assigned'
          })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('document_assignments')
          .insert({
            document_id: documentId,
            employee_id: employeeId,
            assigned_by: assignedBy || null,
            assigned_at: new Date().toISOString(),
            status: 'Assigned'
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          user_id: assignedBy || null,
          action: 'Document Assigned',
          description: `Assigned document to employee`,
          document_id: documentId
        });
      } catch (e) {
        console.warn(e);
      }

      return result.data;
    }

    // Fallback to local backend
    const res = await fetch('/api/assignments/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: documentId,
        employee_id: employeeId,
        priority: priority
      })
    });

    if (!res.ok) throw new Error('Failed to assign document');
    return await res.json();
  },

  /**
   * Get assignments filtered by employee (or all for admin)
   */
  async getEmployeeAssignments(employeeId?: string): Promise<AssignmentRecord[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase
        .from('document_assignments')
        .select(`
          *,
          documents (*),
          employees:employee_id (id, full_name, email)
        `)
        .order('assigned_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        document_id: row.document_id,
        employee_id: row.employee_id,
        assigned_by: row.assigned_by,
        assigned_at: row.assigned_at,
        status: row.status,
        completed_at: row.completed_at,
        document: row.documents ? {
          id: row.documents.id,
          file_name: row.documents.file_name,
          folder_name: row.documents.folder_name,
          page_count: row.documents.page_count,
          priority: row.documents.priority,
          storage_path: row.documents.storage_path
        } : undefined,
        employee: row.employees ? {
          id: row.employees.id,
          full_name: row.employees.full_name,
          email: row.employees.email
        } : undefined
      }));
    }

    // Fallback to local backend
    const url = employeeId ? `/api/assignments/my-tasks?employee_id=${employeeId}` : '/api/assignments';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    const data = await res.json();
    return data.map((row: any) => ({
      id: row.id,
      document_id: row.document_id,
      employee_id: row.employee_id,
      assigned_by: row.assigned_by,
      assigned_at: row.assigned_at,
      status: row.status,
      completed_at: row.completed_at,
      document: row.document ? {
        id: row.document.id,
        file_name: row.document.original_filename || row.document.file_name,
        folder_name: row.document.folder_name || 'General',
        page_count: row.document.total_pages || row.document.page_count || 1,
        priority: row.priority || row.document.priority || 'Normal',
        storage_path: row.document.storage_path
      } : undefined,
      employee: {
        id: row.employee_id,
        full_name: row.employee_name || 'Employee',
        email: ''
      }
    }));
  },

  /**
   * Update status of an assignment
   */
  async updateStatus(assignmentId: string, status: 'Assigned' | 'In Progress' | 'Completed' | 'Pending Review'): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('document_assignments')
        .update({
          status,
          completed_at: status === 'Completed' ? new Date().toISOString() : null
        })
        .eq('id', assignmentId);
      return;
    }

    await fetch(`/api/assignments/${assignmentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(console.warn);
  }
};
