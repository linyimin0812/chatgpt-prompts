// ==UserScript==
// @name                chatgpt-prompts
// @namespace           https://github.com/linyimin0812/chatgpt-prompts
// @supportURL          https://github.com/linyimin0812/chatgpt-prompts
// @updateURL           https://github.com/linyimin0812/chatgpt-prompts/blob/main/chatgpt-prompt.user.js
// @downloadURL         https://cdn.jsdelivr.net/gh/linyimin0812/chatgpt-prompt@v0.0.4/chatgpt-prompt.user.js
// @version             1.0
// @author              linyimin
// @description:zh-CN   在 ChatGPT 输入框中输入 '/' 时列出提示词
// @require             https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.6.4.min.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.12/js/select2.min.js
// @resource css        https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.12/css/select2.min.css
// @match               https://chat.openai.com/*
// @grant               GM_addStyle
// @grant               GM_getResourceText
// ==/UserScript==

(function() {

    // TODO: 2. generate an icon
    // TODO: 3. prompts
    // TODO: 4. usage

    'use strict';

    const cdnUrl = 'https://cdn.jsdelivr.net/gh/linyimin0812/chatgpt-prompt@v0.0.4/assets'

    var language = navigator.language;
    const defaultLanguage = 'en-US';

    fetch(`${cdnUrl}/prompt-${language}.js`).then(response => {
        if (!response.ok) {
            if (language !== defaultLanguage) {
                alert(`Use the default language: ${defaultLanguage} for the prompts of language: ${language} is exist.`);
            } else {
                alert(`prompts is not exist, plase check if the cdn: ${cdnUrl} is available.`)
            }
        }
    }).catch(error => {
        alert('fetch prompt from cdn error:' + error);
    });

    const script = document.createElement('script');

    script.src = `${cdnUrl}/prompt-${defaultLanguage}.js`;

    script.onload = function() {

        const promptTextareaMap = new Map();

        document.addEventListener('keydown', function(event) {
            const promptTextarea = document.getElementById('prompt-textarea');
            const dropdownVisible = promptTextareaMap.get(promptTextarea);
            if (event.key === 'Escape' && dropdownVisible) {
                hideDropdown();
                promptTextarea.focus();
            }
        });

        setInterval(() => {

            const promptTextarea = document.getElementById('prompt-textarea');
            
            if (promptTextarea && !promptTextareaMap.has(promptTextarea)) {

                promptTextareaMap.set(promptTextarea, false);

                promptTextarea.addEventListener('input', function(event) {
                    const value = event.target.value.trim();

                    const dropdownVisible = promptTextareaMap.get(event.target);

                    if (value === '/') {
                        if (!dropdownVisible) {
                            showDropdown();
                        }
                    } else {
                        if (dropdownVisible) {
                            hideDropdown();
                        }
                    }
                });
            }

        }, 1000);

        function showDropdown() {

            const promptTextarea = document.getElementById('prompt-textarea');
            promptTextareaMap.set(promptTextarea, true);

            const dropdownContainer = document.createElement('div');
            dropdownContainer.id = 'prompt-dropdown-container';
            dropdownContainer.classList.add('custom-dropdown-container');

            const dropdown = document.createElement('select');
            dropdown.id = 'prompt-dropdown';
            dropdown.classList.add('custom-dropdown');

            const placeholderOption = document.createElement('option');
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            placeholderOption.hidden = true;
            dropdown.add(placeholderOption);

            for (const prompt of CHAT_GPT_PROMPTS) {
                const option = document.createElement('option');
                option.text = prompt.label;
                option.value = prompt.value;
                dropdown.add(option);
            }

            dropdownContainer.appendChild(dropdown);
            document.body.appendChild(dropdownContainer);

            const $select = $(dropdown);
            $select.select2();

            setThemeColor();

            $select.on('select2:close', function (e) {
                if (e.target.selectedIndex <= 0) {
                    return;
                }

                const promptTextarea = document.getElementById('prompt-textarea');

                hideDropdown();

                promptTextarea.focus();
                promptTextarea.value = e.target.options[e.target.selectedIndex].value;
                promptTextarea.style.overflowY = 'auto';
                
            });

            positionDropdown();

            $select.select2('open');
            setTimeout(() => {document.querySelector('.select2-search__field').focus()}, 100);

        }

        function hideDropdown() {
            const dropdownContainer = document.getElementById('prompt-dropdown-container');
            if (dropdownContainer) {
                dropdownContainer.remove();
            }
            const promptTextarea = document.getElementById('prompt-textarea');
            promptTextareaMap.set(promptTextarea, false);
        }

        function positionDropdown() {

            const dropdownContainer = document.getElementById('prompt-dropdown-container');
            if (!dropdownContainer) {
                return;
            }

            const promptTextarea = document.getElementById('prompt-textarea');

            const textareaRect = promptTextarea.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            dropdownContainer.style.top = '';
            dropdownContainer.style.bottom = windowHeight - textareaRect.top + 'px';
            dropdownContainer.style.maxHeight = textareaRect.top + 'px';

            dropdownContainer.style.left = textareaRect.left + 'px';
            dropdownContainer.style.width = textareaRect.width + 'px';
        }

        function setThemeColor() {
            const computedStyle = getComputedStyle(document.querySelector('html'));
            const scheme = computedStyle.getPropertyValue('color-scheme');
            const color = scheme === 'light' ? 'white' : 'grey';

            GM_addStyle(`
                    .select2-results__options {
                        background-color: ${color};
                    }
            `);

        }

        window.addEventListener('resize', function() {
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

        GM_addStyle(GM_getResourceText('css'));
    };

    document.head.appendChild(script);

})();