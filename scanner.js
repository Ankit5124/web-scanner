/* =====================================================
   COMPLIANCEAI - SCANNER PAGE
   Loaded ONLY by scanner.html
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ---------------------------------------------------
       BACKEND CONFIG
       Change these two lines if your FastAPI route differs.
    --------------------------------------------------- */

    const API_BASE_URL = "http://127.0.0.1:8000";
    const SCAN_ENDPOINT = "/scan-barcode";
    const UPLOAD_FIELD_NAME = "file"; // must match the UploadFile param name in FastAPI

    const uploadZone = document.getElementById("uploadZone");
    const productImage = document.getElementById("productImage");
    const uploadContent = document.getElementById("uploadContent");
    const imagePreview = document.getElementById("imagePreview");
    const previewImage = document.getElementById("previewImage");
    const removeImage = document.getElementById("removeImage");
    const startScan = document.getElementById("startScan");

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
        if (uploadZone.contains(event.relatedTarget)) return;
        uploadZone.classList.remove("dragging");
    });

    uploadZone.addEventListener("drop", function (event) {

        event.preventDefault();
        uploadZone.classList.remove("dragging");

        const files = event.dataTransfer.files;
        if (!files || files.length === 0) return;

        const file = files[0];

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

    /* ---------- SEND IMAGE TO BACKEND ---------- */

    function extractErrorMessage(data, status) {
        if (!data) return "Server error (" + status + ")";
        if (typeof data.detail === "string") return data.detail;
        if (Array.isArray(data.detail)) {
            // FastAPI validation errors: [{loc:["body","file"], msg:"field required"}, ...]
            return data.detail.map(function (d) {
                return (d.loc ? d.loc.join(".") + ": " : "") + (d.msg || JSON.stringify(d));
            }).join("; ");
        }
        return "Server error (" + status + ")";
    }

    function scanProduct(file) {

        const formData = new FormData();
        formData.append(UPLOAD_FIELD_NAME, file);

        return fetch(API_BASE_URL + SCAN_ENDPOINT, {
            method: "POST",
            body: formData
        }).then(async function (response) {

            let data = null;
            try {
                data = await response.json();
            } catch (parseError) {
                /* response wasn't JSON */
            }

            console.log("scan-barcode response:", response.status, data);

            if (!response.ok) {
                throw new Error(extractErrorMessage(data, response.status));
            }

            if (!data || data.status !== "found") {
                throw new Error("No matching product was found for this image.");
            }

            return data;
        });
    }

    /* ---------- PROGRESS OVERLAY + REAL SCAN ---------- */

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
        let serverSettled = false;
        let serverResult = null;
        let serverError = null;

        scanProduct(selectedFile)
            .then(function (result) { serverResult = result; })
            .catch(function (error) { serverError = error; })
            .finally(function () { serverSettled = true; });

        const interval = setInterval(function () {

            /* climb to 90% while waiting on the network request,
               only complete once the backend has actually responded */
            if (!serverSettled) {
                current = Math.min(current + 1, 90);
            } else {
                current = Math.min(current + 4, 100);
            }

            progress.style.width = current + "%";
            percent.textContent = current + "%";

            if (current < 25) {
                message.textContent = "Processing product image...";
                setStep(steps, 0);
            } else if (current < 50) {
                message.textContent = "Reading barcode from image...";
                setStep(steps, 1);
            } else if (current < 75) {
                message.textContent = "Looking up product in database...";
                setStep(steps, 2);
            } else if (current < 100) {
                message.textContent = "Checking regulatory declarations...";
                setStep(steps, 3);
            } else {
                message.textContent = "Generating compliance report...";
            }

            if (current >= 100 && serverSettled) {
                clearInterval(interval);
                finishScan(serverResult, serverError);
            }

        }, 50);
    }

    function setStep(steps, index) {
        steps.forEach(function (step, i) {
            if (!step) return;
            step.classList.remove("active", "completed");
            if (i < index) step.classList.add("completed");
            if (i === index) step.classList.add("active");
        });
    }

    function finishScan(result, error) {

        const overlay = document.getElementById("scanningOverlay");

        if (error || !result) {
            if (overlay) overlay.classList.remove("show");
            startScan.disabled = false;
            alert(
                "Scan failed: " + (error ? error.message : "Unknown error") +
                "\n\nMake sure the backend is running at " + API_BASE_URL + " and try again."
            );
            return;
        }

        saveReport(result);

        setTimeout(function () {
            window.location.href = "result.html";
        }, 400);
    }

    /* ---------- SAVE THE REAL BACKEND RESULT ---------- */

    function saveReport(result) {

        const report = {
            schemaVersion: 2,
            barcode: result.barcode || (result.product && result.product.barcode) || "",
            product: result.product || {},
            image: previewImage ? previewImage.src : "",
            inspectionId: "CAI-" + new Date().getFullYear() + "-" +
                Math.floor(10000 + Math.random() * 90000),
            scannedAt: new Date().toISOString()
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
