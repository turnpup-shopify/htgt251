window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('#klaviyo_form_button').forEach((el) => {
        el.addEventListener("click", () => {
            var _klOnsite = window._klOnsite || []; _klOnsite.push(['openForm', 'MpF4JT']);
        })
    })

    // Early exit if no timers are present on the page
    if (!document.querySelector('.timer')) {
        return;
    }

    var second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;

    var now = new Date().getTime();

    document.querySelectorAll(".timer").forEach(el => {

        var tp_start_date = el.getAttribute("data-start");
        var tp_end_date = el.getAttribute("data-end");
        var tp_block_id = el.getAttribute("data-block-id");
        var tp_label_color = el.getAttribute("data-label-color");

        var toLaunchCountDown = new Date(tp_start_date).getTime();
        var countDown = new Date(tp_end_date).getTime();
        var distance = countDown - now;
        var toLaunchDistance = toLaunchCountDown - now;
        var jquerySelector = tp_block_id;
        var debug = Math.floor(toLaunchDistance / (day));
        var debugEnd = Math.floor(distance / (day));

        if (toLaunchDistance >= 0) {

            if (Math.floor(toLaunchDistance / (day)) != 0) {
                var tempNumber = Math.floor(toLaunchDistance / (day));
                if (tempNumber == 1) { var temp = "SALE STARTS IN " + tempNumber + " DAY" }
                else { var temp = "SALE STARTS IN " + tempNumber + " DAYS" }
                el.querySelector(".js-timer").innerText = temp;
            }
            else {
                var tempNumber = Math.floor((toLaunchDistance % (day)) / (hour));
                if (tempNumber == 1) { var temp = "SALE STARTS IN " + tempNumber + " HOUR" }
                else { var temp = "SALE STARTS IN " + tempNumber + " HOURS" }
                el.querySelector(".js-timer").innerText = temp;
            }
        } else {        
            if (Math.floor(distance / (day)) != 0) {
                if (window.DaysOrHours == "Hours") {
                    var tempNumber = Math.floor((distance % (day)) / (hour));
                    var tempDays = Math.floor(distance / (day)) + 1;
                    if (tempNumber == 1) { var temp = "Sale ends in " + tempNumber + " hour" }
                    else { var temp = "Sale ends in " + tempDays + " days & " + tempNumber + " hours" }
                    el.querySelector(".js-timer").innerText = temp;
                } else {
                    var tempNumber = Math.floor(distance / (day)) + 1;
                    if (tempNumber == 1) { var temp = "Sale ends in " + tempNumber + " day" }
                    else { var temp = "Sale ends in " + tempNumber + " days" }
                    el.querySelector(".js-timer").innerText = temp;
                }
            } else {
                var tempNumber = Math.floor((distance % (day)) / (hour));
                if (tempNumber == 1) { var temp = "Sale ends in " + tempNumber + " hour" }
                else { var temp = "Sale ends in " + tempNumber + " hours" }
                el.querySelector(".js-timer").innerText = temp;
            }

        }

        el.querySelector(".timer-block__num").style.backgroundColor = tp_label_color;

    });


});
