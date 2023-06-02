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
// @resource css        https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.12/css/select2.dark.min.css
// @match               https://chat.openai.com/*
// @grant               GM_addStyle
// @grant               GM_getResourceText
// ==/UserScript==

(function() {

    // TODO: 1. 切换chat时失效
    // TODO: 2. generate an icon
    // TODO: 3. prompts
    // TODO: 4. usage
    // TODO: 5. mode

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

        var dropdownVisible = false;
        var promptTextarea = null;

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && dropdownVisible) {
                hideDropdown();
                promptTextarea.focus();
            }
        });

        // 等待元素加载完毕
        function waitForElementToLoad() {

            promptTextarea = document.getElementById('prompt-textarea');
            
            if (promptTextarea) {
                promptTextarea.addEventListener('input', function(event) {
                    const value = event.target.value.trim();
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
            } else {
                setTimeout(waitForElementToLoad, 500); // 等待0.5秒后再次尝试
            }
        }

        waitForElementToLoad();

        function showDropdown() {

            dropdownVisible = true;

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

            $select.on('select2:close', function (e) {
                if (e.target.selectedIndex <= 0) {
                    return;
                }

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
            var dropdownContainer = document.getElementById('prompt-dropdown-container');
            if (dropdownContainer) {
                dropdownContainer.remove();
            }
            dropdownVisible = false;
        }

        function positionDropdown() {
            var dropdownContainer = document.getElementById('prompt-dropdown-container');
            if (!dropdownContainer || !promptTextarea) {
                return;
            }

            var textareaRect = promptTextarea.getBoundingClientRect();
            var windowHeight = window.innerHeight;

            dropdownContainer.style.top = '';
            dropdownContainer.style.bottom = windowHeight - textareaRect.top + 'px';
            dropdownContainer.style.maxHeight = textareaRect.top + 'px';

            dropdownContainer.style.left = textareaRect.left + 'px';
            dropdownContainer.style.width = textareaRect.width + 'px';
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