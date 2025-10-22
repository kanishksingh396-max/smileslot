// This code replaces the existing content of your sendAppointmentSMS function

// 🛑 CRITICAL: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL 🛑
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFy9qASoC1yavyUe7dfzX2b72gBfQ-OBcVTyTGQUAaue1jpOXjNhHGt_Z3rrAw-3OA/exec"; 

/**
 * Sends an SMS via the secure Google Apps Script proxy.
 * NOTE: Switched to URLSearchParams for reliable data delivery.
 */
export async function sendAppointmentSMS(to, messageBody) {
  // Create URLSearchParams object to format the data as form-urlencoded
  const payload = new URLSearchParams();
  payload.append('to', to);
  payload.append('body', messageBody);

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      // 🚨 IMPORTANT: DO NOT set the Content-Type header here! 
      // URLSearchParams sets the correct header (application/x-www-form-urlencoded) automatically.
      // If you set it manually, it often breaks.
      body: payload.toString() 
    });
    
    // ... (rest of the error handling remains the same) ...

    const resultJson = await res.json();
    
    if (res.ok) { 
        console.log("Appointment SMS successfully queued.", resultJson);
        return { success: true, response: resultJson };
    } else {
        console.error("Error triggering SMS:", resultJson);
        return { success: false, error: resultJson.error || "Failed to trigger Apps Script." };
    }
  } catch (error) {
    console.error("Network connection error to Apps Script:", error);
    return { success: false, error: "Failed to connect to the external SMS service." };
  }
}