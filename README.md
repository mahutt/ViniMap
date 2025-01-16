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
   - Choose **macOS 14.2** and **iOS 17.2** when installing.
   
   If you forgot to select the correct version during installation:
   - Open Xcode.
   - Click **Xcode** on the top left -> **Settings** -> **Platforms**, and choose **iOS 17.2**.

2. **Setup iPhone Simulator**  
   - Open Xcode.
   - Right-click the Xcode icon on the taskbar -> **Devices** -> Select **iPhone 15** (default is iPhone SE, but select iPhone 15 for a better experience).

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

7. **Fixing File Issues**  
   If you encounter file problems, open a new terminal window (press **Command + Space** and search for **Terminal**), then run:  
   `brew services restart watchman`

   After restarting **watchman**, try running the app again:  
   `npm run ios`

---

## Windows Users:
Instructions for Windows users are not specified here. Please ensure you have the necessary software like Android Studio or Visual Studio Code set up, and follow general Expo documentation for Windows setup.

---

By following these instructions, you should be able to set up and run the ViniMap app on both macOS and Windows.
