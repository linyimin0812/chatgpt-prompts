// ==UserScript==
// @name         ChatGPT 提示词
// @namespace    your-namespace
// @version      1.0
// @description  在 ChatGPT 输入框中输入 "/" 时列出提示词
// @require      https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.6.4.min.js
// @match        https://chat.openai.com/
// @match        https://chat.openai.com/c/*
// @match        https://chat.openai.com/?*
// @grant        GM_addStyle
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.8/js/select2.min.js
// @resource css https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.8/css/select2.min.css
// ==/UserScript==

(function() {

    'use strict';

    var dropdownVisible = false;
    var currentOptionIndex = 0;

    // 等待元素加载完毕
    function waitForElementToLoad() {
        var textarea = document.getElementById("prompt-textarea");
        if (textarea) {
            textarea.addEventListener("input", function(event) {
                var value = event.target.value.trim();
                if (value === "/") {
                    if (!dropdownVisible) {
                        showDropdown(textarea);
                        dropdownVisible = true;
                    }
                } else {
                    if (dropdownVisible) {
                        hideDropdown();
                        dropdownVisible = false;
                    }
                }
            });

            textarea.addEventListener("keydown", function(event) {
                if (dropdownVisible) {
                    handleDropdownNavigation(event);
                }
            });

        } else {
            setTimeout(waitForElementToLoad, 500); // 等待0.5秒后再次尝试
        }
    }

    waitForElementToLoad();

    function handleDropdownNavigation(event) {
        console.log(event.key)
        if (event.key === "ArrowDown") {
            event.preventDefault();
            highlightNextOption(event);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            highlightPreviousOption(event);
        } else if (event.key === "Enter") {
            handleEnterKey(event);
        }
    }

    function highlightNextOption() {
        var dropdown = document.getElementById("prompt-dropdown");
        var optionsCount = dropdown.options.length;

        if (currentOptionIndex < optionsCount - 1) {
            currentOptionIndex++;
        }

        updateHighlightedOption(event);
    }

    function highlightPreviousOption(event) {
        if (currentOptionIndex > 0) {
            currentOptionIndex--;
        }

        updateHighlightedOption(event);
    }

    function updateHighlightedOption(event) {
        var dropdown = document.getElementById("prompt-dropdown");

        for (var i = 0; i < dropdown.options.length; i++) {
            dropdown.options[i].selected = (i === currentOptionIndex);
        }

        event.currentTarget.value = dropdown.options[currentOptionIndex].value;;

    }

    function handleEnterKey(event) {
        event.preventDefault();
        if (currentOptionIndex !== -1) {
            var dropdown = document.getElementById("prompt-dropdown");
            var selectedValue = dropdown.options[currentOptionIndex].value;
            event.currentTarget.value = selectedValue;
            hideDropdown();
        }
    }


    function showDropdown(textarea) {
        var dropdownContainer = document.createElement("div");
        dropdownContainer.id = "prompt-dropdown-container";
        dropdownContainer.classList.add("custom-dropdown-container");

        var dropdown = document.createElement("select");
        dropdown.id = "prompt-dropdown";
        dropdown.classList.add("custom-dropdown");

        dropdown.addEventListener("change", function(event) {
            var selectedValue = event.target.value;
            textarea.value = selectedValue;
            hideDropdown();
        });

        var option1 = document.createElement("option");
        option1.label="选项1";
        option1.value="Hello World1"
        dropdown.add(option1);

        var option2 = document.createElement("option");
        option2.label="选项2";
        option2.value="Hello World2"
        dropdown.add(option2);

        dropdown.size = dropdown.options.length;

        dropdownContainer.appendChild(dropdown);
        document.body.appendChild(dropdownContainer);

        // $('#prompt-dropdown').select2();

        positionDropdown(textarea);
    }

    function hideDropdown() {
        var dropdownContainer = document.getElementById("prompt-dropdown-container");
        if (dropdownContainer) {
            dropdownContainer.remove();
            currentOptionIndex = 0;
        }
    }

    function positionDropdown(textarea) {
        var dropdownContainer = document.getElementById("prompt-dropdown-container");
        if (!dropdownContainer) {
            return;
        }

        var textareaRect = textarea.getBoundingClientRect();
        var windowHeight = window.innerHeight;

        dropdownContainer.style.top = "";
        dropdownContainer.style.bottom = windowHeight - textareaRect.top + "px";
        dropdownContainer.style.maxHeight = textareaRect.top + "px";

        dropdownContainer.style.left = textareaRect.left + "px";
        dropdownContainer.style.width = textareaRect.width + "px";
    }

    window.addEventListener("resize", function() {
        positionDropdown();
    });

    GM_addStyle(`
        .custom-dropdown-container {
            position: absolute;
            z-index: 9999;
        }

        .custom-dropdown {
            width: 100%;
            background: #fff;
            border: 0px;
            padding: 4px;
            font-family: inherit;
            font-size: inherit;
            color: inherit;
            box-sizing: border-box;
            overflow-y: auto;
        }
    `);

})();