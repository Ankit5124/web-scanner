/* =====================================================
   COMPLIANCEAI - SCANNER PAGE
   Loaded ONLY by scanner.html
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const uploadZone = document.getElementById("uploadZone");
    const productImage = document.getElementById("productImage");
    const uploadContent = document.getElementById("uploadContent");
    const imagePreview = document.getElementById("imagePreview");
    const previewImage = document.getElementById("previewImage");
    const removeImage = document.getElementById("removeImage");
    const startScan = document.getElementById("startScan");

    /* Stop here if this is not the scanner page */
    if (!uploadZone || !productImage) return;

    let selectedFile = null;

    /* ---------- OPEN FILE PICKER ---------- */

    uploadZone.addEventListener("click", function (event) {
        if (removeImage && removeImage.contains(event.target)) return;
        productImage.click();
    });

    /* ---------- FILE SELECTED ---------- */

    productImage.addEventListener("change", function () {
        const file = this.files[0];
        if (file) loadImage(file);
    });

    /* ---------- LOAD + VALIDATE ---------- */

    function loadImage(file) {

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (JPG, PNG or WEBP).");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Image must be smaller than 10 MB.");
            return;
        }

        selectedFile = file;

        const reader = new FileReader();

        reader.onload = function (event) {
            previewImage.src = event.target.result;
            uploadContent.style.display = "none";
            imagePreview.style.display = "block";
            startScan.disabled = false;
            startScan.classList.add("ready");
        };

        reader.onerror = function () {
            alert("Could not read this image. Try another file.");
        };

        reader.readAsDataURL(file);
    }

    /* ---------- DRAG & DROP ---------- */

    uploadZone.addEventListener("dragover", function (event) {
        event.preventDefault();
        uploadZone.classList.add("dragging");
    });

    uploadZone.addEventListener("dragleave", function (event) {
        /* ignore drag-leave fired by child elements */
        if (uploadZone.contains(event.relatedTarget)) return;
        uploadZone.classList.remove("dragging");
    });

    uploadZone.addEventListener("drop", function (event) {

        event.preventDefault();
        uploadZone.classList.remove("dragging");

        const files = event.dataTransfer.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        /* keep the <input> in sync with the dropped file */
        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            productImage.files = dataTransfer.files;
        } catch (error) {
            /* older browsers: input stays empty, selectedFile still works */
        }

        loadImage(file);
    });

    /* ---------- REMOVE IMAGE ---------- */

    if (removeImage) {
        removeImage.addEventListener("click", function (event) {
            event.stopPropagation();
            selectedFile = null;
            productImage.value = "";
            previewImage.removeAttribute("src");
            imagePreview.style.display = "none";
            uploadContent.style.display = "flex";
            startScan.disabled = true;
            startScan.classList.remove("ready");
        });
    }

    /* ---------- START INSPECTION ---------- */

    startScan.addEventListener("click", function () {
        if (!selectedFile) {
            alert("Please upload a product image first.");
            return;
        }
        runScanner();
    });

    /* ---------- PROGRESS SIMULATION ---------- */

    function runScanner() {

        const overlay = document.getElementById("scanningOverlay");
        const progress = document.getElementById("scanProgress");
        const percent = document.getElementById("scanPercent");
        const message = document.getElementById("scanMessage");

        const steps = [
            document.getElementById("step1"),
            document.getElementById("step2"),
            document.getElementById("step3"),
            document.getElementById("step4")
        ];

        if (!overlay || !progress || !percent || !message) return;

        overlay.classList.add("show");
        startScan.disabled = true;

        let current = 0;

        const interval = setInterval(function () {

            current++;

            progress.style.width = current + "%";
            percent.textContent = current + "%";

            if (current < 25) {
                message.textContent = "Processing product image...";
                setStep(steps, 0);
            } else if (current < 50) {
                message.textContent = "Extracting text using OCR...";
                setStep(steps, 1);
            } else if (current < 75) {
                message.textContent = "Checking mandatory declarations...";
                setStep(steps, 2);
            } else if (current < 95) {
                message.textContent = "Analyzing compliance risks...";
                setStep(steps, 3);
            } else {
                message.textContent = "Generating compliance report...";
            }

            if (current >= 100) {
                clearInterval(interval);
                saveReport();
                setTimeout(function () {
                    window.location.href = "result.html";
                }, 700);
            }

        }, 50);
    }

    /* Marks earlier steps completed and the current one active */
    function setStep(steps, index) {
        steps.forEach(function (step, i) {
            if (!step) return;
            step.classList.remove("active", "completed");
            if (i < index) step.classList.add("completed");
            if (i === index) step.classList.add("active");
        });
    }

    /* ---------- SAVE RESULT FOR result.html ---------- */

    function saveReport() {

        const report = {
            productName: "Premium Packaged Commodity",
            category: "Food & Beverage",
            mrp: "₹240",
            quantity: "1 kg",
            manufacturer: "ABC Foods Pvt. Ltd.",
            score: 87,
            confidence: 94.6,
            status: "COMPLIANT",
            inspectionId: "CAI-" + new Date().getFullYear() + "-" +
                Math.floor(10000 + Math.random() * 90000),
            image: previewImage ? previewImage.src : ""
        };

        try {
            localStorage.setItem("complianceReport", JSON.stringify(report));
        } catch (error) {
            /* image too large for localStorage: store without it */
            report.image = "";
            localStorage.setItem("complianceReport", JSON.stringify(report));
        }
    }

});
