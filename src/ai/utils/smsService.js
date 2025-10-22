// smsService.js (or wherever you place the function)

// 1. 🛑 CRITICAL: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL 🛑
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFy9qASoC1yavyUe7dfzX2b72gBfQ-OBcVTyTGQUAaue1jpOXjNhHGt_Z3rrAw-3OA/exec"; 

/**
 * Sends an SMS via the secure Google Apps Script proxy.
 * Called after an appointment is successfully booked.
 * @param {string} to - The recipient phone number (e.g., "+1234567890").
 * @param {string} messageBody - The message content.
 */
export async function sendAppointmentSMS(to, messageBody) {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The body payload MUST match what the Apps Script doPost(e) is expecting
      body: JSON.stringify({ to: to, body: messageBody }) 
    });
    
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