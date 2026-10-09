const OCR_BASE_URL = "http://localhost:8000";

const ocrService = {
  /**
   * Sends an image blob/file to the OCR service.
   * Returns the structured JSON contract:
   * { success, text, exerciseName, sets, reps, confidence, exercises[] }
   */
  analyzeWorkoutImage: async (imageBlob) => {
    const formData = new FormData();
    formData.append("image", imageBlob, "capture.png");

    const response = await fetch(`${OCR_BASE_URL}/ocr/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const detail = await response
        .json()
        .then((data) => data.detail)
        .catch(() => null);
      throw new Error(detail || `OCR request failed (${response.status})`);
    }

    return response.json();
  },

  health: async () => {
    const response = await fetch(`${OCR_BASE_URL}/health`);
    if (!response.ok) throw new Error("OCR service unavailable");
    return response.json();
  },
};

export default ocrService;


