document.addEventListener("DOMContentLoaded", () => {

    const camera = document.getElementById("camera");
    const canvas = document.getElementById("captureCanvas");

    const captureButton = document.getElementById("captureButton");
    const stopCameraButton = document.getElementById("stopCameraButton");

    const barcodeImageInput =
        document.getElementById("barcodeImageInput");

    const scanStatus =
        document.getElementById("scanStatus");

    const loading =
        document.getElementById("loading");

    const errorMessage =
        document.getElementById("errorMessage");


    // -----------------------------------------
    // FASTAPI URL
    // -----------------------------------------

    const API_URL = "http://127.0.0.1:8000";


    let cameraStream = null;


    // -----------------------------------------
    // START CAMERA
    // -----------------------------------------

    async function startCamera() {

        try {

            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },
                audio: false
            });

            camera.srcObject = cameraStream;

            scanStatus.textContent =
                "Camera ready. Point it at the barcode.";

        } catch (error) {

            console.error(error);

            scanStatus.textContent =
                "Camera could not be started. Use the barcode image option.";

        }

    }


    // -----------------------------------------
    // STOP CAMERA
    // -----------------------------------------

    function stopCamera() {

        if (cameraStream) {

            cameraStream.getTracks().forEach(track => {
                track.stop();
            });

            cameraStream = null;
        }

        camera.srcObject = null;

        scanStatus.textContent =
            "Camera stopped.";

    }


    // -----------------------------------------
    // SHOW ERROR
    // -----------------------------------------

    function showError(message) {

        errorMessage.textContent = message;

        errorMessage.classList.remove("hidden");

    }


    // -----------------------------------------
    // HIDE ERROR
    // -----------------------------------------

    function hideError() {

        errorMessage.textContent = "";

        errorMessage.classList.add("hidden");

    }


    // -----------------------------------------
    // START LOADING
    // -----------------------------------------

    function startLoading() {

        loading.classList.remove("hidden");

        captureButton.disabled = true;

        barcodeImageInput.disabled = true;

    }


    // -----------------------------------------
    // STOP LOADING
    // -----------------------------------------

    function stopLoading() {

        loading.classList.add("hidden");

        captureButton.disabled = false;

        barcodeImageInput.disabled = false;

    }


    // -----------------------------------------
    // SEND IMAGE TO FASTAPI
    // -----------------------------------------

    async function sendBarcodeImage(blob) {

        hideError();

        startLoading();

        scanStatus.textContent =
            "Sending barcode image to server...";


        const formData = new FormData();

        formData.append(
            "file",
            blob,
            "barcode.jpg"
        );


        try {

            const response = await fetch(
    `${API_URL}/scan-barcode`,
    {
        method: "POST",
        body: formData
    }
);


            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );

            }


            const result = await response.json();

            console.log("FastAPI result:", result);


            // -----------------------------------------
            // BARCODE NOT DETECTED
            // -----------------------------------------

            if (result.status === "barcode_not_detected") {

                showError(
                    "No barcode detected. Please place the barcode clearly inside the scanner."
                );

                stopLoading();

                scanStatus.textContent =
                    "Barcode not detected.";

                return;
            }


            // -----------------------------------------
            // PRODUCT NOT FOUND
            // -----------------------------------------

            if (result.status === "not_found") {

                showError(
                    `Barcode ${result.barcode} was detected, but this product is not registered in the database.`
                );

                stopLoading();

                scanStatus.textContent =
                    "Product not found.";

                return;
            }


            // -----------------------------------------
            // PRODUCT FOUND
            // -----------------------------------------

            if (result.status === "found") {

                localStorage.setItem(
                    "scanResult",
                    JSON.stringify(result)
                );


                stopCamera();


                scanStatus.textContent =
                    "Product found!";


                window.location.replace("result.html?v=" + Date.now());

                return;
            }


            // -----------------------------------------
            // UNKNOWN RESPONSE
            // -----------------------------------------

            throw new Error(
                "Unexpected response from server."
            );


        } catch (error) {

            console.error(error);

            showError(
                "Could not connect to FastAPI. Make sure the backend is running."
            );

            scanStatus.textContent =
                "Connection failed.";

        } finally {

            stopLoading();

        }

    }


    // -----------------------------------------
    // CAPTURE CAMERA IMAGE
    // -----------------------------------------

    captureButton.addEventListener(
        "click",
        () => {

            hideError();


            if (!cameraStream) {

                showError(
                    "Camera is not running."
                );

                return;
            }


            if (
                camera.videoWidth === 0 ||
                camera.videoHeight === 0
            ) {

                showError(
                    "Camera is not ready yet."
                );

                return;
            }


            canvas.width =
                camera.videoWidth;

            canvas.height =
                camera.videoHeight;


            const context =
                canvas.getContext("2d");


            context.drawImage(
                camera,
                0,
                0,
                canvas.width,
                canvas.height
            );


            canvas.toBlob(
                blob => {

                    if (blob) {

                        sendBarcodeImage(blob);

                    } else {

                        showError(
                            "Could not capture barcode image."
                        );

                    }

                },
                "image/jpeg",
                0.95
            );

        }
    );


    // -----------------------------------------
    // STOP CAMERA BUTTON
    // -----------------------------------------

    stopCameraButton.addEventListener(
        "click",
        stopCamera
    );


    // -----------------------------------------
    // IMAGE UPLOAD FALLBACK
    // -----------------------------------------

    barcodeImageInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            sendBarcodeImage(file);

        }
    );


    // -----------------------------------------
    // START CAMERA
    // -----------------------------------------

    startCamera();


    // -----------------------------------------
    // CLEANUP
    // -----------------------------------------

    window.addEventListener(
        "beforeunload",
        stopCamera
    );

});
