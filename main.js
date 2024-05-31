document
  .getElementById("outfitImage")
  .addEventListener("change", function (event) {
    const preview = document.getElementById("outfitPreview");
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  });

document
  .getElementById("customizationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;
    const formData = new FormData(form);

    const requiredFields = [
      "occasion",
      "purchaseType",
      "gender",
      "ageGroup",
      "budget",
    ];
    let valid = true;

    requiredFields.forEach(function (field) {
      const fieldElements = form.elements[field];
      if (fieldElements) {
        if (fieldElements.length && fieldElements[0].type === "radio") {
          // This handles radio button groups
          const isChecked = Array.from(fieldElements).some(
            (element) => element.checked
          );
          if (!isChecked) {
            valid = false;
            fieldElements[0].parentElement.style.borderColor = "red";
          } else {
            fieldElements[0].parentElement.style.borderColor = "";
          }
        } else if (!fieldElements.value) {
          valid = false;
          fieldElements.parentElement.style.borderColor = "red";
        } else {
          fieldElements.parentElement.style.borderColor = "";
        }
      } else {
        valid = false;
      }
    });

    if (!valid) {
      showToast("Please fill out all required fields.", false);
      return;
    }

    const formDataObj = {};
    formData.forEach((value, key) => {
      if (key === "jewelryType") {
        const selectedOptions = Array.from(form.elements[key])
          .filter((option) => option.checked)
          .map((option) => option.nextElementSibling.textContent)
          .join(", ");
        formDataObj[key] = selectedOptions;
      } else {
        formDataObj[key] = value;
      }
    });

    const outfitImage = form.elements["outfitImage"].files[0];
    if (outfitImage) {
      const reader = new FileReader();
      reader.onload = function (e) {
        formDataObj["outfitImageBase64"] = e.target.result;
        localStorage.setItem("formData", JSON.stringify(formDataObj));
        showToast("Submitted Successfully", true);
      };
      reader.readAsDataURL(outfitImage);
    } else {
      localStorage.setItem("formData", JSON.stringify(formDataObj));
      showToast("Submitted Successfully", true);
    }
  });

function showToast(message, isSuccess) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const downloadBtn = document.getElementById("downloadBtn");
  const closeToastBtn = document.getElementById("closeToast");

  toastMessage.textContent = message;
  toast.className = "toast show";
  downloadBtn.style.display = isSuccess ? "block" : "none";

  closeToastBtn.onclick = () => {
    toast.className = "toast";
  };

  if (isSuccess) {
    downloadBtn.onclick = downloadPDF;
  }

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 10000); 
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const formData = JSON.parse(localStorage.getItem("formData"));
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Jewelry Customization Form Data", 10, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  let y = 30;
  for (const [key, value] of Object.entries(formData)) {
    if (key !== "outfitImageBase64") {
      doc.setFont(undefined, "bold");
      doc.text(convertCamelCaseToWords(key) + ":", 10, y);
      doc.setFont(undefined, "normal");
      if (key === "jewelryType") {
        doc.text(value.toString(), 50, y);
      } else {
        doc.text(value.toString(), 50, y);
      }
      y += 10;
    }
  }

  if (formData.outfitImageBase64) {
    doc.addImage(formData.outfitImageBase64, "JPEG", 10, y, 50, 50);
  }

  doc.save("formData.pdf");
}

function convertCamelCaseToWords(str) {
  return str.replace(/([A-Z])/g, " $1").trim();
}
