import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';

export interface EmployeeRecord {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'employee';
  created_at?: string;
  workload_count?: number;
}

export const employeeService = {
  async getEmployees(): Promise<EmployeeRecord[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('role', { ascending: true });

      if (!error && data && data.length > 0) {
        // Fetch assignment counts
        const { data: assignments } = await supabase
          .from('document_assignments')
          .select('employee_id, status')
          .neq('status', 'Completed');

        const countMap: Record<string, number> = {};
        assignments?.forEach((a: any) => {
          countMap[a.employee_id] = (countMap[a.employee_id] || 0) + 1;
        });

        return data.map((emp: any) => ({
          ...emp,
          workload_count: countMap[emp.id] || 0
        }));
      }
    }

    // Fallback to local backend
    try {
      const res = await fetch('/api/assignments/employees');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to static list
    }

    return [
      { id: 'emp-001', full_name: 'Monesh Pondhe', email: 'Monesh@gmail.com', role: 'employee', workload_count: 2 },
      { id: 'emp-002', full_name: 'Chetan Patil', email: 'Chetan@gmail.com', role: 'employee', workload_count: 1 },
      { id: 'admin-001', full_name: 'System Administrator', email: 'admin@gmail.com', role: 'admin', workload_count: 0 }
    ];
  }
};
