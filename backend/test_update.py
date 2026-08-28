import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
client = create_client(os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_SERVICE_ROLE_KEY'))

# Try updating the first user in the DB
res = client.table('users').select('*').limit(1).execute()
if res.data:
    user = res.data[0]
    print(f"Testing update on user {user['id']}")
    update_res = client.table('users').update({'onboarding_completed': True}).eq('id', user['id']).execute()
    print("Update result:", update_res)
else:
    print("No users found.")
