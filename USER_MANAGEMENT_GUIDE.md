# 👥 User Management - Complete Guide

## ✅ Fixed Issues

The following problems have been resolved:

### ❌ Previous Error: "Ошибка при создании пользователя"
**Cause:** Users were only being created in `user_profiles` table without creating authentication credentials in Supabase Auth.

**Solution:** Updated the `createUser` function to:
1. Create user in Supabase Auth (auth.users)
2. Create user profile in user_profiles table
3. Proper error handling with detailed messages

## 🚀 How to Create a User

### Method 1: Via Admin Dashboard (Recommended)

1. **Login to Admin Panel**
   - URL: http://localhost:3000/login
   - Email: `admin@blog.local`
   - Password: `Admin@2026Secure!`

2. **Navigate to Users Tab**
   - Click on **"👥 Пользователи"** tab

3. **Create User**
   - Click **"➕ Добавить пользователя"** button
   - Fill in the form:
     - **Логин (Username)**: Unique username (e.g., `john`)
     - **Пароль (Password)**: Minimum 6 characters
     - **Имя (Full Name)**: Optional, e.g., `John Doe`
     - **Роль (Role)**: Choose from dropdown
       - ✏️ Редактор (Editor) - Can create/edit news
       - ⭐ Админ (Admin) - Can manage channels and users
       - 👑 Супер-админ (Super Admin) - Full access

4. **Submit**
   - Click **"✅ Создать пользователя"**
   - Success message will appear
   - Page reloads to show new user

### Method 2: Via API

```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john" \
  -d "password=SecurePass123" \
  -d "full_name=John Doe" \
  -d "role=editor"
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "john",
    "role": "editor",
    "full_name": "John Doe"
  }
}
```

## ✏️ How to Edit a User

**Note:** Only super-admins can edit users.

### Steps:

1. **Go to Users Tab**
   - Navigate to **"👥 Пользователи"**

2. **Click Edit Icon**
   - Find the user you want to edit
   - Click the **✏️** icon next to their name

3. **Edit User Details**
   - Update any of the fields:
     - **Логин**: Change username
     - **Пароль**: Leave empty to keep current password
     - **Имя**: Update full name
     - **Роль**: Change role if needed

4. **Save Changes**
   - Click **"💾 Сохранить изменения"**
   - Success message appears
   - Page reloads with updated user

## 🔧 Technical Implementation

### Files Modified/Created:

1. **[lib/db.ts](file:///Users/admin/Documents/GitHub/blog/lib/db.ts)**
   - ✅ Updated `createUser()` - Creates both auth user and profile
   - ✅ Added `updateUser()` - Update user details
   - ✅ Improved error handling

2. **[app/api/users/create/route.ts](file:///Users/admin/Documents/GitHub/blog/app/api/users/create/route.ts)**
   - ✅ Enhanced validation
   - ✅ Better error messages
   - ✅ Logging for debugging

3. **[app/api/users/update/route.ts](file:///Users/admin/Documents/GitHub/blog/app/api/users/update/route.ts)** (NEW)
   - ✅ PUT endpoint for updating users
   - ✅ Username uniqueness validation
   - ✅ Password validation

4. **[app/dashboard/dashboard-client.tsx](file:///Users/admin/Documents/GitHub/blog/app/dashboard/dashboard-client.tsx)**
   - ✅ Added edit user modal
   - ✅ Edit button for each user
   - ✅ State management for editing

### Database Schema:

```sql
-- user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  password TEXT, -- bcrypt hash
  role VARCHAR(50) DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🐛 Troubleshooting

### Error: "Пользователь с таким именем уже существует"

**Cause:** Username must be unique.

**Solution:** 
- Try a different username
- Or edit the existing user instead

### Error: "Пароль должен быть не менее 6 символов"

**Cause:** Password too short.

**Solution:** Use at least 6 characters.

### Error: "Auth user creation error: User already registered"

**Cause:** Email/username already exists in Supabase Auth.

**Solution:**
1. Check if user exists in dashboard
2. Use a different username/email
3. Or delete the existing user first in Supabase Dashboard

### Console shows "Profile creation error"

**Cause:** RLS policies or missing permissions.

**Solution:**
1. Ensure you're using SUPABASE_SERVICE_ROLE_KEY
2. Check RLS policies in database schema
3. Verify user has proper permissions

## 📊 User Roles Explained

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Editor** | Create/edit news, view channels | Content writers |
| **Admin** | All editor + manage channels, manage editors | Team leads |
| **Super Admin** | Full system access | System administrators |

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens for sessions (24h expiry)
- ✅ HttpOnly cookies
- ✅ Server-side validation
- ✅ Duplicate username prevention
- ✅ Role-based access control
- ✅ Supabase RLS policies

## 📝 Example Usage

### Creating Different User Types:

**Editor:**
```
Username: alice
Password: AliceNews123
Full Name: Alice Smith
Role: editor
```

**Admin:**
```
Username: bob_admin
Password: BobAdmin456
Full Name: Bob Johnson
Role: admin
```

**Super Admin:**
```
Username: superadmin
Password: SuperSecure789
Full Name: System Administrator
Role: super_admin
```

## 🎯 Best Practices

1. **Use Strong Passwords**
   - Mix of uppercase, lowercase, numbers, symbols
   - At least 8 characters recommended

2. **Assign Appropriate Roles**
   - Start with lowest necessary permission
   - Promote only when needed

3. **Regular Audits**
   - Review user list periodically
   - Remove inactive accounts

4. **Keep Credentials Secure**
   - Don't share passwords
   - Use environment variables

## 📁 Related Files

- `lib/db.ts` - Database functions
- `app/api/users/create/route.ts` - Create user API
- `app/api/users/update/route.ts` - Update user API
- `app/dashboard/dashboard-client.tsx` - UI components
- `supabase/migrations/20260321_create_database_schema.sql` - Database schema

---

**Last Updated:** March 21, 2026
**Status:** ✅ Fully Functional
