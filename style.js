document.addEventListener("DOMContentLoaded", () => {


    /* =========================
       ANIMATED STAT NUMBERS
    ========================= */

    const numbers = document.querySelectorAll(
        ".stat-content h2"
    );


    numbers.forEach(element => {

        const target = parseFloat(
            element.dataset.value
        );

        if (isNaN(target)) return;


        let current = 0;

        const duration = 1200;

        const startTime = performance.now();


        function animate(time) {

            const progress =
                Math.min(
                    (time - startTime) / duration,
                    1
                );


            const eased =
                1 - Math.pow(1 - progress, 3);


            current = target * eased;


            if (
                element.textContent.includes("%")
            ) {

                if (target % 1 !== 0) {

                    element.textContent =
                        current.toFixed(1) + "%";

                } else {

                    element.textContent =
                        Math.floor(current) + "%";

                }

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



    /* =========================
       NAVIGATION ACTIVE STATE
    ========================= */

    const navLinks =
        document.querySelectorAll(
            "nav a"
        );


    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            function () {

                navLinks.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                this.classList.add(
                    "active"
                );

            }
        );

    });



    /* =========================
       NOTIFICATION
    ========================= */

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



    /* =========================
       INSPECTION BUTTON
    ========================= */

    const scanner =
        document.querySelector(
            ".scanner-box"
        );


    if (scanner) {

        scanner.addEventListener(
            "mouseenter",
            () => {

                document.body.classList.add(
                    "scanner-hover"
                );

            }
        );


        scanner.addEventListener(
            "mouseleave",
            () => {

                document.body.classList.remove(
                    "scanner-hover"
                );

            }
        );

    }



    /* =========================
       TABLE ROW CLICK
    ========================= */

    const rows =
        document.querySelectorAll(
            "tbody tr"
        );


    rows.forEach(row => {

        row.style.cursor = "pointer";


        row.addEventListener(
            "click",
            () => {

                const product =
                    row.querySelector(
                        ".product-cell strong"
                    );


                if (product) {

                    console.log(
                        "Selected inspection:",
                        product.textContent
                    );

                }

            }
        );

    });

});
