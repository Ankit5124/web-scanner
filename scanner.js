document.addEventListener("DOMContentLoaded", function () {

    console.log("ComplianceAI Scanner loaded");


    /* ==========================================
       ELEMENTS
    ========================================== */

    const uploadZone =
        document.getElementById("uploadZone");

    const productImage =
        document.getElementById("productImage");

    const uploadContent =
        document.getElementById("uploadContent");

    const imagePreview =
        document.getElementById("imagePreview");

    const previewImage =
        document.getElementById("previewImage");

    const removeImage =
        document.getElementById("removeImage");

    const startScan =
        document.getElementById("startScan");


    let selectedFile = null;


    /* ==========================================
       CLICK UPLOAD AREA
    ========================================== */

    uploadZone.addEventListener("click", function (event) {

        if (event.target === removeImage) {
            return;
        }

        productImage.click();

    });


    /* ==========================================
       FILE SELECTED
    ========================================== */

    productImage.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        loadImage(file);

    });


    /* ==========================================
       LOAD IMAGE
    ========================================== */

    function loadImage(file) {

        console.log("Selected file:", file.name);


        /* CHECK TYPE */

        if (!file.type.startsWith("image/")) {

            alert(
                "Please select an image file."
            );

            return;

        }


        /* CHECK SIZE */

        if (file.size > 10 * 1024 * 1024) {

            alert(
                "Image must be smaller than 10 MB."
            );

            return;

        }


        selectedFile = file;


        const reader =
            new FileReader();


        reader.onload = function (event) {

            console.log(
                "Image loaded successfully"
            );


            previewImage.src =
                event.target.result;


            uploadContent.style.display =
                "none";


            imagePreview.style.display =
                "block";


            startScan.disabled =
                false;


            startScan.classList.add(
                "ready"
            );

        };


        reader.onerror = function () {

            alert(
                "Could not read this image."
            );

        };


        reader.readAsDataURL(file);

    }



    /* ==========================================
       DRAG & DROP
    ========================================== */

    uploadZone.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadZone.classList.add(
                "dragging"
            );

        }
    );


    uploadZone.addEventListener(
        "dragleave",
        function () {

            uploadZone.classList.remove(
                "dragging"
            );

        }
    );


    uploadZone.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadZone.classList.remove(
                "dragging"
            );


            const files =
                event.dataTransfer.files;


            if (files.length === 0) {
                return;
            }


            const file = files[0];


            loadImage(file);


            /*
             * Put the dropped file into
             * the input as well.
             */

            try {

                const dataTransfer =
                    new DataTransfer();

                dataTransfer.items.add(file);

                productImage.files =
                    dataTransfer.files;

            } catch (error) {

                console.log(
                    "DataTransfer not supported"
                );

            }

        }
    );



    /* ==========================================
       REMOVE IMAGE
    ========================================== */

    removeImage.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            selectedFile = null;


            productImage.value = "";


            previewImage.removeAttribute(
                "src"
            );


            imagePreview.style.display =
                "none";


            uploadContent.style.display =
                "flex";


            startScan.disabled =
                true;


            startScan.classList.remove(
                "ready"
            );

        }
    );



    /* ==========================================
       START SCAN
    ========================================== */

    startScan.addEventListener(
        "click",
        function () {

            console.log(
                "Start AI Inspection clicked"
            );


            if (!selectedFile) {

                alert(
                    "Please upload a product image first."
                );

                return;

            }


            runScanner();

        }
    );



    /* ==========================================
       AI SCANNER
    ========================================== */

    function runScanner() {

        const overlay =
            document.getElementById(
                "scanningOverlay"
            );


        const progress =
            document.getElementById(
                "scanProgress"
            );


        const percent =
            document.getElementById(
                "scanPercent"
            );


        const message =
            document.getElementById(
                "scanMessage"
            );


        const steps = [

            document.getElementById("step1"),

            document.getElementById("step2"),

            document.getElementById("step3"),

            document.getElementById("step4")

        ];


        overlay.classList.add(
            "show"
        );


        let current = 0;


        const interval =
            setInterval(function () {

                current++;


                progress.style.width =
                    current + "%";


                percent.textContent =
                    current + "%";



                /* STEP 1 */

                if (current < 25) {

                    message.textContent =
                        "Processing product image...";


                    activateStep(
                        steps,
                        0
                    );

                }


                /* STEP 2 */

                else if (current < 50) {

                    message.textContent =
                        "Extracting text using OCR...";


                    activateStep(
                        steps,
                        1
                    );

                }


                /* STEP 3 */

                else if (current < 75) {

                    message.textContent =
                        "Checking mandatory declarations...";


                    activateStep(
                        steps,
                        2
                    );

                }


                /* STEP 4 */

                else if (current < 95) {

                    message.textContent =
                        "Analyzing compliance risks...";


                    activateStep(
                        steps,
                        3
                    );

                }


                /* COMPLETE */

                else {

                    message.textContent =
                        "Generating compliance report...";

                }


                if (current >= 100) {

                    clearInterval(interval);


                    saveReport();


                    setTimeout(
                        function () {

                            window.location.href =
                                "result.html";

                        },
                        700
                    );

                }

            }, 50);

    }



    /* ==========================================
       STEP ANIMATION
    ========================================== */

    function activateStep(
        steps,
        number
    ) {

        steps.forEach(
            function (step, index) {

                if (!step) return;


                if (index <= number) {

                    step.classList.add(
                        "active"
                    );

                    step.classList.add(
                        "completed"
                    );

                }

            }
        );

    }



    /* ==========================================
       SAVE REPORT
    ========================================== */

    function saveReport() {

        const report = {

            productName:
                "Premium Packaged Commodity",

            category:
                "Food & Beverage",

            mrp:
                "₹240",

            quantity:
                "1 kg",

            manufacturer:
                "ABC Foods Pvt. Ltd.",

            score:
                87,

            confidence:
                94.6,

            status:
                "COMPLIANT",

            inspectionId:
                "CAI-" +
                Date.now(),

            image:
                previewImage.src

        };


        localStorage.setItem(
            "complianceReport",
            JSON.stringify(report)
        );


        console.log(
            "Report saved:",
            report
        );

    }

});
