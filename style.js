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
