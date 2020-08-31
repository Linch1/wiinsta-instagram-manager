window.addEventListener('load', start);

function start(){
    Element.prototype.hc = function(a) {
        return (new RegExp(" " + a + " ")).test(" " + this.className + " ")
    };
    Element.prototype.tc = function(a) {
        var b = " " + this.className.replace(/[\t\r\n]/g, " ") + " ";
        if (this.hc(a)) {
            for (; 0 <= b.indexOf(" " + a + " ");) b = b.replace(" " + a + " ", " ");
            this.className = b.replace(/^\s+|\s+$/g, " ")
            $('.selectem-items').css("pointer-events", "none");
        } else {
            $('.selectem-items').css("pointer-events", "all");
            this.className += " " + a;
        }
        return this
    };

    [].forEach.call(document.querySelectorAll(".selectem"), function(a) {
        var b = a.querySelectorAll("li"),
            e = a.querySelector(".selectem_label");
        a.querySelector(".selectem_dropdown");
        var g = a.querySelector(".selectem-value"),
            f = a.querySelector("[data-filter]");
        e.addEventListener("click", function() {
            a.tc("is-active")
        }, !1);
        let selectem = $(".selectem");

    });
    $("body").click( evt => {
        let target = $(evt.target);
        let is_not_dropdown_elem = !target.closest(".selectem").length; // check if it has atleast one parent with selectem class
        let li_elem = target.closest('.selectem-items li')
        if (li_elem.length){
            let parent = li_elem.closest(".selectem");
            var b = li_elem.attr("data-val"),
            c = li_elem.find(".item-label");

            parent.find(".selectem-value").val(b);
            parent.find(".selectem-value").change();

            parent.find(".selectem_label .name").text(c.text());
        } else if(is_not_dropdown_elem){
            let active = $('.selectem.profiles.is-active');
            if(active.length){
                active.removeClass("is-active");
                $('.selectem-items').css("pointer-events", "none");
            } 
        }
        return;
    });
}