# HostelPortal Setup Guide

To get your application connected to Google Sheets and Supabase, follow these manual steps. Since these involve your personal accounts, you will need to set them up and insert the generated secrets into the application environment.

## 1. Google Sheets Setup (Registrations)

### Create the Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. In the first row of `Sheet1`, enter the following column headers exactly:
   - **A1:** Timestamp
   - **B1:** Room Title
   - **C1:** Registration Type (e.g., Just Me, We're 2)
   - **D1:** Reference Code
   - **E1:** Student Names
   - **F1:** Student Genders
   - **G1:** Student Phones

### Get the Spreadsheet ID
Look at the URL of your Google Sheet. It will look like this:
`https://docs.google.com/spreadsheets/d/1X2Y3Z.../edit`
The long string of characters (`1X2Y3Z...`) is your **Spreadsheet ID**.

### Setup Google Cloud Service Account
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or use an existing one).
3. Search for **Google Sheets API** and click **Enable**.
4. Go to **IAM & Admin** > **Service Accounts**.
5. Click **Create Service Account**, give it a name (e.g., `hostel-portal-bot`), and click **Done**.
6. On the Service Accounts list, click the one you just created, go to the **Keys** tab, click **Add Key** > **Create new key** > **JSON**.
7. The JSON file will download to your computer. Open it in a text editor.

### Connect Sheet to Service Account
1. Copy the `client_email` address from the JSON file you downloaded.
2. Go back to your Google Sheet, click **Share** in the top right.
3. Paste the `client_email` address, give it **Editor** access, and click **Share**.

### Add to AI Studio Secrets
In AI Studio, go to the **Settings/Secrets** menu and add these keys:
- `GOOGLE_SHEET_ID`: (The ID from your URL)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: (The `client_email` from the JSON)
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: (Copy the *entire* `private_key` string from the JSON, exactly as it appears, including the `-----BEGIN PRIVATE KEY-----` and `\n` characters)

---

## 2. Supabase Setup (Hostel Room Media)

### Create a Storage Bucket
1. Log into [Supabase](https://supabase.com/) and create a new project.
2. On the left dashboard menu, click **Storage**.
3. Click **New bucket** and name it `hostel-media`.
4. **Important:** Make sure to toggle **"Public bucket"** to ON.

### Upload and Get Links
1. Click on your `hostel-media` bucket and upload your pictures and videos of the hostel rooms.
2. Once uploaded, click the **Get URL** button next to an image to copy its public link.

### Update the App
1. Open the file `src/data/rooms.ts` in the editor.
2. Replace the current placeholder `image` URLs with your new Supabase URLs.
3. You can also add more rooms here, and add a `video` field if you want to support video playbacks in the UI in the future.

### (Optional) Setup Supabase Keys
If you later decide you want to load rooms dynamically from a Supabase PostgreSQL database instead of the `rooms.ts` file, add these to your Secrets:
- `VITE_SUPABASE_URL`: (Found in Supabase Settings > API > Project URL)
- `VITE_SUPABASE_ANON_KEY`: (Found in Supabase Settings > API > Project API Keys)
