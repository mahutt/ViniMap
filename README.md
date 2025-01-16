# SOEN 390: Repo Setup Instructions for React Native with Expo

## Team Members:
- Thomas Mahut (40249811)
- Vinisha Manek (40229456)
- Michael Porato (40264297)
- Christopher Mezzacappa (40249451)
- Philippe Rebeiro (40248291)
- Michael Mezzacappa (40263789)
- Annabel Zecchel (40245507)
- Ambrose McLaughlin (40239754)

## Tech Stack  
  1. React Native with Expo Framework
  2. Typescript (FE)
  3. Node.js & Express.js

## Repo Details
- **GitHub Repository**: [ViniMap](https://github.com/mahutt/ViniMap)
- **Clone the Repo**:  
  1. Click the "Code" button on the GitHub repository page.
  2. Copy the HTTPS link.

## Default Configuration from Expo Docs
- **Template**: Default template, designed to build multi-screen apps.
- **Tools Included**: 
  - Expo CLI
  - Expo Router Library
  - TypeScript Configuration enabled
- **Recommended For**: Most apps

---

## Mac Users:

1. **Download Xcode**  
   - Go to the App Store and download Xcode.
   - Choose **macOS 14.2** or later and **iOS 17.2** or later when installing (tested up to macOS 15.2 and iOS 18.2).
   
   If you forgot to select the correct version during installation:
   - Open Xcode.
   - Click **Xcode** on the top left -> **Settings** -> **Platforms**, and verify your iOS version (17.2 or later).

2. **Setup iPhone Simulator**  
   - Open the Simulator (Xcode installs it by default). You can do this by opening a terminal and running `open -a Simulator`.
   - Right-click the Simulator icon on the taskbar -> **Devices** -> Select **iPhone 15** (default is iPhone SE, but select iPhone 15 for a better experience).

3. **Install Dependencies**  
   - Open the terminal.
   - Download **Homebrew** if you don't have it already.
   - **If already installed**, run:  
     `brew update`
   
   Then run the following to install **watchman**:  
   `brew install watchman`

4. **Navigate to the Client Directory**  
   - In your terminal, type:  
     `cd client`

5. **Install Node Modules**  
   Before running the app, make sure to install the project dependencies.  
   Run:  
   `npm install`  
   This should be done **once** after cloning the repository or if you encounter any issues with missing packages.

6. **Run the App**  
   To run the app on iOS:  
   `npm run ios`

7. **Fixing simctl Issue**
   If you get this error: `Unable to run simctl: Error: xcrun simctl help exited with non-zero code: 72`, follow these steps:
   - Open Xcode.
   - Click **Xcode** on the top left -> **Settings** -> **Locations**.
   - Go to **Command Line Tools** dropdown. Even if it appears that an option is selected, it is possible no option is selected and you should click on the drop down, and then click the most recent option.
   - Repeat step 6.

8. **Fixing File Issues**  
   If you encounter file problems, open a new terminal window (press **Command + Space** and search for **Terminal**), then run:  
   `brew services restart watchman`

   After restarting **watchman**, try running the app again:  
   `npm run ios`

---

## Windows Users:
# Android Studio Installation and Setup Guide for Windows Users

## Step 1: Download and Install Android Studio
1. **Visit the Android Studio Website**:
   - Go to [https://developer.android.com/studio](https://developer.android.com/studio).
   - Scroll down and download the executable named: `android-studio-2024.2.2.13-windows.exe`.

2. **Install Android Studio**:
   - Open the downloaded `.exe` file and follow the installation instructions.
   - During the installation, make sure to check the **Virtual Device** option.
   - Specify the default installation path.
   - Once installation is complete, click **Finish**.

## Step 2: Set Up Android SDK
1. **Open Android Studio**:
   - If prompted to download the SDK, select **Android 14.0 (UpsideDownCake) API Level 34 Revision 2**.
   - If not prompted, go to the **More Actions** menu on the Android Studio welcome page and click **SDK Manager**.
   - Find and install the aforementioned SDK.

## Step 3: Create a Virtual Device
1. **Create Virtual Device**:
   - From the **More Actions** menu, select **Virtual Device Manager**.
   - Click **Create Virtual Device**.
   - Select **Pixel 9 Pro** as the device.
   - Choose **UpsideDownCake** for the release name.
   - Click **Finish** (keep default settings).

## Step 4: Configure Environment Variables
1. **Copy Android SDK Location**:
   - Go back to the **SDK Manager** and copy the Android SDK Location.

2. **Set Environment Variables**:
   - Search for **Env** in the Windows search bar (bottom left) and select **Edit the system environment variables**.
   - Click **Environment Variables**.
   - Under **System Variables**, click **New...** and add the following:
     - **Variable Name**: `ANDROID_HOME`
     - **Variable Value**: `SDK_PATH` (paste the path copied from SDK Manager)

## Step 5: Run the Android Application
1. **Navigate to Project Directory**:
   - Open **VS Code**.
   - Navigate to the client directory:
     ```bash
     cd client
     ```

2. **Run the Android Application**:
   - Execute the following command:
     ```bash
     npm run android
     ```

You're done!

By following these instructions, you should be able to set up and run the ViniMap app on both MacOS and Windows via the Emulators.
