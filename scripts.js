// Get the URL parameters
var urlParams = window.location.search;
// Store the parameters as variables
var paramFormType = getUrlParameter("formType", urlParams);
var paramScore = getUrlParameter("score", urlParams);
var paramOrder = getUrlParameter("order", urlParams);
var paramStore = getUrlParameter("store", urlParams);
var paramDaktela = getUrlParameter("daktela", urlParams);

// Do nothing in case the mandatory parameters are missing (formType4 doesn't have any)
if ((paramFormType === "" || paramScore === "" || paramOrder === "") && paramFormType !== "4") {
    return;
}

var self = this;
document.querySelector(".spinner").remove();
document.querySelector("#main").insertAdjacentHTML("afterbegin", self.html);
document.querySelector("#main").insertAdjacentHTML("afterbegin", "<style>" + self.style + "</style>");

var form = document.querySelector(".nps__form");
var thanksMessage = document.querySelector(".nps__thanks");
// Thank you message alternate subheader should be hidden by default
thanksMessage.querySelectorAll(".nps__subheader")[1].style.display = "none";
var questionsWrapper = document.querySelector(".nps__questions-wrapper");
var formType1 = {
    questions: [
        {
            text: "Jak jste byli spokojeni s rychlostí doručení vaší objednávky?",
            hints: ["stále nedorazila", "nijak zvlášť", "nevím", "docela ano", "nad očekávání"]
        },
        {
            text: "Líbilo se vám, jak byl balíček zabalený?",
            hints: ["nelíbilo", "nic moc", "nevím", "hezké", "perfektní"]
        },
        {
            text: "Bylo zboží v objednávce v pořádku?",
            hints: ["ne", "mám pár výhrad", "nevím", "spíše ano", "naprosto"]
        }
    ]
}

var formType2 = {
    questions: [
        {
            text: "Bylo zboží v objednávce v pořádku?",
            hints: ["ne", "mám pár výhrad", "nevím", "spíše ano", "naprosto"]
        },
        {
            text: "Vyhovovala vám dostupnost prodejny?",
            hints: ["vůbec", "nijak zvlášť", "nevím", "vcelku ano", "velice"]
        },
        {
            text: "Jak se vám líbilo v naší prodejně?",
            hints: ["vůbec", "nijak zvlášť", "nevím", "docela ano", "super"]
        },
        {
            text: "Jak se k vám choval náš personál?",
            hints: ["nepříjemně", "bez zájmu", "nevím", "příjemně", "nadstandardně"]
        },
        {
            text: "Byli jste spokojeni s rychlostí vyřízení objednávky na prodejně?",
            hints: ["vůbec", "nijak zvlášť", "nevím", "docela ano", "velice"]
        }
    ]
}

var formType3 = {
    questions: [
        {
            text: "Oslovil vás personál po vstupu do prodejny?",
            hints: ["ne", "nevím", "ano"]
        },
        {
            text: "Byli jste spokojeni s obsluhou?",
            hints: ["ne", "nevím", "ano"]
        },
        {
            text: "Našli jste u nás produkt, který jste hledali?",
            hints: ["ne", "nevím", "ano"]
        },
        {
            text: "Líbila se vám celková atmosféra na prodejně?",
            hints: ["ne", "nevím", "ano"]
        }
    ],
    isSingleAnswer: true
}

var formType4 = {
    header: "Ohodnoťte prosím vaši poslední zkušenost s naším operátorem.",
    questions: [
        {
            text: "Sdělil vám operátor veškeré informace naprosto srozumitelně?",
            hints: ["ne", "spíš ne", "nevím", "spíš ano", "ano"]
        },
        {
            text: "Vedl telefonát s operátorem k vyřešení vašeho problému?",
            hints: ["ne", "spíš ne", "nevím", "spíš ano", "ano"]
        },
        {
            text: "Vystupoval operátor příjemně?",
            hints: ["ne", "spíš ne", "nevím", "spíš ano", "ano"]
        },
        {
            text: "Chtěli byste v budoucnu mluvit se stejným operátorem?",
            hints: ["ne", "spíš ne", "nevím", "spíš ano", "ano"]
        }
    ]
}

