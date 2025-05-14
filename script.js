
const translations = {
  en: {
    title: "Early Detection Nail Diseases",
    upload: "Drop or Select Image(s)",
    dropzone: "Drag and drop image files here or tap to select.",
    run: "Run",
    notice: "Note: This system is for preliminary screening only and may have inaccuracies. A proper diagnosis should be made by a qualified medical professional.",
    resultHeader: "Results"
  },
  th: {
    title: "ระบบตรวจสอบโรคเล็บเบื้องต้น",
    upload: "ลากหรือเลือกภาพเล็บ",
    dropzone: "ลากภาพมาวางหรือติ๊กเพื่อเลือกไฟล์ภาพ",
    run: "ตรวจสอบ",
    notice: "หมายเหตุ: ระบบนี้เป็นเพียงการคัดกรองเบื้องต้น อาจเกิดข้อผิดพลาดได้ ควรปรึกษาแพทย์ผู้เชี่ยวชาญเพื่อการวินิจฉัยที่ถูกต้อง",
    resultHeader: "ผลลัพธ์"
  }
};

function setLanguage(lang) {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });
}
