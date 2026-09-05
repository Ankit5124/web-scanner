document.addEventListener("DOMContentLoaded", function () {

    const imageInput = document.getElementById("imageInput");
    const preview = document.getElementById("preview");
    const analyzeButton = document.getElementById("analyzeButton");
    const resetButton = document.getElementById("resetButton");
    const uploadContent = document.getElementById("uploadContent");

    if (!imageInput || !preview || !analyzeButton) {
        console.error("Scanner elements not found.");
        return;
    }

    // =========================
    // IMAGE UPLOAD / PREVIEW
    // =========================

    imageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image.");
            this.value = "";
            return;
        }

        const imageURL = URL.createObjectURL(file);

        preview.src = imageURL;
        preview.style.display = "block";

        if (uploadContent) {
            uploadContent.style.display = "none";
        }

        analyzeButton.disabled = false;
        analyzeButton.innerHTML = "🔍 Analyze Product";
    });


    // =========================
    // ANALYZE
    // =========================

    analyzeButton.addEventListener("click", function (event) {

        event.preventDefault();

        const file = imageInput.files[0];

        if (!file) {
            alert("Please upload an image first.");
            return;
        }

        analyzeButton.disabled = true;
        analyzeButton.innerHTML = "⏳ Analyzing...";

        const formData = new FormData();
        formData.append("file", file);

        fetch("http://127.0.0.1:8000/upload", {
            method: "POST",
            body: formData
        })

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Server error: " + response.status);
            }

            return response.json();
        })

        .then(function (data) {

            console.log("FastAPI Response:", data);

            const reader = new FileReader();

            reader.onload = function (event) {

                localStorage.setItem(
                    "scannedImage",
                    event.target.result
                );

                localStorage.setItem(
                    "scanResult",
                    JSON.stringify(data)
                );

                window.location.href = "result.html";
            };

            reader.readAsDataURL(file);
        })

        .catch(function (error) {

            console.error("Upload failed:", error);

            alert(
                "Unable to connect to FastAPI. Make sure the backend is running."
            );

            analyzeButton.disabled = false;
            analyzeButton.innerHTML = "🔍 Analyze Product";
        });

    });

// ==========================================
// LICENCE NUMBER
// ==========================================

let licenseNumber = findValue([
    "Lic\\.?\\s*No\\.?\\s*[:\\-]?\\s*([0-9]{8,15})",
    "Licence\\s*No\\.?\\s*[:\\-]?\\s*([0-9]{8,15})",
    "License\\s*No\\.?\\s*[:\\-]?\\s*([0-9]{8,15})",
    "FSSAI\\s*(?:Lic\\.?|Licence|License)?\\s*(?:No\\.?)?\\s*[:\\-]?\\s*([0-9]{8,15})"
]);


// Fallback: find a licence number near "Lic"
if (licenseNumber === "Not detected") {

    const licenseMatch = rawText.match(
        /(?:Lic\.?|Licence|License)[^0-9]{0,30}([0-9]{8,15})/i
    );

    if (licenseMatch) {
        licenseNumber = licenseMatch[1];
    }
}


document.getElementById("licenseNumber").textContent =
    licenseNumber;

if (licenseNumber === "Not detected") {

    document.getElementById("licenseStatus").textContent =
        "NOT DETECTED";

    document.getElementById("licenseStatus").className =
        "status-warning";
}


// ==========================================
// BATCH NUMBER
// ==========================================