// Show thank you message in case the user has already filled the form
if ((getCookie("npsForm4") === "1" && paramFormType === "4") || (getCookie("npsForm3") === "1" && paramFormType === "3") || (getCookie("npsForm2") === "1" && (paramFormType === "1" || paramFormType === "2")) || (getCookie("npsForm1") === "1" && (paramFormType === "1" || paramFormType === "2"))) {
    form.remove();
    // Display the alternate subheader
    thanksMessage.querySelectorAll(".nps__subheader")[0].style.display = "none";
    thanksMessage.querySelectorAll(".nps__subheader")[1].style.display = "block";
    return;
}

// Show the form only if the score is lower than 8, otherwise display a thank you message
if (paramScore < 8) {
    thanksMessage.style.display = "none";
    switch (paramFormType) {
    case "1":
        initializeForm(formType1);
        break;
    case "2":
        initializeForm(formType2);
        break;
    case "3":
        initializeForm(formType3);
        break;
    case "4":
        form.querySelector(".nps__header").innerHTML = formType4.header;
        form.querySelector(".nps__subheader").remove();
        initializeForm(formType4);
        break;
	}
}
else {
    form.remove();
}

// Track the score and create the "npsForm" cookie (useful if the user won't answer any of the questions)
if (paramFormType === "4" && !getCookie("npsScore4")) {
    self.sdk.track("npsScore", {
        "formType": paramFormType,
        "npsScore": paramScore,
        "orderId": paramOrder,
        "store": paramStore,
        "daktelaId": paramDaktela
    });
    setCookie("npsScore" + paramFormType, 1, 90);
}
else if ((paramFormType === "3" && !getCookie("npsScore3")) || (paramFormType === "2" && !(getCookie("npsScore1") || getCookie("npsScore2"))) || (paramFormType === "1" && !(getCookie("npsScore1") || getCookie("npsScore2")))) {
    self.sdk.track("npsScore", {
        "formType": paramFormType,
        "npsScore": paramScore,
        "orderId": paramOrder,
        "store": paramStore,
        "daktelaId": paramDaktela
    });
    setCookie("npsScore" + paramFormType, 1, 180);
}

form.querySelector("#submit").addEventListener("click", function (e) {
    e.preventDefault();
    this.classList.add("btn--loading");

    var selectedLabels = form.querySelectorAll(".nps__label--selected");
    // Shake ratings in case none of the answers is filled
    if (selectedLabels.length === 0) {
        var ratings = form.querySelectorAll(".nps__question-rating");
        ratings.forEach(function (rating) {
            shakeRatings(rating, 100);
        });
    }
    else {
        // Track the details of each question that has been answered
        selectedLabels.forEach(function (label) {
            self.sdk.track("npsForm", {
                "questionNumber": label.querySelector("input:checked").name,
                "question": label.parentNode.parentNode.querySelector(".nps__question-text").innerText,
                "rating": label.querySelector("input:checked").value,
                "formType": paramFormType,
                "npsScore": paramScore,
                "orderId": paramOrder,
                "store": paramStore,
                "daktelaId": paramDaktela
            });
        });

        // Create the "npsForm" cookie
        if (paramFormType === "4") {
            setCookie("npsForm" + paramFormType, 1, 90);
        }
        else {
            setCookie("npsForm" + paramFormType, 1, 180);
        }

        setTimeout(function () {
            form.remove();
            thanksMessage.style.display = "block";
            // Display the alternate subheader
            thanksMessage.querySelectorAll(".nps__subheader")[0].style.display = "none";
            thanksMessage.querySelectorAll(".nps__subheader")[1].style.display = "block";
            window.scrollTo(0, 0);
        }, 1000);
    }
});

