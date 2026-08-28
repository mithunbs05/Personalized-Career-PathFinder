import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
client = create_client(os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_SERVICE_ROLE_KEY'))

async def main():
    try:
        # Create a test user via auth API
        try:
            res = client.auth.sign_up({"email": "test_user_99@example.com", "password": "password123"})
            user_id = res.user.id
            token = res.session.access_token
        except Exception:
            res = client.auth.sign_in_with_password({"email": "test_user_99@example.com", "password": "password123"})
            user_id = res.user.id
            token = res.session.access_token
        
        print("Logged in as", user_id)
        
        # Now impersonate
        client.postgrest.auth(token)
        
        profile_data = {
            "user_id": user_id,
            "profile_metadata": {"hello": "world"},
            "completed_categories": [],
            "onboarding_completed": True,
        }
        
        # Test profiles upsert
        print("Upserting profile...")
        upsert_res = client.table("profiles").upsert(profile_data, on_conflict="user_id").execute()
        print("Profile upsert:", upsert_res)
        
        # Test users update
        print("Updating users...")
        update_res = client.table("users").update({"onboarding_completed": True}).eq("id", user_id).execute()
        print("Users update:", update_res)
        
    except Exception as e:
        print("Exception:", e)

asyncio.run(main())
