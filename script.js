
$(function () {
  setupDropZone();
  setupSubmit();
});

const model = "nailcheck-3xvkl";
const version = "1";
const api_key = "2oPwezRkA7W5FqItNt5W";

const classDescriptions = {
  "Acral Lentiginous Melanoma": "มะเร็งผิวหนังชนิดที่พบที่เล็บหรือฝ่ามือ",
  "Bluish Nail": "เล็บเขียวจากการขาดออกซิเจน",
  "Clubbing": "ปลายนิ้วปูดร่วมกับเล็บงุ้ม",
  "Healthy Nail": "เล็บปกติ",
  "Koilonychia": "เล็บรูปช้อน",
  "Nail Pitting": "เล็บเป็นรูเล็กๆ",
  "Onychogryphosis": "เล็บหนางอเหมือนเขา",
  "Terry's nail": "เล็บซีดส่วนปลายแดง"
};

function setupDropZone() {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("file");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", function (e) {
    e.preventDefault();
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      showUploadStatus(fileInput.files.length);
    }
  });

  fileInput.addEventListener("change", () => {
    showUploadStatus(fileInput.files.length);
  });
}

function showUploadStatus(count) {
  const statusEl = document.getElementById("uploadStatus");
  if (count > 0) {
    statusEl.innerHTML = `<p style="color: green;"><strong>${count}</strong> image(s) uploaded. You can now run inference.</p>`;
  } else {
    statusEl.innerHTML = "";
  }
}

function setupSubmit() {
  $("#inputForm").submit(function (e) {
    e.preventDefault();
    const files = $("#file")[0].files;
    if (!files.length) return alert("Please upload at least one image.");

    $("#output").html("<p>Processing...</p>");
    $("#resultContainer").show();

    let processed = 0;
    const total = files.length;
    $("#output").html("");

    Array.from(files).forEach((file) => {
      getBase64fromFile(file).then((base64image) => {
        const url = `https://classify.roboflow.com/${model}/${version}?api_key=${api_key}`;
        const settings = {
          method: "POST",
          url: url,
          data: base64image,
          error: () => {
            $("#output").append(`<p>Error processing ${file.name}</p>`);
            processed++;
            if (processed === total) showDone();
          },
          success: (response) => {
            const predictions = response.predictions;
            const top = predictions?.[0];
            if (top) {
              const reader = new FileReader();
              reader.onload = function (e) {
                const explanation = classDescriptions[top.class] || "ไม่มีคำอธิบาย";
                const imgHTML = `<img src="${e.target.result}" class="result-image" alt="${file.name}"/>`;
                $("#output").append(`
                  <div style="margin-bottom: 2rem;">
                    <h4>${file.name}</h4>
                    <p><strong>Class:</strong> ${top.class}</p>
                    <p><strong>Confidence:</strong> ${(top.confidence * 100).toFixed(2)}%</p>
                    <p><strong>อธิบาย:</strong> ${explanation}</p>
                    ${imgHTML}
                  </div>
                `);
              };
              reader.readAsDataURL(file);
            } else {
              $("#output").append(`<p>No prediction for ${file.name}</p>`);
            }
            processed++;
            if (processed === total) showDone();
          },
        };
        $.ajax(settings);
      });
    });
  });
}

function showDone() {
  $("#output").append("<p style='color:green;'>✅ Inference completed for all images.</p>");
}

function getBase64fromFile(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resizeImage(reader.result).then(resolve);
    };
    reader.onerror = reject;
  });
}

function resizeImage(base64Str) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.src = base64Str;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      let [w, h] = [img.width, img.height];
      const MAX = 1500;
      if (w > h && w > MAX) h *= MAX / w, w = MAX;
      else if (h > MAX) w *= MAX / h, h = MAX;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 1.0));
    };
  });
}

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