function getUrlParameter(keyword, query_string) {
    keyword = keyword.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp(keyword + '=([^&#]*)');
    var results = regex.exec(query_string);

    if (results === null) {
        return '';
    }
    else {
        try {
            var param = decodeURIComponent(results[1].replace(/\+/g, ' '));
            return param;
        } catch (error) {
            console.error(error);
            return '';
        }
    }
}

function getCookie(name) {
    var value = `; ${document.cookie}`;
    var parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function initializeForm(formType) {
    formType.questions.forEach(function (question, index) {
        // Fill in the text for each question
        var nps__questionText = document.createElement("div");
        nps__questionText.classList.add("nps__question-text");
        nps__questionText.innerText = question.text;
        // Create the rating and hints wrappers
        var nps__questionRating = document.createElement("div");
        nps__questionRating.classList.add("nps__question-rating");
        var nps__hint = document.createElement("div");
        nps__hint.classList.add("nps__hint");
        // Fill the hint with non-breaking space
        nps__hint.innerText = "\xa0";
        // Create the labels
        for (var i = question.hints.length; i > 0; i--) {
            var nps__label = document.createElement("label");
            nps__label.classList.add("nps__label");
            nps__questionRating.appendChild(nps__label);
            // Append a label to each input
            var input = document.createElement("input");
            input.setAttribute("type", "radio");
            input.setAttribute("id", "q" + (index + 1) + "a" + (i));
            input.setAttribute("name", (index + 1));
            input.setAttribute("value", (i));
            nps__label.appendChild(input);
            // Append a star SVG to each input
            var nps__star = document.querySelector(".nps__star");
            nps__label.appendChild(nps__star.cloneNode(true));
            // Display proper hint on hover
            nps__label.addEventListener("mouseenter", function () {
                nps__hint.innerText = question.hints[getLabelIndex(this)];
                this.parentNode.classList.add("nps__question-rating--hover");
            });
            nps__label.addEventListener("mouseleave", function () {
                if (hasSelectedLabel(this.parentNode)) {
                    nps__hint.innerText = question.hints[getLabelIndex(this.parentNode.querySelector(".nps__label--selected"))];
                }
                else {
                    nps__hint.innerText = "\xa0";
                }
                this.parentNode.classList.remove("nps__question-rating--hover");
            });
            // Select the label on click
            nps__label.addEventListener("click", function () {
                this.parentNode.querySelectorAll(".nps__label").forEach(function (label) {
                    label.classList.remove("nps__label--selected");
                });
                this.classList.add("nps__label--selected");
            });
        }
        // Mark a special "single answer" case
        if (formType.isSingleAnswer) {
            nps__questionRating.classList.add("nps__question-rating--single-answer");
        }
        // Hint wrapper needs to be the last element
        nps__questionRating.appendChild(nps__hint);
        // Wrap each question text and rating into the parent div
        var nps__question = document.createElement("div");
        nps__question.classList.add("nps__question");
        nps__question.appendChild(nps__questionText);
        nps__question.appendChild(nps__questionRating);
        questionsWrapper.appendChild(nps__question);
    });
}

// Function to detect which label is hovered over
function getLabelIndex(label) {
    var nodes = label.parentNode.querySelectorAll(".nps__label");
    return nodes.length - Array.prototype.indexOf.call(nodes, label) - 1;
}

// Function to detect if any of the labels is selected
function hasSelectedLabel(rating) {
    var result = false;

    rating.querySelectorAll(".nps__label").forEach(function (label) {
        if (label.classList.contains("nps__label--selected")) {
            result = true;
        }
    });

    return result;
}

// Function that runs the shake animation
function shakeRatings(element, timeout) {
    setTimeout(function () {
        element.classList.add("nps__question-rating--shake");
    }, timeout);
    setTimeout(function () {
        element.classList.remove("nps__question-rating--shake");
    }, timeout + 500);
}

function getEventProperties(action, interactive) {
    return { action: action, banner_id: self.data.banner_id, banner_name: self.data.banner_name, banner_type: self.data.banner_type, variant_id: self.data.variant_id, variant_name: self.data.variant_name, interaction: interactive !== false ? true : false, location: window.location.href, path: window.location.pathname };
}