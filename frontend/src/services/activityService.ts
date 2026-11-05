import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';

export interface ActivityLogItem {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  description: string;
  document_id?: string;
  document_name?: string;
  created_at: string;
}

export const activityService = {
  async getLogs(): Promise<ActivityLogItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          employees (id, full_name),
          documents (id, file_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        return data.map((log: any) => ({
          id: log.id,
          user_id: log.user_id,
          user_name: log.employees?.full_name || 'System',
          action: log.action,
          description: log.description,
          document_id: log.document_id,
          document_name: log.documents?.file_name,
          created_at: log.created_at
        }));
      }
    }

    // Fallback to local backend
    const res = await fetch('/api/activity-logs');
    if (!res.ok) return [];
    return await res.json();
  },

  async logAction(action: string, description: string, documentId?: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('activity_logs').insert({
          action,
          description,
          document_id: documentId || null,
          user_id: userId || null
        });
      } catch (e) {
        console.warn(e);
      }
      return;
    }

    await fetch('/api/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, description, document_id: documentId })
    }).catch(console.warn);
  }
};
