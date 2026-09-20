document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DASHBOARD - ANIMATED NUMBERS
    ===================================================== */

    const statNumbers =
        document.querySelectorAll(".stat-content h2");


    statNumbers.forEach(element => {

        const target =
            parseFloat(element.dataset.value);

        if (isNaN(target)) return;

        let current = 0;

        const duration = 1200;

        const startTime =
            performance.now();


        function animate(time) {

            const progress =
                Math.min(
                    (time - startTime) / duration,
                    1
                );


            const eased =
                1 - Math.pow(1 - progress, 3);


            current =
                target * eased;


            if (
                element.textContent.includes("%") ||
                element.dataset.value.includes?.("%")
            ) {

                element.textContent =
                    target % 1 !== 0
                        ? current.toFixed(1) + "%"
                        : Math.floor(current) + "%";

            } else {

                element.textContent =
                    Math.floor(current);

            }


            if (progress < 1) {

                requestAnimationFrame(animate);

            }

        }


        requestAnimationFrame(animate);

    });



    /* =====================================================
       NAVIGATION
    ===================================================== */

    const navLinks =
        document.querySelectorAll("nav a");


    navLinks.forEach(link => {

        link.addEventListener("click", function () {

            if (
                this.getAttribute("href") === "#"
            ) {

                return;

            }

            navLinks.forEach(item => {

                item.classList.remove("active");

            });


            this.classList.add("active");

        });

    });



    /* =====================================================
       SCANNER PAGE
    ===================================================== */

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


    if (uploadZone && productImage) {


        /* CLICK UPLOAD */

        uploadZone.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === removeImage
                ) {

                    return;

                }

                productImage.click();

            }
        );


        /* FILE SELECT */

        productImage.addEventListener(
            "change",
            (event) => {

                const file =
                    event.target.files[0];

                if (file) {

                    handleFile(file);

                }

            }
        );


        /* DRAG ENTER */

        uploadZone.addEventListener(
            "dragover",
            (event) => {

                event.preventDefault();

                uploadZone.classList.add(
                    "dragging"
                );

            }
        );


        /* DRAG LEAVE */

        uploadZone.addEventListener(
            "dragleave",
            () => {

                uploadZone.classList.remove(
                    "dragging"
                );

            }
        );


        /* DROP */

        uploadZone.addEventListener(
            "drop",
            (event) => {

                event.preventDefault();

                uploadZone.classList.remove(
                    "dragging"
                );


                const file =
                    event.dataTransfer.files[0];


                if (
                    file &&
                    file.type.startsWith("image/")
                ) {

                    handleFile(file);

                }

            }
        );

    }



    /* =====================================================
       HANDLE IMAGE
    ===================================================== */

    function handleFile(file) {

        if (!file.type.startsWith("image/")) {

            alert(
                "Please upload a valid image file."
            );

            return;

        }


        if (file.size > 10 * 1024 * 1024) {

            alert(
                "Image size must be below 10 MB."
            );

            return;

        }


        selectedFile = file;


        const reader =
            new FileReader();


        reader.onload = function (event) {

            previewImage.src =
                event.target.result;


            uploadContent.style.display =
                "none";


            imagePreview.style.display =
                "block";


            if (startScan) {

                startScan.disabled = false;

                startScan.classList.add(
                    "ready"
                );

            }

        };


        reader.readAsDataURL(file);

    }



    /* =====================================================
       REMOVE IMAGE
    ===================================================== */

    if (removeImage) {

        removeImage.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                selectedFile = null;


                productImage.value = "";


                imagePreview.style.display =
                    "none";


                uploadContent.style.display =
                    "flex";


                startScan.disabled = true;


                startScan.classList.remove(
                    "ready"
                );

            }
        );

    }



    /* =====================================================
       START AI SCAN
    ===================================================== */

    if (startScan) {

        startScan.addEventListener(
            "click",
            () => {

                if (!selectedFile) {

                    return;

                }


                startAIAnalysis();

            }
        );

    }



    /* =====================================================
       AI ANALYSIS
    ===================================================== */

    function startAIAnalysis() {

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


        if (!overlay) return;


        overlay.classList.add("show");


        let value = 0;


        const messages = [

            "Initializing computer vision...",

            "Detecting product label...",

            "Extracting text using OCR...",

            "Identifying mandatory declarations...",

            "Checking regulatory requirements...",

            "Analyzing potential violations...",

            "Generating compliance score..."

        ];


        const steps = [

            document.getElementById("step1"),

            document.getElementById("step2"),

            document.getElementById("step3"),

            document.getElementById("step4")

        ];


        const interval =
            setInterval(() => {

                value += 1;


                progress.style.width =
                    value + "%";


                percent.textContent =
                    value + "%";


                /* MESSAGE */

                if (
                    value < 15
                ) {

                    message.textContent =
                        messages[0];

                } else if (
                    value < 35
                ) {

                    message.textContent =
                        messages[1];

                    activateStep(
                        steps,
                        0
                    );

                } else if (
                    value < 55
                ) {

                    message.textContent =
                        messages[2];

                    activateStep(
                        steps,
                        1
                    );

                } else if (
                    value < 75
                ) {

                    message.textContent =
                        messages[3];

                    activateStep(
                        steps,
                        2
                    );

                } else if (
                    value < 90
                ) {

                    message.textContent =
                        messages[4];

                    activateStep(
                        steps,
                        3
                    );

                } else {

                    message.textContent =
                        messages[6];

                }


                /* FINISH */

                if (value >= 100) {

                    clearInterval(interval);


                    setTimeout(() => {

                        saveInspectionData();

                        window.location.href =
                            "result.html";

                    }, 800);

                }

            }, 55);

    }



    function activateStep(
        steps,
        index
    ) {

        steps.forEach(
            (step, i) => {

                if (!step) return;


                if (i <= index) {

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



    /* =====================================================
       SAVE INSPECTION DATA
    ===================================================== */

    function saveInspectionData() {

        const data = {

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
                new Date()
                    .getFullYear() +
                "-" +
                Math.floor(
                    10000 +
                    Math.random() * 90000
                ),

            image:
                previewImage
                    ? previewImage.src
                    : ""

        };


        localStorage.setItem(
            "complianceReport",
            JSON.stringify(data)
        );

    }



    /* =====================================================
       RESULT PAGE
    ===================================================== */

    const reportData =
        localStorage.getItem(
            "complianceReport"
        );


    if (reportData) {

        try {

            const data =
                JSON.parse(reportData);


            updateResultPage(data);

        } catch (error) {

            console.log(
                "Could not load report data."
            );

        }

    }



    function updateResultPage(data) {

        const productName =
            document.getElementById(
                "productName"
            );


        const category =
            document.getElementById(
                "productCategory"
            );


        const mrp =
            document.getElementById(
                "mrp"
            );


        const quantity =
            document.getElementById(
                "quantity"
            );


        const manufacturer =
            document.getElementById(
                "manufacturer"
            );


        const inspectionId =
            document.getElementById(
                "inspectionId"
            );


        const resultScore =
            document.getElementById(
                "resultScore"
            );


        const resultStatus =
            document.getElementById(
                "resultStatus"
            );


        const resultCircle =
            document.getElementById(
                "resultCircle"
            );


        const resultImage =
            document.getElementById(
                "resultProductImage"
            );


        if (productName)
            productName.textContent =
                data.productName;


        if (category)
            category.textContent =
                data.category;


        if (mrp)
            mrp.textContent =
                data.mrp;


        if (quantity)
            quantity.textContent =
                data.quantity;


        if (manufacturer)
            manufacturer.textContent =
                data.manufacturer;


        if (inspectionId)
            inspectionId.textContent =
                data.inspectionId;


        if (resultScore)
            resultScore.textContent =
                data.score + "%";


        /* PRODUCT IMAGE */

        if (
            resultImage &&
            data.image
        ) {

            resultImage.innerHTML =
                `<img src="${data.image}" alt="Product">`;

        }


        /* SCORE CIRCLE */

        if (resultCircle) {

            const degrees =
                data.score * 3.6;


            resultCircle.style.background =
                `conic-gradient(
                    #22c55e
                    0deg
                    ${degrees}deg,
                    #202938
                    ${degrees}deg
                    360deg
                )`;

        }


        /* STATUS */

        if (
            resultStatus &&
            data.score < 75
        ) {

            resultStatus.classList.remove(
                "success"
            );

            resultStatus.classList.add(
                "danger"
            );

            resultStatus.innerHTML =
                "<span>!</span> NON-COMPLIANT";

        }

    }



    /* =====================================================
       NEW SCAN
    ===================================================== */

    const newScan =
        document.getElementById(
            "newScan"
        );


    if (newScan) {

        newScan.addEventListener(
            "click",
            () => {

                window.location.href =
                    "scanner.html";

            }
        );

    }



    /* =====================================================
       PRINT / DOWNLOAD
    ===================================================== */

    const printReport =
        document.getElementById(
            "printReport"
        );


    if (printReport) {

        printReport.addEventListener(
            "click",
            () => {

                window.print();

            }
        );

    }



    /* =====================================================
       NOTIFICATION
    ===================================================== */

    const notification =
        document.querySelector(
            ".notification"
        );


    if (notification) {

        notification.addEventListener(
            "click",
            () => {

                alert(
                    "No new system alerts. All AI services are operational."
                );

            }
        );

    }

});
