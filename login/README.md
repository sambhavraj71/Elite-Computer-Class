# Elite Computer Classes - Admin Panel

## Setup Instructions

### 1. Firebase Configuration

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project (same as Android app)
3. Click on **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click **Add app** → Select **Web** (</> icon)
6. Register app with nickname: "Elite Admin Panel"
7. Copy the Firebase configuration object
8. Open `js/firebase-config.js` and replace the config values

### 2. Enable Firebase Authentication for Web

1. In Firebase Console → **Authentication** → **Settings**
2. Under **Authorized domains**, add your domain (or localhost for testing)

### 3. Create Admin User

Option A - Using Firebase Console:
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter admin email and password
4. This user will have admin access

Option B - Using Android App:
1. Sign up normally in the app
2. This account can be used for admin panel

### 4. Update Firestore Rules

Go to **Firestore Database** → **Rules** and update:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admin can read/write all users (authenticated users can read all)
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Run the Admin Panel

**Option A - Local Testing:**
1. Install a simple HTTP server:
   ```
   npm install -g http-server
   ```
2. Navigate to login folder:
   ```
   cd "C:\ELite Android\login"
   ```
3. Run server:
   ```
   http-server
   ```
4. Open browser: http://localhost:8080

**Option B - Using Python:**
```
cd "C:\ELite Android\login"
python -m http.server 8000
```
Open: http://localhost:8000

**Option C - Deploy to Firebase Hosting:**
```
firebase init hosting
firebase deploy
```

## Features

✅ **User Management**
- View all registered users
- Search users by name, email, phone, reg number
- Edit user details (course, batch, fees, duration, year)
- Delete users
- Real-time sync with Firebase

✅ **Admin Features**
- Secure login with Firebase Authentication
- Modern, responsive UI
- Live data updates
- Easy to use interface

## Admin Panel Access

- **URL**: http://localhost:8080 (or your deployed URL)
- **Login**: Use any Firebase authenticated email/password
- **Recommended**: Create a dedicated admin account

## Security Notes

- Only authenticated users can access the panel
- Firestore rules control data access
- Admin credentials should be kept secure
- Consider adding role-based access control for production

## Support

For issues or questions, contact the development team.
