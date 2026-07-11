# Guide: How to Add & Replace Screenshots on the Website

This guide explains how to replace the current placeholder screenshots on the Silent Zone Library landing page with your own real app screenshots.

---

## 📂 The Image Folder
All screenshot assets are stored in the following directory:
`silent_zone_library_website/assets/images/`

---

## 🏷️ How to Name the Files
To replace the screenshots without editing any HTML code, simply name your new screenshot files exactly as follows and overwrite the existing ones in the folder:

### 1. Student App Experience Row (Row 1)
* **`screenshot_1.png`**: Replace this with a screenshot of the **Student Home Dashboard** (the glassmorphic counter page showing sitting duration).
* **`screenshot_3.png`**: Replace this with a screenshot of the **Student Attendance Logs** list (showing the sitting duration history and extra hours).

### 2. Admin Management Panel Row (Row 2)
* **`screenshot_2.png`**: Replace this with a screenshot of the **Admin Seats Availability Grid** (showing the 40-seat layout with red/green seat occupancies).
* **`screenshot_4.png`**: Replace this with a screenshot of the **Admin Student Profile Detail View** (showing active/inactive subscription cards and the "Allot Seat" / "Edit" buttons).

---

## 🛠️ Tips for Professional Results
1. **Device Frame Ratio**: Keep your screenshot dimensions consistent. The website is styled for portrait smartphone screens (roughly a `9:19` aspect ratio, e.g. `1080x2400` pixels).
2. **File Formats**: It is highly recommended to save screenshots as `.png` files for maximum color fidelity. If you prefer using `.jpg` or `.webp`, open the `index.html` file in a text editor and change the image extensions (e.g. `screenshot_1.png` to `screenshot_1.jpg`).
3. **Simulating Data**: Open the app using the dummy data we seeded (`9000000001` through `9000000008`) to capture beautifully populated layouts with live counters and charts!
