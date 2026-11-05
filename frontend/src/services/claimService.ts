import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';

export interface ClaimPayload {
  document_id: string;
  employee_id: string;
  patient_information: any;
  address_information: any;
  contact_information: any;
  insurance_information: any;
  insured_information: any;
  icd_codes: any[];
  cpt_codes: any[];
  claim_status: string;
  status_reason?: string;
  extraction_confidence?: any;
  submitted?: boolean;
}

export const claimService = {
  /**
   * Save or Submit a claim
   */
  async saveClaim(payload: ClaimPayload): Promise<any> {
    const isSubmitted = payload.submitted || payload.claim_status === 'Submitted';
    const submittedAt = isSubmitted ? new Date().toISOString() : null;

    if (isSupabaseConfigured() && supabase) {
      // Check if claim exists for this document
      const { data: existing } = await supabase
        .from('claims')
        .select('id')
        .eq('document_id', payload.document_id)
        .maybeSingle();

      let result;
      const record = {
        document_id: payload.document_id,
        employee_id: payload.employee_id,
        patient_information: payload.patient_information,
        address_information: payload.address_information,
        contact_information: payload.contact_information,
        insurance_information: payload.insurance_information,
        insured_information: payload.insured_information,
        icd_codes: payload.icd_codes,
        cpt_codes: payload.cpt_codes,
        claim_status: payload.claim_status,
        status_reason: payload.status_reason || '',
        extraction_confidence: payload.extraction_confidence || {},
        submitted_at: submittedAt
      };

      if (existing) {
        result = await supabase
          .from('claims')
          .update(record)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('claims')
          .insert(record)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update assignment status to Completed if submitted
      if (isSubmitted) {
        await supabase
          .from('document_assignments')
          .update({
            status: 'Completed',
            completed_at: new Date().toISOString()
          })
          .eq('document_id', payload.document_id);
      } else {
        await supabase
          .from('document_assignments')
          .update({ status: 'In Progress' })
          .eq('document_id', payload.document_id);
      }

      // Activity log
      try {
        await supabase.from('activity_logs').insert({
          user_id: payload.employee_id,
          action: isSubmitted ? 'Claim Submitted' : 'Claim Saved Draft',
          description: `Claim ${payload.claim_status} for patient ${payload.patient_information?.first_name || ''} ${payload.patient_information?.last_name || ''}`,
          document_id: payload.document_id
        });
      } catch (e) {
        console.warn(e);
      }

      return result.data;
    }

    // Fallback to local backend
    const res = await fetch('/api/claims/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: payload.document_id,
        employee_id: payload.employee_id,
        patient: payload.patient_information,
        address: payload.address_information,
        contact: payload.contact_information,
        insurance: payload.insurance_information,
        insured: payload.insured_information,
        icd_records: payload.icd_codes,
        cpt_records: payload.cpt_codes,
        claim_status: payload.claim_status,
        status_reason: payload.status_reason,
        submitted: isSubmitted
      })
    });

    if (!res.ok) throw new Error('Failed to save claim');
    return await res.json();
  },

  /**
   * Get claim details by document ID
   */
  async getClaimByDocumentId(documentId: string): Promise<any> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('document_id', documentId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      // Format to matching frontend structure
      return {
        id: data.id,
        document_id: data.document_id,
        employee_id: data.employee_id,
        claim_status: data.claim_status,
        status_reason: data.status_reason,
        patient: data.patient_information || {},
        address: data.address_information || {},
        contact: data.contact_information || {},
        insurance: data.insurance_information || {},
        insured: data.insured_information || {},
        icd_records: data.icd_codes || [],
        cpt_records: data.cpt_codes || [],
        extraction_confidence: data.extraction_confidence || {},
        submitted_at: data.submitted_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    }

    // Fallback to local backend
    const res = await fetch(`/api/claims/by-document/${documentId}`);
    if (!res.ok) return null;
    return await res.json();
  },

  /**
   * Search / List all claims
   */
  async getAllClaims(filters?: { query?: string; status?: string; employeeId?: string }): Promise<any[]> {
    if (isSupabaseConfigured() && supabase) {
      let q = supabase
        .from('claims')
        .select(`
          *,
          documents (id, file_name, folder_name),
          employees (id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'All') {
        q = q.eq('claim_status', filters.status);
      }
      if (filters?.employeeId) {
        q = q.eq('employee_id', filters.employeeId);
      }

      const { data, error } = await q;
      if (error) throw error;

      let list = data || [];
      if (filters?.query) {
        const queryLower = filters.query.toLowerCase();
        list = list.filter((c: any) => {
          const pat = c.patient_information;
          const pName = `${pat?.first_name || ''} ${pat?.last_name || ''}`.toLowerCase();
          const pol = (c.insurance_information?.policy_number || '').toLowerCase();
          const clm = (c.insurance_information?.claim_number || '').toLowerCase();
          const ins = (c.insurance_information?.insurer || '').toLowerCase();
          return pName.includes(queryLower) || pol.includes(queryLower) || clm.includes(queryLower) || ins.includes(queryLower);
        });
      }

      return list.map((c: any) => ({
        id: c.id,
        document_id: c.document_id,
        document_name: c.documents?.file_name || 'Document',
        folder_name: c.documents?.folder_name || 'Folder',
        employee_id: c.employee_id,
        employee_name: c.employees?.full_name || 'Assigned Employee',
        claim_status: c.claim_status,
        status_reason: c.status_reason,
        patient_name: `${c.patient_information?.first_name || ''} ${c.patient_information?.last_name || ''}`.trim() || 'Patient',
        policy_number: c.insurance_information?.policy_number || 'N/A',
        claim_number: c.insurance_information?.claim_number || 'N/A',
        insurer: c.insurance_information?.insurer || 'N/A',
        total_amount: (c.cpt_codes || []).reduce((acc: number, item: any) => acc + (parseFloat(item.cpt_amount) || 0), 0),
        cpt_count: (c.cpt_codes || []).length,
        icd_count: (c.icd_codes || []).length,
        created_at: c.created_at,
        submitted_at: c.submitted_at
      }));
    }

    // Fallback to local backend
    const url = `/api/claims?${filters?.query ? `q=${encodeURIComponent(filters.query)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch claims');
    return await res.json();
  }
};