function findBatchNumber() {

    // Format:
    // BATCH NO: A177
    // BATCH NO. A177

    let result = findValue([
        "BATCH\\s*(?:NO\\.?|NUMBER)\\s*[:\\-]?\\s*([A-Z0-9][A-Z0-9\\-\\/]{2,})",
        "LOT\\s*(?:NO\\.?|NUMBER)\\s*[:\\-]?\\s*([A-Z0-9][A-Z0-9\\-\\/]{2,})"
    ]);

    if (result !== "Not detected") {
        return result;
    }


    // Format:
    // BATCH NO.
    // A177

    for (let i = 0; i < lines.length; i++) {

        if (/^(BATCH|BATCH NO\.?|LOT|LOT NO\.?)/i.test(lines[i])) {

            for (
                let j = i + 1;
                j < Math.min(i + 3, lines.length);
                j++
            ) {

                const candidate = lines[j];

                if (
                    /^[A-Z0-9][A-Z0-9\-\/]{2,}$/i.test(candidate) &&
                    !/^(MRP|PKD|PACK|USE|DATE|LIC)/i.test(candidate)
                ) {

                    return candidate;
                }
            }
        }
    }

    return "Not detected";
}


const batchNumber = findBatchNumber();

document.getElementById("batchNumber").textContent =
    batchNumber;


if (batchNumber === "Not detected") {

    document.getElementById("batchStatus").textContent =
        "NOT DETECTED";

    document.getElementById("batchStatus").className =
        "status-warning";
}


// ==========================================
// DATE FINDER
// ==========================================

function findDate(patterns) {

    for (const pattern of patterns) {

        const match = rawText.match(
            new RegExp(pattern, "im")
        );

        if (match && match[1]) {

            return match[1]
                .trim()
                .replace(/\s+/g, " ");
        }
    }

    return "Not detected";
}


// ==========================================
// PACKED / PACKAGING DATE
// ==========================================

let packedDate = findDate([
    "(?:DATE\\s+OF\\s+)?PACKAGING\\s*[:\\-]?\\s*(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})",
    "PKD\\.?\\s*[:\\-]?\\s*(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})",
    "PACKED\\s+ON\\s*[:\\-]?\\s*(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})",
    "PACKING\\s+DATE\\s*[:\\-]?\\s*(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})"
]);


// Month/year format
if (packedDate === "Not detected") {

    packedDate = findDate([
        "PKD\\.?\\s*[:\\-]?\\s*([A-Z]{3,9}[\\/\\-]\\d{2,4})",
        "PACKED\\s+ON\\s*[:\\-]?\\s*([A-Z]{3,9}[\\/\\-]\\d{2,4})"
    ]);
}


document.getElementById("packedDate").textContent =
    packedDate;


if (packedDate === "Not detected") {

    document.getElementById("packedStatus").textContent =
        "NOT DETECTED";

    document.getElementById("packedStatus").className =
        "status-warning";
}


// ==========================================
// EXPIRY / USE BY DATE
// ==========================================

let expiryDate = findDate([
    "DATE\\s+OF\\s+EXPIRY\\s*[:\\-]?\\s*(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})",
    "USE\\s+BY\\s*[:\\-]?\\s*(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})",
    "EXPIRY\\s+DATE\\s*[:\\-]?\\s*(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})",
    "BEST\\s+BEFORE\\s*[:\\-]?\\s*(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})"
]);


if (expiryDate === "Not detected") {

    expiryDate = findDate([
        "USE\\s+BY\\s*[:\\-]?\\s*([A-Z]{3,9}[\\/\\-]\\d{2,4})",
        "BEST\\s+BEFORE\\s*[:\\-]?\\s*([A-Z]{3,9}[\\/\\-]\\d{2,4})"
    ]);
}


document.getElementById("expiryDate").textContent =
    expiryDate;


if (expiryDate === "Not detected") {

    document.getElementById("expiryStatus").textContent =
        "NOT DETECTED";

    document.getElementById("expiryStatus").className =
        "status-warning";
}
    // =========================
    // RESET
    // =========================

    if (resetButton) {

        resetButton.addEventListener("click", function (event) {

            event.preventDefault();

            imageInput.value = "";

            preview.src = "";
            preview.style.display = "none";

            if (uploadContent) {
                uploadContent.style.display = "block";
            }

            analyzeButton.disabled = true;
            analyzeButton.innerHTML = "🔍 Analyze Product";
        });

    }

});
