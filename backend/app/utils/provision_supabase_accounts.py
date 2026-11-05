"""
Bill Nexa – Supabase Demo Accounts Provisioner
Creates the three specified users in Supabase Auth and associates them with employees records:
1. Admin: admin@gmail.com / Admin@123 (role: admin)
2. Employee 1: Monesh@gmail.com / Monesh@123 (role: employee)
3. Employee 2: Chetan@gmail.com / Chetan@123 (role: employee)

Usage:
  python -m backend.app.utils.provision_supabase_accounts
"""

import sys
import os
from supabase import create_client, Client
from backend.app.core.config import settings

DEMO_ACCOUNTS = [
    {
        "email": "admin@gmail.com",
        "password": "Admin@123",
        "full_name": "System Administrator",
        "role": "admin"
    },
    {
        "email": "Monesh@gmail.com",
        "password": "Monesh@123",
        "full_name": "Monesh Pondhe",
        "role": "employee"
    },
    {
        "email": "Chetan@gmail.com",
        "password": "Chetan@123",
        "full_name": "Chetan Patil",
        "role": "employee"
    }
]

def provision_accounts():
    supabase_url = settings.SUPABASE_URL
    service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY

    if not supabase_url or not service_role_key:
        print("[ERROR] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
        print("Please configure them in .env before running account provisioning.")
        return False

    try:
        supabase: Client = create_client(supabase_url, service_role_key)
        print(f"[INFO] Connecting to Supabase at: {supabase_url}")

        for acc in DEMO_ACCOUNTS:
            email = acc["email"]
            pwd = acc["password"]
            name = acc["full_name"]
            role = acc["role"]

            try:
                # Try to create user via Supabase Auth Admin API
                res = supabase.auth.admin.create_user({
                    "email": email,
                    "password": pwd,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": name,
                        "role": role
                    }
                })
                user_id = res.user.id
                print(f"[CREATED] Supabase Auth user: {email} (UID: {user_id})")

                # Upsert into employees table
                supabase.table("employees").upsert({
                    "id": user_id,
                    "full_name": name,
                    "email": email,
                    "role": role
                }).execute()
                print(f"[SUCCESS] Synced {email} to employees table with role: {role}")

            except Exception as e:
                err_msg = str(e)
                if "already registered" in err_msg or "already exists" in err_msg or "User already exists" in err_msg:
                    print(f"[EXISTS] User {email} already exists in Supabase Auth.")
                    # Update password and metadata
                    try:
                        # Find user ID
                        users = supabase.auth.admin.list_users()
                        target = next((u for u in users if u.email == email), None)
                        if target:
                            supabase.auth.admin.update_user_by_id(target.id, {
                                "password": pwd,
                                "user_metadata": {"full_name": name, "role": role}
                            })
                            supabase.table("employees").upsert({
                                "id": target.id,
                                "full_name": name,
                                "email": email,
                                "role": role
                            }).execute()
                            print(f"[UPDATED] Updated {email} profile and password.")
                    except Exception as inner_e:
                        print(f"[WARNING] Could not update existing user: {inner_e}")
                else:
                    print(f"[ERROR] Failed to provision {email}: {err_msg}")

        print("\n[COMPLETE] All demo accounts verified in Supabase.")
        return True

    except Exception as e:
        print(f"[FATAL] Supabase initialization failed: {e}")
        return False

if __name__ == "__main__":
    provision_accounts()

