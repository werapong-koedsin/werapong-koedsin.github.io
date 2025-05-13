
$(function () {
  setupDropZone();
  setupSubmit();
});

const model = "nailcheck-3xvkl";
const version = "1";
const api_key = "2oPwezRkA7W5FqItNt5W";

function setupDropZone() {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("file");

  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.background = "#edf2f7";
  });
  dropZone.addEventListener("dragleave", () => dropZone.style.background = "#fff");
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.background = "#fff";
    fileInput.files = e.dataTransfer.files;
    showUploadStatus(fileInput.files.length);
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

    Array.from(files).forEach((file) => {
      getBase64fromFile(file).then((base64image) => {
        const url = `https://classify.roboflow.com/${model}/${version}?api_key=${api_key}`;
        const settings = {
          method: "POST",
          url: url,
          data: base64image,
          error: () => {
            $("#output").append(`<p>Error processing ${file.name}</p>`);
          },
          success: (response) => {
            const predictions = response.predictions;
            const top = predictions?.[0];
            if (top) {
              const reader = new FileReader();
              reader.onload = function (e) {
                const imgHTML = `<img src="${e.target.result}" style="max-width:100%; margin-top:0.5rem" alt="${file.name}"/>`;
                $("#output").append(`
                  <div style="margin-bottom: 2rem;">
                    <h4>${file.name}</h4>
                    <p><strong>Class:</strong> ${top.class}</p>
                    <p><strong>Confidence:</strong> ${(top.confidence * 100).toFixed(2)}%</p>
                    ${imgHTML}
                  </div>
                `);
              };
              reader.readAsDataURL(file);
            } else {
              $("#output").append(`<p>No prediction for ${file.name}</p>`);
            }
          },
        };
        $.ajax(settings);
      });
    });
  });
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
